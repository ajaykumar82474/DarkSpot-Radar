/**
 * Deterministic Heuristic Engine.
 * Provides offline / fallback gap and contradiction detection when GEMINI_API_KEY is not configured
 * or when external LLM calls fail.
 */

import { ExpectedDimension } from "@/types";
import { LLMAnalysisRawResult } from "./types";

interface TopicTemplate {
  keywords: string[];
  dimensions: ExpectedDimension[];
}

const TEMPLATES: Record<string, TopicTemplate> = {
  scholarship: {
    keywords: ["scholarship", "fellowship", "stipend", "grant", "bursary", "pm-usp", "nsp"],
    dimensions: [
      { id: "dim-eligibility", name: "Eligibility & Academic Criteria", description: "Percentile, cutoff marks, or qualifying exam requirements.", importance: "CRITICAL" },
      { id: "dim-income", name: "Family Income Ceiling", description: "Parental/family income threshold and certifying revenue authority.", importance: "CRITICAL" },
      { id: "dim-documents", name: "Required Documents & KYC", description: "Mandatory certificates, Aadhaar seeding, and verification proofs.", importance: "CRITICAL" },
      { id: "dim-deadline", name: "Application Deadlines & Timeline", description: "Closing dates, submission periods, and institutional verification windows.", importance: "HIGH" },
      { id: "dim-renewal", name: "Renewal Policy & Continuation Rules", description: "Passing marks, attendance, and continuation rules for subsequent academic years.", importance: "CRITICAL" },
      { id: "dim-amount", name: "Disbursal Amount & Benefits", description: "Financial quantum per semester or year and DBT account mechanism.", importance: "HIGH" },
      { id: "dim-selection", name: "Selection & Quota Process", description: "State quotas, reservation categories, and ranking methodology.", importance: "MEDIUM" },
      { id: "dim-contact", name: "Helpdesk & Official Contacts", description: "Official support helpline, grievance redressal, and email contacts.", importance: "MEDIUM" },
    ],
  },
  admission: {
    keywords: ["admission", "college", "university", "entrance", "exam", "course", "degree", "seat"],
    dimensions: [
      { id: "dim-eligibility", name: "Prerequisites & Cutoffs", description: "Minimum marks, entrance exam percentiles, and subject criteria.", importance: "CRITICAL" },
      { id: "dim-fees", name: "Tuition Fees & Refund Policy", description: "Fee schedules, deposit requirements, and cancellation refund clauses.", importance: "CRITICAL" },
      { id: "dim-seats", name: "Seat Matrix & Quotas", description: "Total intake capacity, category reservations, and management quota rules.", importance: "HIGH" },
      { id: "dim-counseling", name: "Counseling & Allotment Procedure", description: "Choice filling, seat allotment rounds, and document verification timeline.", importance: "HIGH" },
      { id: "dim-accreditation", name: "Accreditation & Approvals", description: "UGC, AICTE, NAAC, or statutory council recognition status.", importance: "CRITICAL" },
      { id: "dim-hostel", name: "Hostel & Campus Facilities", description: "Accommodation availability, mess charges, and boarding rules.", importance: "MEDIUM" },
    ],
  },
  general: {
    keywords: [],
    dimensions: [
      { id: "dim-scope", name: "Core Eligibility & Objectives", description: "Who is qualified and what the initiative/proposal covers.", importance: "CRITICAL" },
      { id: "dim-cost", name: "Cost, Pricing & Penalties", description: "Fees, financial obligations, and hidden charges or forfeitures.", importance: "CRITICAL" },
      { id: "dim-timeline", name: "Deadlines & Milestones", description: "Important milestone dates, submission cutoffs, and processing times.", importance: "HIGH" },
      { id: "dim-requirements", name: "Prerequisites & Documentation", description: "Required approvals, licenses, or verification submissions.", importance: "CRITICAL" },
      { id: "dim-terms", name: "Renewal & Termination Terms", description: "Exit conditions, renewal prerequisites, and termination clauses.", importance: "CRITICAL" },
      { id: "dim-support", name: "Helpdesk & Escalation Channel", description: "Official contacts for grievances, questions, or formal disputes.", importance: "MEDIUM" },
    ],
  },
};

