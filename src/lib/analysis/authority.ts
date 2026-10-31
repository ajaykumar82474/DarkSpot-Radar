/**
 * Source Authority Classifier.
 * Deterministically evaluates the authority level of a source based on its domain,
 * title, and URL metadata.
 */

import { SourceAuthority } from "@/types";

const OFFICIAL_TLDS = [".gov", ".gov.in", ".nic.in", ".ac.in", ".edu", ".edu.in", ".mil", ".org.in"];
const OFFICIAL_KEYWORDS = ["portal", "official", "ministry", "department", "board", "commission", "directorate", "university"];

const COMMUNITY_KEYWORDS = ["reddit.com", "quora.com", "forum", "discussion", "medium.com", "telegram", "whatsapp", "facebook.com", "x.com", "twitter.com"];

export function classifyAuthority(url?: string, title?: string): SourceAuthority {
  if (!url && !title) return "COMMUNITY_OR_UNKNOWN";

  let hostname = "";
  if (url) {
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch {
      hostname = url.toLowerCase();
    }
  }

  const combined = `${hostname} ${title || ""}`.toLowerCase();

  // 1. Check for official government, academic, or primary institutions
  const isOfficialTld = OFFICIAL_TLDS.some((tld) => hostname.endsWith(tld));
  const hasOfficialKeyword = OFFICIAL_KEYWORDS.some((kw) => combined.includes(kw));

  if (isOfficialTld || (hostname && hasOfficialKeyword && !combined.includes("blog") && !combined.includes("news"))) {
    return "OFFICIAL";
  }

  // 2. Check for community/forum
  const isCommunity = COMMUNITY_KEYWORDS.some((kw) => combined.includes(kw));
  if (isCommunity) {
    return "COMMUNITY_OR_UNKNOWN";
  }

  // 3. Fallback: Secondary if domain exists, else unknown
  if (hostname && hostname.includes(".")) {
    return "SECONDARY";
  }

  return "COMMUNITY_OR_UNKNOWN";
}
