# DarkSpot Radar — Hackathon Submission Description (docs/SUBMISSION_DESCRIPTION.md)

**Project Title:** DarkSpot Radar  
**Tagline:** AI-Assisted Information Gap & Contradiction Detection Platform  
**Hackathon:** Shinchan Online Hackathon 2026  
**Track:** Digital Dark Spot: AI-Assisted Information Gap Detection Platform  

---

## 1. The Problem
Every year, millions of students, job seekers, patients, and citizens make life-altering decisions based on fragmented information scattered across official portals, news blogs, and online forums. While modern search engines find documents and AI summarizers condense them, they suffer from a fatal structural flaw: **they only summarize what is already there**.

When key prerequisites are missing (such as second-year scholarship renewal criteria), when sources contradict each other (such as ₹2.5 Lakh vs ₹5.0 Lakh income ceilings), or when pages cite outdated cycles (such as AY 2023-24 circulars), summarizers produce fluent, deceptively confident outputs. The user is left in the dark about **what is missing, what conflicts, and what to verify next**, leading to missed deadlines, forfeited fees, and rejected applications.

---

## 2. Proposed Solution
**DarkSpot Radar** is an original gap-detection and contradiction-auditing engine designed specifically for high-stakes decision-making. Instead of acting as a generic chatbot, it inverts the information retrieval model:

1. **Expectation-First Dimension Mapping:** It establishes what a prudent, careful decision-maker *needs to know* for a specific domain (e.g. eligibility cutoffs, income limits, mandatory certificates, renewal conditions, and refund policies).
2. **Dark Spot Matrix Heatmap:** It maps every ingested source against these expected dimensions in a 2D interactive matrix. Unaddressed dimensions glow prominently as **"Dark Spots"**.
3. **Quote-Verified Anti-Hallucination Evidence:** Every extracted claim is matched verbatim against the raw source text on the server. Verified statements are certified as `SOURCED`, while unverified statements are downgraded to `UNCERTAIN`.
4. **Cross-Source Conflict Explorer:** Normalizes competing assertions side-by-side, compares domain authorities (.gov vs blogs) and freshness, and suggests which source to trust.
5. **Explainable Decision Readiness Score (0–100):** Provides an auditable mathematical index based on coverage, agreement, freshness, authority, and evidence integrity.
6. **Prioritized "Verify-Next" Checklist:** Mathematically sorts ambiguities by $\text{Severity} \times \text{Uncertainty} \times \text{Decision Impact}$, equips users with official helpdesk contacts, and drafts inquiry emails with one-click copying.

---

## 3. How It Works (Pipeline)
1. **Source Ingestion & SSRF Guard:** The user enters a research goal and adds sources via live URL or pasted text. An SSRF guard verifies hostnames and IP ranges to prevent private network attacks. Cheerio cleans boilerplate navigation and extracts pure text.
2. **Dimension Formulation:** Powered by Google Gemini (or the built-in deterministic heuristic engine), the system generates 6–8 critical decision dimensions for the topic.
3. **Cross-Document Fact Extraction:** Statements and verbatim quotations are extracted for each dimension across all sources.
4. **Deterministic Anti-Hallucination Verification:** The backend runs normalized substring matching on quotes. If an AI hallucinates a quote, it fails verification and is flagged.
5. **Freshness & Cycle Parsing:** Regex parsers identify academic sessions (e.g. `2023-24`) and calendar dates, tagging legacy cohorts as stale.
6. **Scoring & Checklist Generation:** The system computes the weighted Decision Readiness Score and builds an actionable verification checklist with Markdown export.

---

## 4. Key Innovations & Uniqueness
- **Beyond Search & Chatbots:** DarkSpot Radar does not output paragraphs of text. It delivers a structured, actionable visual audit matrix.
- **Visual Encoding Without Relying on Color Alone:** Meets strict WCAG 2.2 AA standards by combining color, distinct iconography, and text patterns (`Covered`, `Partial`, `Conflict`, `Outdated`, `Missing`). Includes a full screen-reader table alternative.
- **Three-Label Epistemic Transparency:** Consistently separates `SOURCED` (verified quote), `AI_SIGNAL` (gap/contradiction hypothesis), and `UNCERTAIN` (unverified claim). AI output is always labelled as potential, never presented as infallible fact.
- **Dual-Engine Architecture:** Operates with Google Gemini 2.5 Flash for deep semantic synthesis, but seamlessly degrades to a deterministic heuristic engine when offline or without an API key. Includes a 1-click Competition Demo Pack that executes in under 2 seconds.

---

## 5. Technology Stack
- **Frontend & Framework:** Next.js 15 (App Router, Server Components), React 19, TypeScript (Strict Mode).
- **Styling & UI:** Tailwind CSS, Custom Radar Observatory Dark Theme, Lucide Icons.
- **Backend & Ingestion:** Node.js API Route Handlers, Cheerio (DOM sanitization & text parsing), Custom Multi-Tier SSRF Guard.
- **AI & Reasoning:** Google Gemini API via `@google/genai` (structured JSON output with Zod validation) + Offline Heuristic Analyzer.
- **Testing & Quality:** Vitest (100% passing test suite across SSRF, quote verification, freshness, and scoring), ESLint, Prettier.
- **Deployment:** Vercel-ready with zero external database dependencies.

---

## 6. Future Scope & Roadmap
- **Multilingual Vernacular Support:** Extend the checklist and executive summary to regional Indian languages (Telugu, Hindi, Tamil) for rural and first-generation applicants.
- **Automated Helpdesk Submission:** Direct integration with governmental grievance portals (CPGRAMS, RTI Online) to dispatch verification inquiries automatically.
- **Browser Extension:** A companion Chrome extension that audits websites in real-time as users browse college and scholarship portals.
- **Community Gap Voting:** Allow verified applicants to upvote verified answers for persistent dark spots, crowdsourcing institutional clarity.
