import { describe, it, expect } from "vitest";
import { runHeuristicAnalysis } from "@/lib/llm/heuristic";
import { runGapDetectionEngine } from "@/lib/llm";
import { Source } from "@/types";

describe("Heuristic Fallback Engine", () => {
  it("generates expectation dimensions and detects gaps offline", async () => {
    const sources: Source[] = [
      {
        id: "s1",
        title: "Admission Notice",
        authority: "OFFICIAL",
        rawText: "College admission prerequisites require 60% in science. Application deadline is June 30.",
      },
    ];

    const raw = await runHeuristicAnalysis("College University Admission 2026", sources);
    expect(raw.dimensions.length).toBeGreaterThan(0);
    expect(raw.findings.length).toBeGreaterThan(0);
    // Dark spot gap should exist for unmentioned dimensions (e.g. tuition fees or hostel)
    const gap = raw.findings.find((f) => f.type === "GAP");
    expect(gap).toBeDefined();
  });

  it("runs full gap detection engine in basic mode without GEMINI_API_KEY", async () => {
    // Ensure no API key in test environment
    delete process.env.GEMINI_API_KEY;

    const sources: Source[] = [
      {
        id: "s1",
        title: "National Fellowship",
        authority: "OFFICIAL",
        rawText: "Annual stipend is ₹35,000 per month. Eligibility criteria requires NET qualification.",
      },
      {
        id: "s2",
        title: "Student Forum Review",
        authority: "COMMUNITY_OR_UNKNOWN",
        rawText: "Stipend is ₹45,000 per month according to seniors.",
      },
    ];

    const result = await runGapDetectionEngine({
      topic: "National Research Fellowship",
      sources,
    });

    expect(result.isBasicMode).toBe(true);
    expect(result.matrix.length).toBeGreaterThan(0);
    expect(result.score.finalScore).toBeGreaterThan(0);
    expect(result.checklist.length).toBeGreaterThan(0);
  });
});
