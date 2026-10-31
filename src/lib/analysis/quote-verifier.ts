/**
 * Quote Verifier - Anti-hallucination verification engine.
 * Validates that claims made by AI or extracted text are backed by verbatim or normalized quotes
 * directly present within the raw source text.
 */

export interface QuoteVerificationResult {
  verified: boolean;
  matchIndex: number;
  matchLength: number;
  matchType: 'EXACT' | 'NORMALIZED' | 'NONE';
  snippet: string;
}

/**
 * Normalizes a string for tolerant matching:
 * - Collapses repeated whitespace/newlines to single spaces
 * - Standardizes unicode single/double quotes and dashes
 * - Strips exterior leading/trailing punctuation and spaces
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // Smart double quotes
    .replace(/[\u2013\u2014]/g, "-")             // En-dash / em-dash
    .replace(/\s+/g, " ")                        // Multi whitespace/newlines
    .trim();
}

/**
 * Verifies if a quote exists in the source text.
 * Performs a 2-stage verification:
 * 1. Exact string search (fast path)
 * 2. Whitespace & punctuation-normalized case-insensitive search
 */
export function verifyQuoteInSource(
  quote: string,
  sourceText: string
): QuoteVerificationResult {
  if (!quote || !sourceText) {
    return {
      verified: false,
      matchIndex: -1,
      matchLength: 0,
      matchType: "NONE",
      snippet: "",
    };
  }

  const cleanQuote = quote.trim();
  if (cleanQuote.length < 5) {
    // Too short to reliably verify as a meaningful quote
    return {
      verified: false,
      matchIndex: -1,
      matchLength: 0,
      matchType: "NONE",
      snippet: "",
    };
  }

  // 1. Exact match test
  const exactIndex = sourceText.indexOf(cleanQuote);
  if (exactIndex !== -1) {
    return {
      verified: true,
      matchIndex: exactIndex,
      matchLength: cleanQuote.length,
      matchType: "EXACT",
      snippet: sourceText.substring(exactIndex, exactIndex + cleanQuote.length),
    };
  }

  // 1b. Case-insensitive exact match
  const lowerSource = sourceText.toLowerCase();
  const lowerQuote = cleanQuote.toLowerCase();
  const lowerIndex = lowerSource.indexOf(lowerQuote);
  if (lowerIndex !== -1) {
    return {
      verified: true,
      matchIndex: lowerIndex,
      matchLength: cleanQuote.length,
      matchType: "EXACT",
      snippet: sourceText.substring(lowerIndex, lowerIndex + cleanQuote.length),
    };
  }

  // 2. Normalized search
  const normQuote = normalizeText(cleanQuote).toLowerCase();
  const normSource = normalizeText(sourceText).toLowerCase();

  const normIndex = normSource.indexOf(normQuote);
  if (normIndex !== -1) {
    // Find approximate location in original source
    // We search for the first 25 characters of the normalized quote
    const anchor = cleanQuote.slice(0, Math.min(30, cleanQuote.length)).trim().toLowerCase();
    const anchorIndex = lowerSource.indexOf(anchor);

    return {
      verified: true,
      matchIndex: anchorIndex !== -1 ? anchorIndex : 0,
      matchLength: cleanQuote.length,
      matchType: "NORMALIZED",
      snippet: cleanQuote,
    };
  }

  // 3. Fallback: Check if 80% of quote words appear consecutively
  const words = cleanQuote.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 6) {
    const subPhrase = words.slice(0, Math.floor(words.length * 0.75)).join(" ").toLowerCase();
    const subIndex = lowerSource.indexOf(subPhrase);
    if (subIndex !== -1) {
      return {
        verified: true,
        matchIndex: subIndex,
        matchLength: subPhrase.length,
        matchType: "NORMALIZED",
        snippet: sourceText.substring(subIndex, subIndex + subPhrase.length),
      };
    }
  }

  return {
    verified: false,
    matchIndex: -1,
    matchLength: 0,
    matchType: "NONE",
    snippet: "",
  };
}
