import { describe, it, expect } from "vitest";
import { getScholarshipDemoAnalysis } from "@/data/scholarship-pack";

describe("Scholarship Sample Pack Invariants", () => {
  it("produces a valid analysis result with high evidence integrity", () => {
    const analysis = getScholarshipDemoAnalysis();

    expect(analysis.sources).toHaveLength(3);
    expect(analysis.expectedDimensions.length).toBeGreaterThanOrEqual(8);
    expect(analysis.conflicts).toHaveLength(2);

    // Evidence integrity check: every claim in demo has a verbatim quote
    expect(analysis.evidenceIntegrity.totalClaims).toBeGreaterThan(10);
    expect(analysis.evidenceIntegrity.verifiedClaims).toBe(analysis.evidenceIntegrity.totalClaims);
    expect(analysis.evidenceIntegrity.percentage).toBe(100);

    // Dark spot invariant: renewal dimension has 0 coverage (all MISSING)
    const renewalCells = analysis.matrix.filter((c) => c.dimensionId === "dim-renewal");
    expect(renewalCells.every((c) => c.status === "MISSING")).toBe(true);

    // Stale source invariant: PDF is flagged as stale
    const pdfSource = analysis.sources.find((s) => s.id === "src-pdf");
    expect(pdfSource?.isStale).toBe(true);
    expect(pdfSource?.extractedCycle).toBe("2023-24");

    // Checklist generated
    expect(analysis.checklist.length).toBeGreaterThan(0);
    expect(analysis.checklist[0].priorityScore).toBeGreaterThan(0);
  });
});
