import { describe, it, expect } from "vitest";
import { isSafeUrl } from "@/lib/ingest/ssrf";
import { verifyQuoteInSource, normalizeText } from "@/lib/analysis/quote-verifier";
import { extractCycle, extractDate, analyzeFreshness } from "@/lib/analysis/freshness";
import { classifyAuthority } from "@/lib/analysis/authority";
import { normalizeConflicts } from "@/lib/analysis/conflicts";
import { computeDecisionReadinessScore } from "@/lib/analysis/scoring";
import { generateChecklist } from "@/lib/analysis/checklist";
import { Source, ExpectedDimension, DimensionCellCoverage, Finding } from "@/types";

describe("SSRF Protection Guard", () => {
  it("allows valid public HTTPS and HTTP URLs", () => {
    expect(isSafeUrl("https://scholarships.gov.in/guidelines").safe).toBe(true);
    expect(isSafeUrl("http://example.com/info").safe).toBe(true);
  });

  it("blocks localhost, loopback, and local domain variants", () => {
    expect(isSafeUrl("http://localhost:3000/admin").safe).toBe(false);
    expect(isSafeUrl("http://127.0.0.1:8080").safe).toBe(false);
    expect(isSafeUrl("http://0.0.0.0").safe).toBe(false);
    expect(isSafeUrl("http://app.localhost/secret").safe).toBe(false);
  });

  it("blocks private IPv4 networks (10.x, 192.168.x, 172.16.x)", () => {
    expect(isSafeUrl("http://10.0.0.1/private").safe).toBe(false);
    expect(isSafeUrl("http://192.168.1.1/router").safe).toBe(false);
    expect(isSafeUrl("http://172.20.5.1").safe).toBe(false);
  });

  it("blocks cloud metadata services", () => {
    expect(isSafeUrl("http://169.254.169.254/latest/meta-data/").safe).toBe(false);
    expect(isSafeUrl("http://metadata.google.internal").safe).toBe(false);
  });

  it("blocks unsupported schemes", () => {
    expect(isSafeUrl("ftp://files.example.com").safe).toBe(false);
    expect(isSafeUrl("file:///etc/passwd").safe).toBe(false);
    expect(isSafeUrl("javascript:alert(1)").safe).toBe(false);
  });
});

describe("Anti-Hallucination Quote Verifier", () => {
  const sourceText = `
    The National Merit Scholarship 2025 provides ₹50,000 per academic year.
    Eligible candidates must have scored at least 75% in Class 12th board exams.
    Income ceiling: Annual family income must not exceed 2.5 Lakhs per annum.
    Applications close on November 30, 2025.
  `;

  it("verifies exact quotes present in source", () => {
    const quote = "Annual family income must not exceed 2.5 Lakhs per annum.";
    const result = verifyQuoteInSource(quote, sourceText);
    expect(result.verified).toBe(true);
    expect(result.matchType).toBe("EXACT");
  });

  it("verifies quotes with normalized whitespace and case differences", () => {
    const quote = "Annual family   income must not exceed\n2.5 Lakhs per annum.";
    const result = verifyQuoteInSource(quote, sourceText);
    expect(result.verified).toBe(true);
  });

  it("fails verification on hallucinated or altered claims", () => {
    const hallucinated = "Annual family income must not exceed 8.0 Lakhs per annum with no age limit.";
    const result = verifyQuoteInSource(hallucinated, sourceText);
    expect(result.verified).toBe(false);
    expect(result.matchType).toBe("NONE");
  });
});

describe("Freshness and Cycle Extractor", () => {
  it("extracts academic cycle correctly", () => {
    expect(extractCycle("Guidelines for National Fellowship 2023-24")).toBe("2023-24");
    expect(extractCycle("Academic Year AY 2024-25 notification")).toBe("2024-25");
  });

  it("flags older cycles as stale", () => {
    const analysis = analyzeFreshness("Scholarship guidelines for AY 2023-24 session.");
    expect(analysis.isStale).toBe(true);
    expect(analysis.cycle).toBe("2023-24");
    expect(analysis.freshnessWarning).toContain("earlier cycle");
  });

  it("extracts dates accurately", () => {
    expect(extractDate("Published on 2024-08-15")).toBe("2024-08-15");
    expect(extractDate("Last updated October 14, 2023")).toBe("October 14, 2023");
  });
});

