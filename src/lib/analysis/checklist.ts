/**
 * Verify-Next Checklist Engine.
 * Converts gaps, conflicts, stale data warnings, and unanswered questions into a prioritized,
 * actionable checklist for the user.
 *
 * Priority Formula:
 *   Priority = Severity (1-4) x Uncertainty (1-3) x Decision Impact (1-3)
 */

import { ChecklistItem, ConflictItem, ExpectedDimension, Finding, Source } from "@/types";

const SEVERITY_WEIGHTS: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const LABEL_UNCERTAINTY: Record<string, number> = {
  UNCERTAIN: 3,
  AI_SIGNAL: 2,
  SOURCED: 1,
};

export function generateChecklist(
  findings: Finding[],
  conflicts: ConflictItem[],
  dimensions: ExpectedDimension[],
  sources: Source[],
  topic: string
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const officialSource = sources.find((s) => s.authority === "OFFICIAL");
  const officialContactInfo = officialSource
    ? `the official portal (${officialSource.title}${officialSource.url ? ` at ${officialSource.url}` : ""})`
    : "the official administering authority / department helpdesk";

  // 1. Process Conflicts (highest immediate hazard)
  for (const conflict of conflicts) {
    const dim = dimensions.find((d) => d.id === conflict.dimensionId);
    const severityVal = dim?.importance === "CRITICAL" ? 4 : 3;
    const uncertaintyVal = 3; // conflicting facts create peak uncertainty
    const impactVal = 3;      // high impact on decision

    const priorityScore = severityVal * uncertaintyVal * impactVal; // max 36

    const comparisonText = conflict.values
      .map((v) => `"${v.sourceTitle}" states ${v.statedValue}`)
      .join(" while ");

    items.push({
      id: `check-${conflict.id}`,
      findingId: conflict.id,
      dimensionId: conflict.dimensionId,
      priorityScore,
      task: `Resolve contradiction in ${conflict.aspect}: ${comparisonText}`,
      whyItMatters: `Submitting invalid or out-of-date parameters (e.g. incorrect documents or eligibility criteria) leads to immediate rejection or forfeiture.`,
      whereToCheck: officialContactInfo,
      helpdeskDraft: `Dear Helpdesk Team,\n\nI am preparing my submission for "${topic}". I noticed conflicting guidelines regarding ${conflict.aspect}: ${comparisonText}. Could you please confirm the definitive rule for the current cycle?\n\nThank you,\nApplicant`,
      completed: false,
    });
  }

  // 2. Process Findings (Gaps, Outdated Data, Missing Dimensions)
  for (const finding of findings) {
    const dim = dimensions.find((d) => d.id === finding.dimensionId);
    const severityVal = SEVERITY_WEIGHTS[finding.severity] || 2;
    const uncertaintyVal = LABEL_UNCERTAINTY[finding.label] || 2;
    const impactVal = dim?.importance === "CRITICAL" ? 3 : 2;

    const priorityScore = severityVal * uncertaintyVal * impactVal;

    let why = "Missing information prevents complete verification and can cause unforeseen disqualification.";
    if (finding.type === "GAP") {
      why = `This critical dimension (${finding.title}) is unaddressed across the analyzed sources. You may be missing mandatory clauses or prerequisites.`;
    } else if (finding.type === "STALE") {
      why = `Rules frequently change between cycles. Relying on past session guidelines may cause submission errors.`;
    }

    const taskText = finding.type === "GAP"
      ? `Verify missing dimension: ${finding.title}`
      : finding.type === "STALE"
      ? `Confirm latest cycle terms for: ${finding.title}`
      : `Clarify potential question: ${finding.title}`;

    items.push({
      id: `check-${finding.id}`,
      findingId: finding.id,
      dimensionId: finding.dimensionId,
      priorityScore,
      task: taskText,
      whyItMatters: why,
      whereToCheck: officialContactInfo,
      helpdeskDraft: `Dear Helpdesk Team,\n\nRegarding "${topic}", I am seeking clarification on ${finding.title}. Specifically: ${finding.description}. Could you please provide the official guidelines on this point?\n\nSincerely,\nApplicant`,
      completed: false,
    });
  }

  // Sort descending by priority score
  items.sort((a, b) => b.priorityScore - a.priorityScore);

  return items;
}

/**
 * Formats checklist as clean Markdown for export.
 */
export function exportChecklistToMarkdown(
  topic: string,
  items: ChecklistItem[],
  readinessScore: number
): string {
  const dateStr = new Date().toISOString().split("T")[0];
  let md = `# DarkSpot Radar - Verification Checklist\n\n`;
  md += `**Topic:** ${topic}  \n`;
  md += `**Generated:** ${dateStr}  \n`;
  md += `**Decision Readiness Score:** ${readinessScore}/100  \n\n`;
  md += `---\n\n`;
  md += `## Prioritized Action Items\n\n`;

  items.forEach((item, index) => {
    md += `### ${index + 1}. [ ] ${item.task} (Priority Score: ${item.priorityScore})\n`;
    md += `- **Why it matters:** ${item.whyItMatters}\n`;
    md += `- **Where to check:** ${item.whereToCheck}\n`;
    md += `- **Inquiry Draft:**\n`;
    md += `\`\`\`text\n${item.helpdeskDraft}\n\`\`\`\n\n`;
  });

  md += `---\n*Generated by DarkSpot Radar — AI-Assisted Information Gap Detection Engine*\n`;
  return md;
}
