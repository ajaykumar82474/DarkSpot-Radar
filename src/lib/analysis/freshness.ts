/**
 * Freshness & Cycle Extractor - Deterministic date and cycle parser.
 * Identifies academic/scheme cycles (e.g. 2023-24, 2024-25, 2025-26), calendar dates,
 * and warns if content is referring to outdated or archived cycles.
 */

export interface FreshnessInfo {
  cycle?: string;
  date?: string;
  isStale: boolean;
  freshnessWarning?: string;
}

// Current benchmark year for active schemes/scholarships
const CURRENT_ACTIVE_YEAR = 2026;
const CURRENT_ACTIVE_CYCLE_START = 2025; // e.g. 2025-26 or 2026-27

/**
 * Extracts cycle patterns such as:
 * - 2023-24, 2023-2024, AY 2023-24, FY 2023-24
 * - 2024-25, 2024-2025
 * - 2025-26, 2026-27
 */
export function extractCycle(text: string): string | undefined {
  if (!text) return undefined;

  // Patterns like "2023-24", "2023-2024", "AY 2024-25", "Cycle 2023-24"
  const cycleRegex = /\b(?:AY|FY|Cycle|Session|Academic\s+Year)?\s*([12]\d{3})\s*[-/–]\s*([12]\d{3}|\d{2})\b/i;
  const match = text.match(cycleRegex);

  if (match) {
    const startYear = parseInt(match[1], 10);
    let endYearStr = match[2];
    if (endYearStr.length === 2) {
      endYearStr = `${String(startYear).slice(0, 2)}${endYearStr}`;
    }
    const endYear = parseInt(endYearStr, 10);

    // Validate sane year range (e.g. 2018 to 2030)
    if (startYear >= 2018 && startYear <= 2030 && (endYear === startYear + 1 || endYear === startYear)) {
      return `${startYear}-${match[2]}`;
    }
  }

  return undefined;
}

/**
 * Extracts publication/updated calendar dates:
 * - "Last updated: October 14, 2023"
 * - "Published: 2023-11-05"
 * - "Date: 15/08/2024"
 */
export function extractDate(text: string): string | undefined {
  if (!text) return undefined;

  // 1. ISO format: 2024-05-12 or 2024/05/12
  const isoMatch = text.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return isoMatch[0];
  }

  // 2. Textual month format: "14 October 2023" or "October 14, 2023"
  const textDateMatch = text.match(
    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/i
  );
  if (textDateMatch) {
    return textDateMatch[0];
  }

  const reverseDateMatch = text.match(
    /\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/i
  );
  if (reverseDateMatch) {
    return reverseDateMatch[0];
  }

  return undefined;
}

/**
 * Analyzes freshness of a source based on its raw text and metadata.
 */
export function analyzeFreshness(text: string): FreshnessInfo {
  const cycle = extractCycle(text);
  const date = extractDate(text);

  let isStale = false;
  let freshnessWarning: string | undefined;

  if (cycle) {
    const startYear = parseInt(cycle.slice(0, 4), 10);
    if (startYear < CURRENT_ACTIVE_CYCLE_START) {
      isStale = true;
      freshnessWarning = `Refers to an earlier cycle (${cycle}). Rules, deadlines and amounts may have changed.`;
    }
  } else if (date) {
    // Check if date year is older than previous calendar year
    const yearMatch = date.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      if (year <= CURRENT_ACTIVE_YEAR - 2) {
        isStale = true;
        freshnessWarning = `Published in ${year}. Information may be out of date.`;
      }
    }
  } else {
    freshnessWarning = "No publication date or scheme cycle found. Verify timeline before relying on this.";
  }

  return {
    cycle,
    date,
    isStale,
    freshnessWarning,
  };
}
