import { ExpectedDimension, Finding, ConflictItem, Claim } from "@/types";

export interface LLMAnalysisRawResult {
  dimensions: ExpectedDimension[];
  claims: {
    dimensionId: string;
    sourceId: string;
    statement: string;
    quote: string;
  }[];
  findings: {
    type: "GAP" | "CONFLICT" | "STALE" | "UNANSWERED";
    dimensionId?: string;
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    confidence: number;
    sourceIds: string[];
    quote?: string;
    recommendedAction?: string;
  }[];
  conflicts: {
    dimensionId: string;
    aspect: string;
    comparisons: {
      sourceId: string;
      statedValue: string;
      quote: string;
    }[];
    resolutionReasoning: string;
  }[];
  executiveOverview: string;
}

export interface LLMProvider {
  analyze(topic: string, sources: { id: string; title: string; rawText: string }[]): Promise<LLMAnalysisRawResult>;
}
