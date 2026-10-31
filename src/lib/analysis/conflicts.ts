/**
 * Conflict Normalizer & Comparator.
 * Compares statements across sources for identical dimensions or aspects (e.g. Income Limit, Required Documents, Deadlines).
 * Ranks trustworthy sources based on Authority (Official > Secondary > Community) and Freshness.
 */

import { ConflictItem, Source, SourceAuthority } from "@/types";

interface RawConflictInput {
  dimensionId: string;
  aspect: string;
  comparisons: {
    sourceId: string;
    statedValue: string;
    quote: string;
  }[];
  resolutionReasoning?: string;
}

/**
 * Calculates a trust weight for a source based on its authority and freshness.
 */
export function calculateSourceTrustWeight(source: Source): number {
  let score = 0;
  if (source.authority === "OFFICIAL") score += 60;
  else if (source.authority === "SECONDARY") score += 30;
  else score += 10;

  if (source.isStale) {
    score -= 25;
  }
  return score;
}

/**
 * Normalizes raw detected conflicts into side-by-side structured items with authority rankings.
 */
export function normalizeConflicts(
  rawConflicts: RawConflictInput[],
  sources: Source[]
): ConflictItem[] {
  const sourceMap = new Map<string, Source>(sources.map((s) => [s.id, s]));

  return rawConflicts.map((c, index) => {
    const values = c.comparisons.map((comp) => {
      const src = sourceMap.get(comp.sourceId);
      return {
        sourceId: comp.sourceId,
        sourceTitle: src ? src.title : `Source ${comp.sourceId}`,
        authority: (src ? src.authority : "COMMUNITY_OR_UNKNOWN") as SourceAuthority,
        statedValue: comp.statedValue,
        quote: comp.quote,
        verified: false, // will be verified by quote verifier
        cycle: src?.extractedCycle,
      };
    });

    // Find highest trusted source
    let bestSourceId: string | undefined;
    let maxWeight = -Infinity;

    for (const val of values) {
      const src = sourceMap.get(val.sourceId);
      if (src) {
        const weight = calculateSourceTrustWeight(src);
        if (weight > maxWeight) {
          maxWeight = weight;
          bestSourceId = src.id;
        }
      }
    }

    const bestSource = bestSourceId ? sourceMap.get(bestSourceId) : undefined;
    let reasoning = c.resolutionReasoning;

    if (!reasoning) {
      if (bestSource && bestSource.authority === "OFFICIAL" && !bestSource.isStale) {
        reasoning = `Suggest trusting "${bestSource.title}" as it is the official portal for the current cycle. Always verify directly before submission.`;
      } else if (bestSource && bestSource.isStale) {
        reasoning = `Warning: The highest-authority source ("${bestSource.title}") is marked stale or from an earlier cycle. Please consult the active helpline.`;
      } else {
        reasoning = `Competing claims identified across independent sources without a definitive official release. Direct institutional verification required.`;
      }
    }

    return {
      id: `conflict-${index + 1}`,
      dimensionId: c.dimensionId,
      aspect: c.aspect,
      values,
      suggestedTrustSourceId: bestSourceId,
      resolutionReasoning: reasoning,
    };
  });
}
