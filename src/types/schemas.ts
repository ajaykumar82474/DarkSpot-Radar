/**
 * Zod validation schemas for API requests, LLM structured outputs, and data contracts.
 * Acts as the single source of truth for runtime validation.
 */

import { z } from "zod";

export const SourceAuthoritySchema = z.enum(["OFFICIAL", "SECONDARY", "COMMUNITY_OR_UNKNOWN"]);

export const DimensionImportanceSchema = z.enum(["CRITICAL", "HIGH", "MEDIUM"]);

export const ExpectedDimensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  importance: DimensionImportanceSchema,
});

export const ClaimEvidenceSchema = z.object({
  sourceId: z.string(),
  quote: z.string(),
  verified: z.boolean(),
  matchIndex: z.number().optional(),
  matchLength: z.number().optional(),
});

export const ClaimSchema = z.object({
  id: z.string(),
  dimensionId: z.string(),
  sourceId: z.string(),
  statement: z.string(),
  evidence: ClaimEvidenceSchema,
});

export const CoverageStatusSchema = z.enum(["COVERED", "PARTIAL", "MISSING", "CONFLICTING", "OUTDATED"]);

export const DimensionCellCoverageSchema = z.object({
  dimensionId: z.string(),
  sourceId: z.string(),
  status: CoverageStatusSchema,
  summary: z.string(),
  claims: z.array(ClaimSchema),
});

export const FindingTypeSchema = z.enum(["GAP", "CONFLICT", "STALE", "UNANSWERED"]);
export const FindingLabelSchema = z.enum(["SOURCED", "AI_SIGNAL", "UNCERTAIN"]);
export const FindingSeveritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const FindingSchema = z.object({
  id: z.string(),
  type: FindingTypeSchema,
  dimensionId: z.string().optional(),
  title: z.string(),
  description: z.string(),
  label: FindingLabelSchema,
  severity: FindingSeveritySchema,
  confidence: z.number().min(0).max(1),
  sourceIds: z.array(z.string()),
  evidence: z.array(ClaimEvidenceSchema).optional(),
  recommendedAction: z.string().optional(),
});

export const ConflictValueSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  authority: SourceAuthoritySchema,
  statedValue: z.string(),
  quote: z.string(),
  verified: z.boolean(),
  cycle: z.string().optional(),
});

export const ConflictItemSchema = z.object({
  id: z.string(),
  dimensionId: z.string(),
  aspect: z.string(),
  values: z.array(ConflictValueSchema),
  suggestedTrustSourceId: z.string().optional(),
  resolutionReasoning: z.string(),
});

export const ScoreBreakdownSchema = z.object({
  coverageScore: z.number().min(0).max(100),
  agreementScore: z.number().min(0).max(100),
  freshnessScore: z.number().min(0).max(100),
  authorityScore: z.number().min(0).max(100),
  evidenceIntegrityScore: z.number().min(0).max(100),
  finalScore: z.number().min(0).max(100),
  verdict: z.string(),
  penalties: z.array(z.string()),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  findingId: z.string().optional(),
  dimensionId: z.string().optional(),
  priorityScore: z.number(),
  task: z.string(),
  whyItMatters: z.string(),
  whereToCheck: z.string(),
  helpdeskDraft: z.string(),
  completed: z.boolean(),
});

export const AnalyzeRequestSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters"),
  sources: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      url: z.string().url().optional().or(z.literal("")),
      rawText: z.string().min(10, "Source text must be at least 10 characters"),
    })
  ).min(1, "At least one source is required"),
});

/**
 * Structured LLM Output Schema for Gemini
 */
export const LLMExtractionOutputSchema = z.object({
  dimensions: z.array(ExpectedDimensionSchema),
  claims: z.array(
    z.object({
      dimensionId: z.string(),
      sourceId: z.string(),
      statement: z.string(),
      quote: z.string().describe("Exact verbatim quote from the source text"),
    })
  ),
  findings: z.array(
    z.object({
      type: FindingTypeSchema,
      dimensionId: z.string().optional(),
      title: z.string(),
      description: z.string(),
      severity: FindingSeveritySchema,
      confidence: z.number().min(0).max(1),
      sourceIds: z.array(z.string()),
      quote: z.string().optional(),
      recommendedAction: z.string().optional(),
    })
  ),
  conflicts: z.array(
    z.object({
      dimensionId: z.string(),
      aspect: z.string(),
      comparisons: z.array(
        z.object({
          sourceId: z.string(),
          statedValue: z.string(),
          quote: z.string(),
        })
      ),
      resolutionReasoning: z.string(),
    })
  ),
  executiveOverview: z.string(),
});
