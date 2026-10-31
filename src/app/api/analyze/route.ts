import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/types/schemas";
import { runGapDetectionEngine } from "@/lib/llm";
import { classifyAuthority } from "@/lib/analysis/authority";
import { analyzeFreshness } from "@/lib/analysis/freshness";
import { Source } from "@/types";

export const runtime = "nodejs";

// Simple in-memory rate limiter (sliding window)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many analysis requests. Please wait a minute before retrying." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parseRes = AnalyzeRequestSchema.safeParse(json);

    if (!parseRes.success) {
      const issue = parseRes.error.issues[0]?.message || "Invalid payload";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { topic, sources: rawSources } = parseRes.data;

    // Hydrate sources with deterministic metadata
    const sources: Source[] = rawSources.map((s, index) => {
      const id = s.id || `src-${index + 1}`;
      const domain = s.url ? new URL(s.url).hostname : undefined;
      const authority = classifyAuthority(s.url, s.title);
      const freshness = analyzeFreshness(s.rawText);

      return {
        id,
        title: s.title,
        url: s.url || undefined,
        domain,
        authority,
        rawText: s.rawText,
        extractedDate: freshness.date,
        extractedCycle: freshness.cycle,
        isStale: freshness.isStale,
        freshnessWarning: freshness.freshnessWarning,
      };
    });

    const result = await runGapDetectionEngine({ topic, sources });
    return NextResponse.json({ result });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