describe("Source Authority Classifier", () => {
  it("identifies government and university domains as OFFICIAL", () => {
    expect(classifyAuthority("https://scholarships.gov.in", "Official Portal")).toBe("OFFICIAL");
    expect(classifyAuthority("https://iitd.ac.in/fellowship", "IIT Delhi")).toBe("OFFICIAL");
  });

  it("identifies news/blogs as SECONDARY", () => {
    expect(classifyAuthority("https://educationtoday.com/scholarship-alert", "Ed News")).toBe("SECONDARY");
  });

  it("identifies forum or social links as COMMUNITY_OR_UNKNOWN", () => {
    expect(classifyAuthority("https://reddit.com/r/indian_academia", "Reddit Thread")).toBe("COMMUNITY_OR_UNKNOWN");
  });
});

describe("Conflict Normalizer", () => {
  const sources: Source[] = [
    {
      id: "src-1",
      title: "Official Government Portal",
      authority: "OFFICIAL",
      rawText: "Income limit is 2.5 LPA.",
      extractedCycle: "2025-26",
    },
    {
      id: "src-2",
      title: "Student Discussion Blog",
      authority: "SECONDARY",
      rawText: "Income limit is 5.0 LPA.",
      extractedCycle: "2023-24",
      isStale: true,
    },
  ];

  it("ranks official source over secondary/stale source in conflicts", () => {
    const normalized = normalizeConflicts(
      [
        {
          dimensionId: "dim-income",
          aspect: "Annual Family Income Ceiling",
          comparisons: [
            { sourceId: "src-1", statedValue: "2.5 LPA", quote: "Income limit is 2.5 LPA." },
            { sourceId: "src-2", statedValue: "5.0 LPA", quote: "Income limit is 5.0 LPA." },
          ],
        },
      ],
      sources
    );

    expect(normalized).toHaveLength(1);
    expect(normalized[0].suggestedTrustSourceId).toBe("src-1");
    expect(normalized[0].resolutionReasoning).toContain("Official Government Portal");
  });
});

describe("Decision Readiness Score", () => {
  it("calculates realistic score and reports transparent penalties", () => {
    const mockSources: Source[] = [
      { id: "s1", title: "Official Portal", authority: "OFFICIAL", rawText: "text", extractedCycle: "2025-26" },
      { id: "s2", title: "Old Blog", authority: "SECONDARY", rawText: "text", isStale: true, extractedCycle: "2023-24" },
    ];

    const mockDims: ExpectedDimension[] = [
      { id: "d1", name: "Eligibility", description: "Eligibility criteria", importance: "CRITICAL" },
      { id: "d2", name: "Renewal Policy", description: "Terms for renewal", importance: "CRITICAL" },
    ];

    const mockMatrix: DimensionCellCoverage[] = [
      { dimensionId: "d1", sourceId: "s1", status: "COVERED", summary: "Eligibility clear", claims: [] },
      { dimensionId: "d1", sourceId: "s2", status: "COVERED", summary: "Eligibility clear", claims: [] },
      { dimensionId: "d2", sourceId: "s1", status: "MISSING", summary: "Not mentioned", claims: [] },
      { dimensionId: "d2", sourceId: "s2", status: "MISSING", summary: "Not mentioned", claims: [] },
    ];

    const score = computeDecisionReadinessScore({
      sources: mockSources,
      expectedDimensions: mockDims,
      matrix: mockMatrix,
      findings: [],
      conflictsCount: 1,
      totalClaims: 5,
      verifiedClaims: 4,
    });

    expect(score.finalScore).toBeGreaterThan(0);
    expect(score.finalScore).toBeLessThan(80);
    expect(score.penalties.length).toBeGreaterThan(0);
  });
});

describe("Verify-Next Checklist", () => {
  it("prioritizes items based on severity x uncertainty x impact", () => {
    const checklist = generateChecklist(
      [
        {
          id: "f1",
          type: "GAP",
          dimensionId: "dim-renew",
          title: "Renewal Terms Missing",
          description: "No policy provided for subsequent years",
          label: "AI_SIGNAL",
          severity: "CRITICAL",
          confidence: 0.9,
          sourceIds: ["s1"],
        },
      ],
      [],
      [
        { id: "dim-renew", name: "Renewal Policy", description: "Renewal rules", importance: "CRITICAL" },
      ],
      [{ id: "s1", title: "Official Portal", authority: "OFFICIAL", rawText: "text" }],
      "State Merit Scholarship"
    );

    expect(checklist).toHaveLength(1);
    expect(checklist[0].priorityScore).toBeGreaterThanOrEqual(18);
    expect(checklist[0].helpdeskDraft).toContain("State Merit Scholarship");
  });
});
