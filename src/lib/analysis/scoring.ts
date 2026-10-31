/**
 * Decision Readiness Scoring Engine.
 * Computes an explainable 0-100 score evaluating whether a user has enough high-integrity,
 * consistent, fresh, and authoritative information to make a critical decision.
 */

import {
  DimensionCellCoverage,
  ExpectedDimension,
  Finding,
  ScoreBreakdown,
  Source,
} from "@/types";

export interface ScoreInputs {
  sources: Source[];
  expectedDimensions: ExpectedDimension[];
  matrix: DimensionCellCoverage[];
  findings: Finding[];
  conflictsCount: number;
  totalClaims: number;
  verifiedClaims: number;
}

export function computeDecisionReadinessScore(inputs: ScoreInputs): ScoreBreakdown {
  const {
    sources,
    expectedDimensions,
    matrix,
    conflictsCount,
    totalClaims,
    verifiedClaims,
  } = inputs;

  const penalties: string[] = [];

  // 1. Coverage Score (30% weight)
  // Evaluate how many expected dimensions have at least one COVERED or PARTIAL cell
  const totalDims = Math.max(1, expectedDimensions.length);
  let coveredDimCount = 0;
  let partialDimCount = 0;
  let missingCriticalCount = 0;

  for (const dim of expectedDimensions) {
    const cells = matrix.filter((c) => c.dimensionId === dim.id);
    const hasCovered = cells.some((c) => c.status === "COVERED");
    const hasPartial = cells.some((c) => c.status === "PARTIAL");

    if (hasCovered) {
      coveredDimCount++;
    } else if (hasPartial) {
      partialDimCount++;
    } else {
      if (dim.importance === "CRITICAL") {
        missingCriticalCount++;
      }
    }
  }

  const rawCoverage = ((coveredDimCount * 1.0 + partialDimCount * 0.5) / totalDims) * 100;
  const coverageScore = Math.min(100, Math.max(0, Math.round(rawCoverage)));

  if (missingCriticalCount > 0) {
    penalties.push(`- ${missingCriticalCount} critical decision dimension(s) completely missing from all reviewed sources`);
  }

  // 2. Agreement Score (25% weight)
  // Deduct 25 points for each conflicting aspect across sources
  const agreementDeductions = conflictsCount * 25;
  const agreementScore = Math.max(0, 100 - agreementDeductions);

  if (conflictsCount > 0) {
    penalties.push(`- ${conflictsCount} direct contradiction(s) found between sources (e.g. conflicting rules, fees, or documents)`);
  }

  // 3. Freshness Score (20% weight)
  const totalSources = Math.max(1, sources.length);
  let staleCount = 0;
  let undatedCount = 0;

  for (const s of sources) {
    if (s.isStale) staleCount++;
    else if (!s.extractedDate && !s.extractedCycle) undatedCount++;
  }

  const freshnessDeduction = (staleCount * 40 + undatedCount * 20) / totalSources;
  const freshnessScore = Math.min(100, Math.max(0, Math.round(100 - freshnessDeduction)));

  if (staleCount > 0) {
    penalties.push(`- ${staleCount} source(s) reference an earlier academic/scheme cycle`);
  }
  if (undatedCount > 0) {
    penalties.push(`- ${undatedCount} source(s) lack publication or cycle dates`);
  }

  // 4. Source Authority Score (15% weight)
  let officialCount = 0;
  let secondaryCount = 0;
  for (const s of sources) {
    if (s.authority === "OFFICIAL") officialCount++;
    else if (s.authority === "SECONDARY") secondaryCount++;
  }
  const authorityPoints = (officialCount * 100 + secondaryCount * 50) / totalSources;
  const authorityScore = Math.min(100, Math.max(0, Math.round(authorityPoints)));

  if (officialCount === 0) {
    penalties.push(`- No primary or official government/institutional domain reviewed`);
  }

  // 5. Evidence Integrity Score (10% weight)
  let evidenceIntegrityScore = 100;
  if (totalClaims > 0) {
    evidenceIntegrityScore = Math.round((verifiedClaims / totalClaims) * 100);
  } else {
    evidenceIntegrityScore = 50; // no claims extracted
  }

  const unverifiedClaimsCount = Math.max(0, totalClaims - verifiedClaims);
  if (unverifiedClaimsCount > 0) {
    penalties.push(`- ${unverifiedClaimsCount} claim(s) could not be matched verbatim to source text and were downgraded to UNCERTAIN`);
  }

  // Compute Weighted Final Score
  const weighted =
    coverageScore * 0.3 +
    agreementScore * 0.25 +
    freshnessScore * 0.2 +
    authorityScore * 0.15 +
    evidenceIntegrityScore * 0.1;

  const finalScore = Math.min(100, Math.max(0, Math.round(weighted)));

  // Generate Human Verdict
  let verdict = "";
  if (finalScore >= 80) {
    verdict = "High Readiness: High coverage with verified official references. Proceed to application with minor routine checks.";
  } else if (finalScore >= 55) {
    verdict = "Moderate Risk: Key gaps or conflicting requirements detected. Must clarify contradictions before submitting or relying on this information.";
  } else {
    verdict = "Critical Dark Spots: Decisive information is missing or contradictory across sources. Do not proceed without direct institutional confirmation.";
  }

  return {
    coverageScore,
    agreementScore,
    freshnessScore,
    authorityScore,
    evidenceIntegrityScore,
    finalScore,
    verdict,
    penalties,
  };
}
