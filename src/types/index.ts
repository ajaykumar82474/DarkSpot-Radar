/**
 * Core type definitions for DarkSpot Radar.
 * Provides unified data structures for sources, dimensions, claims, evidence, findings, and scoring.
 */

export type SourceAuthority = 'OFFICIAL' | 'SECONDARY' | 'COMMUNITY_OR_UNKNOWN';

export interface Source {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  authority: SourceAuthority;
  rawText: string;
  extractedDate?: string;
  extractedCycle?: string;
  freshnessWarning?: string;
  isStale?: boolean;
}

export type DimensionImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface ExpectedDimension {
  id: string;
  name: string;
  description: string;
  importance: DimensionImportance;
}

export interface ClaimEvidence {
  sourceId: string;
  quote: string;
  verified: boolean;
  matchIndex?: number;
  matchLength?: number;
}

export interface Claim {
  id: string;
  dimensionId: string;
  sourceId: string;
  statement: string;
  evidence: ClaimEvidence;
}

export type CoverageStatus = 'COVERED' | 'PARTIAL' | 'MISSING' | 'CONFLICTING' | 'OUTDATED';

export interface DimensionCellCoverage {
  dimensionId: string;
  sourceId: string;
  status: CoverageStatus;
  summary: string;
  claims: Claim[];
}

export type FindingType = 'GAP' | 'CONFLICT' | 'STALE' | 'UNANSWERED';
export type FindingLabel = 'SOURCED' | 'AI_SIGNAL' | 'UNCERTAIN';
export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Finding {
  id: string;
  type: FindingType;
  dimensionId?: string;
  title: string;
  description: string;
  label: FindingLabel;
  severity: FindingSeverity;
  confidence: number; // 0.0 - 1.0
  sourceIds: string[];
  evidence?: ClaimEvidence[];
  recommendedAction?: string;
}

export interface ConflictValue {
  sourceId: string;
  sourceTitle: string;
  authority: SourceAuthority;
  statedValue: string;
  quote: string;
  verified: boolean;
  cycle?: string;
}

export interface ConflictItem {
  id: string;
  dimensionId: string;
  aspect: string; // e.g. "Income ceiling", "Required certificates", "Application fee"
  values: ConflictValue[];
  suggestedTrustSourceId?: string;
  resolutionReasoning: string;
}

export interface ScoreBreakdown {
  coverageScore: number;         // 30% weight
  agreementScore: number;        // 25% weight
  freshnessScore: number;        // 20% weight
  authorityScore: number;        // 15% weight
  evidenceIntegrityScore: number;// 10% weight
  finalScore: number;            // 0 - 100
  verdict: string;
  penalties: string[];
}

export interface ChecklistItem {
  id: string;
  findingId?: string;
  dimensionId?: string;
  priorityScore: number; // severity (1-4) x uncertainty (1-3) x impact (1-3)
  task: string;
  whyItMatters: string;
  whereToCheck: string;
  helpdeskDraft: string;
  completed: boolean;
}

export interface EvidenceIntegrityStats {
  totalClaims: number;
  verifiedClaims: number;
  percentage: number;
}

export interface AnalysisResult {
  id: string;
  topic: string;
  timestamp: string;
  isBasicMode: boolean;
  sources: Source[];
  expectedDimensions: ExpectedDimension[];
  matrix: DimensionCellCoverage[];
  findings: Finding[];
  conflicts: ConflictItem[];
  score: ScoreBreakdown;
  checklist: ChecklistItem[];
  evidenceIntegrity: EvidenceIntegrityStats;
  executiveSummary: {
    overview: string;
    criticalGapsCount: number;
    conflictsCount: number;
    staleSourcesCount: number;
  };
}

export interface AnalyzeRequestPayload {
  topic: string;
  sources: {
    id?: string;
    title: string;
    url?: string;
    rawText: string;
  }[];
}