function selectDimensions(topic: string): ExpectedDimension[] {
  const lower = topic.toLowerCase();
  for (const [key, tpl] of Object.entries(TEMPLATES)) {
    if (key !== "general" && tpl.keywords.some((kw) => lower.includes(kw))) {
      return tpl.dimensions;
    }
  }
  return TEMPLATES.general.dimensions;
}

/**
 * Deterministically analyzes source texts using topic dimensions, regex, and sentence matching.
 */
export async function runHeuristicAnalysis(
  topic: string,
  sources: { id: string; title: string; rawText: string }[]
): Promise<LLMAnalysisRawResult> {
  const dimensions = selectDimensions(topic);
  const claims: LLMAnalysisRawResult["claims"] = [];
  const findings: LLMAnalysisRawResult["findings"] = [];
  const conflicts: LLMAnalysisRawResult["conflicts"] = [];

  // Match sentences in sources to dimensions
  for (const dim of dimensions) {
    const dimWords = dim.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    let matchedSourcesCount = 0;

    for (const src of sources) {
      const sentences = src.rawText.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 15);
      const matchedSentence = sentences.find((sent) => {
        const lowerSent = sent.toLowerCase();
        return dimWords.some((w) => lowerSent.includes(w));
      });

      if (matchedSentence) {
        matchedSourcesCount++;
        claims.push({
          dimensionId: dim.id,
          sourceId: src.id,
          statement: matchedSentence.slice(0, 160),
          quote: matchedSentence,
        });
      }
    }

    // If completely missing across all sources -> Critical Dark Spot Gap
    if (matchedSourcesCount === 0) {
      findings.push({
        type: "GAP",
        dimensionId: dim.id,
        title: `Information Dark Spot: ${dim.name} Not Found`,
        description: `None of the reviewed sources provide information regarding ${dim.name} (${dim.description}).`,
        severity: dim.importance,
        confidence: 0.9,
        sourceIds: sources.map((s) => s.id),
        recommendedAction: `Contact the administering authority directly to request written clarification on ${dim.name}.`,
      });
    }
  }

  // Cross-source conflict heuristic: Check for differing currency values or dates
  const moneyPattern = /(?:₹|Rs\.?|INR|\$)\s*(\d+(?:[.,]\d+)?\s*(?:lakh|crore|thousand|k)?)/gi;
  const detectedCurrencies: { sourceId: string; val: string; sentence: string }[] = [];

  for (const src of sources) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(moneyPattern);
    while ((match = regex.exec(src.rawText)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(src.rawText.length, match.index + 80);
      const snippet = src.rawText.substring(start, end).replace(/\s+/g, " ").trim();
      detectedCurrencies.push({
        sourceId: src.id,
        val: match[0],
        sentence: snippet,
      });
    }
  }

  // If different sources mention different money values for the same topic
  const uniqueVals = Array.from(new Set(detectedCurrencies.map((d) => d.val.toLowerCase().replace(/\s+/g, ""))));
  if (uniqueVals.length > 1 && sources.length > 1) {
    const comparisons = sources.slice(0, 3).map((s) => {
      const match = detectedCurrencies.find((d) => d.sourceId === s.id);
      return {
        sourceId: s.id,
        statedValue: match ? match.val : "Value not explicitly stated",
        quote: match ? match.sentence : s.title,
      };
    });

    conflicts.push({
      dimensionId: dimensions[1]?.id || dimensions[0].id,
      aspect: "Stated Monetary Figures / Thresholds",
      comparisons,
      resolutionReasoning: "Different sources cite differing financial amounts or income thresholds. Consult official notifications to verify active figures.",
    });

    findings.push({
      type: "CONFLICT",
      dimensionId: dimensions[1]?.id || dimensions[0].id,
      title: "Potential Contradiction in Stated Figures",
      description: `Discrepancies found across sources regarding financial limits or benefits.`,
      severity: "HIGH",
      confidence: 0.85,
      sourceIds: sources.map((s) => s.id),
      recommendedAction: "Cross-check the most recent official circular before finalizing your application or budget.",
    });
  }

  return {
    dimensions,
    claims,
    findings,
    conflicts,
    executiveOverview: `Basic deterministic gap analysis across ${sources.length} sources identified ${findings.length} potential information signals and ${conflicts.length} possible discrepancies.`,
  };
}
