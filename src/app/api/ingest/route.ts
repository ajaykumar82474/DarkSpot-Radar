import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { isSafeUrl } from "@/lib/ingest/ssrf";
import { classifyAuthority } from "@/lib/analysis/authority";
import { analyzeFreshness } from "@/lib/analysis/freshness";
import { Source } from "@/types";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB max
const TIMEOUT_MS = 8000; // 8 seconds timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url?.trim();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. SSRF Guard
    const ssrfCheck = isSafeUrl(url);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        { error: ssrfCheck.reason || "URL is not permitted for security reasons" },
        { status: 400 }
      );
    }

    // 2. Fetch URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VerifAi-DarkSpot-Bot/1.0; +https://darkspotradar.app)",
          Accept: "text/html,application/xhtml+xml,text/plain",
        },
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as Error)?.name === "AbortError";
      return NextResponse.json(
        { error: isAbort ? "Request timed out after 8 seconds" : "Failed to connect to target URL" },
        { status: 504 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Target server returned HTTP ${res.status}: ${res.statusText}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return NextResponse.json(
        { error: "Target URL does not return HTML or plain text content" },
        { status: 415 }
      );
    }

    const html = await res.text();
    if (html.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Page content exceeds maximum 2MB size limit" },
        { status: 413 }
      );
    }

    // 3. Extract content with cheerio
    const $ = cheerio.load(html);

    // Remove noise elements
    $("script, style, noscript, svg, nav, footer, iframe, head").remove();

    // Extract Title
    let title = $("title").text().trim();
    if (!title) {
      title = $("h1").first().text().trim() || new URL(url).hostname;
    }

    // Extract Main text content
    let text = $("main, article, #content, .content, body").first().text();
    text = text.replace(/\s+/g, " ").trim();

    // Limit to reasonable character count for analysis
    if (text.length > 25000) {
      text = text.substring(0, 25000) + "... [truncated]";
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract sufficient text content from this webpage." },
        { status: 422 }
      );
    }

    const domain = new URL(url).hostname;
    const authority = classifyAuthority(url, title);
    const freshness = analyzeFreshness(text);

    const source: Source = {
      id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      url,
      domain,
      authority,
      rawText: text,
      extractedDate: freshness.date,
      extractedCycle: freshness.cycle,
      isStale: freshness.isStale,
      freshnessWarning: freshness.freshnessWarning,
    };

    return NextResponse.json({ source });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Internal server error during URL ingestion" },
      { status: 500 }
    );
  }
}
