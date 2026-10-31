/**
 * Unified Gap Detection Engine Orchestrator.
 * Coordinates LLM extraction (Gemini with Heuristic basic-mode fallback),
 * deterministic quote verification, matrix computation, conflict normalization,
 * decision readiness scoring, and verify-next checklist generation.
 */

import {
  AnalysisResult,
  Claim,
  CoverageStatus,
  DimensionCellCoverage,
  Finding,
  Source,
} from "@/types";
import { GeminiAdapter } from "./gemini";
import { runHeuristicAnalysis } from "./heuristic";
import { verifyQuoteInSource } from "../analysis/quote-verifier";
import { normalizeConflicts } from "../analysis/conflicts";
import { computeDecisionReadinessScore } from "../analysis/scoring";
import { generateChecklist } from "../analysis/checklist";

export interface RunEngineOptions {
  topic: string;
  sources: Source[];
}

export async function runGapDetectionEngine({
  topic,
  sources,
}: RunEngineOptions): Promise<AnalysisResult> {
  let isBasicMode = false;
  let rawResult;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const gemini = new GeminiAdapter(apiKey);
      rawResult = await gemini.analyze(
        topic,
        sources.map((s) => ({ id: s.id, title: s.title, rawText: s.rawText }))
      );
    } catch (err) {
      console.warn("Gemini analysis failed or rate limited; falling back to basic heuristic engine.", err);
      isBasicMode = true;
      rawResult = await runHeuristicAnalysis(topic, sources);
    }
  } else {
    isBasicMode = true;
    rawResult = await runHeuristicAnalysis(topic, sources);
  }

  // 1. Strict Anti-Hallucination Quote Verification
  let totalClaims = 0;
  let verifiedClaims = 0;

  const verifiedClaimsList: Claim[] = rawResult.claims.map((rawClaim, idx) => {
    totalClaims++;
    const src = sources.find((s) => s.id === rawClaim.sourceId);
    let verified = false;
    let matchIndex = -1;
    let matchLength = 0;

    if (src && rawClaim.quote) {
      const v = verifyQuoteInSource(rawClaim.quote, src.rawText);
      verified = v.verified;
      matchIndex = v.matchIndex;
      matchLength = v.matchLength;
      if (verified) verifiedClaims++;
    }

    return {
      id: `claim-${idx + 1}`,
      dimensionId: rawClaim.dimensionId,
      sourceId: rawClaim.sourceId,
      statement: rawClaim.statement,
      evidence: {
        sourceId: rawClaim.sourceId,
        quote: rawClaim.quote,
        verified,
        matchIndex,
        matchLength,
      },
    };
  });

  // 2. Build Dimension Cell Coverage Matrix
  const matrix: DimensionCellCoverage[] = [];

  for (const dim of rawResult.dimensions) {
    for (const src of sources) {
      const matchingClaims = verifiedClaimsList.filter(
        (c) => c.dimensionId === dim.id && c.sourceId === src.id
      );

      let status: CoverageStatus = "MISSING";
      let summary = "No relevant information provided in this source.";

      if (src.isStale) {
        status = "OUTDATED";
        summary = `Information from outdated cycle (${src.extractedCycle || "archived"}).`;
      } else if (matchingClaims.length > 0) {
        const anyVerified = matchingClaims.some((c) => c.evidence.verified);
        if (anyVerified) {
          status = "COVERED";
          summary = matchingClaims[0].statement;
        } else {
          status = "PARTIAL";
          summary = "Mentioned with unverified or partial statements.";
        }
      }

      matrix.push({
        dimensionId: dim.id,
        sourceId: src.id,
        status,
        summary,
        claims: matchingClaims,
      });
    }
  }

  // Check if any dimension is marked conflicting in the findings
  const conflictDimIds = new Set(rawResult.conflicts.map((c) => c.dimensionId));
  for (const cell of matrix) {
    if (conflictDimIds.has(cell.dimensionId) && cell.status !== "MISSING" && cell.status !== "OUTDATED") {
      cell.status = "CONFLICTING";
      cell.summary = "Contradictory values detected across compared sources.";
    }
  }

  // 3. Process Findings & Label Enforcement (Strict Three-Label System)
  const findings: Finding[] = rawResult.findings.map((f, index) => {
    let label: Finding["label"] = "AI_SIGNAL";

    if (f.quote) {
      const src = sources.find((s) => f.sourceIds.includes(s.id));
      if (src) {
        const v = verifyQuoteInSource(f.quote, src.rawText);
        label = v.verified ? "SOURCED" : "UNCERTAIN";
      } else {
        label = "UNCERTAIN";
      }
    } else {
      label = "AI_SIGNAL";
    }

    return {
      id: `find-${index + 1}`,
      type: f.type,
      dimensionId: f.dimensionId,
      title: f.title,
      description: f.description,
      label,
      severity: f.severity,
      confidence: f.confidence,
      sourceIds: f.sourceIds,
      evidence: f.quote
        ? [
            {
              sourceId: f.sourceIds[0],
              quote: f.quote,
              verified: label === "SOURCED",
            },
          ]
        : undefined,
      recommendedAction: f.recommendedAction,
    };
  });

  // 4. Normalize Conflicts
  const conflicts = normalizeConflicts(rawResult.conflicts, sources);

  // 5. Decision Readiness Score
  const score = computeDecisionReadinessScore({
    sources,
    expectedDimensions: rawResult.dimensions,
    matrix,
    findings,
    conflictsCount: conflicts.length,
    totalClaims,
    verifiedClaims,
  });

  // 6. Verify-Next Prioritized Checklist
  const checklist = generateChecklist(
    findings,
    conflicts,
    rawResult.dimensions,
    sources,
    topic
  );

  return {
    id: `analysis-${Date.now()}`,
    topic,
    timestamp: new Date().toISOString(),
    isBasicMode,
    sources,
    expectedDimensions: rawResult.dimensions,
    matrix,
    findings,
    conflicts,
    score,
    checklist,
    evidenceIntegrity: {
      totalClaims,
      verifiedClaims,
      percentage: totalClaims > 0 ? Math.round((verifiedClaims / totalClaims) * 100) : 100,
    },
    executiveSummary: {
      overview: rawResult.executiveOverview,
      criticalGapsCount: findings.filter((f) => f.type === "GAP" && f.severity === "CRITICAL").length,
      conflictsCount: conflicts.length,
      staleSourcesCount: sources.filter((s) => s.isStale).length,
    },
  };
}
