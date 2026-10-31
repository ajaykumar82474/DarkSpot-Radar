# 📡 DarkSpot Radar

> **See what your sources don't tell you.**  
> An AI-Assisted Information Gap & Contradiction Detection Platform built for high-stakes decisions (scholarships, admissions, jobs, schemes).

[![Shinchan Hackathon 2026](https://img.shields.io/badge/Shinchan%20Hackathon-2026%20Track-38bdf8)](https://unista.ai)
[![Next.js 15](https://img.shields.io/badge/Next.js-15%20App%20Router-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Observatory%20Theme-38bdf8)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-100%25%20Passing-emerald)](https://vitest.dev)
[![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-10b981)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 💡 The Problem & Why Existing Tools Fall Short

People make life-altering choices (applying for college scholarships, institutional admissions, government welfare schemes, or job recruitments) using information fragmented across portals, third-party blogs, and archived circulars.

1. **Search engines find documents, but do not compare them.**
2. **AI summarizers (ChatGPT, Perplexity) only condense what is *already present*.**  
   If no website mentions Year 2 renewal rules, a summarizer omits it cleanly without warning you. The user is left in the dark about **what is missing, what contradicts, and what is dangerously outdated**.
3. **Hallucination risks are costly:** Believing an inaccurate family income threshold or submitting the wrong certificate can lead to rejection and forfeiture of fees.

### The DarkSpot Radar Solution

DarkSpot Radar **inverts the paradigm**: before reading sources deeply, it constructs an **Expected Information Map** containing the prerequisite dimensions a prudent person must verify. Anything missing across all reviewed sources glows as a **"Dark Spot"**. Every claim is checked against source text using strict normalized quote verification, and competing claims are normalized side-by-side with authority rankings.

---

## 🚀 Key Features & Innovations

### 1. Expectation-First Gap Engine (The Core Innovation)
Formulates 6-8 essential decision dimensions for the specific domain before deep analysis. Identifies the complement: what the sources *failed* to say.

### 2. Signature Visual: Dark Spot Matrix Heatmap
- A 2D interactive matrix: **Rows = Expected Dimensions**, **Columns = Reviewed Sources**.
- Encoded with **color + distinct iconography + text patterns** (never color alone):
  - `Covered (Verified)`: Solid green check
  - `Partial`: Amber help icon
  - `Conflict`: Pink comparison icon
  - `Outdated`: Violet clock icon
  - `Missing`: Rose cross icon
- Dimensions with zero source coverage glow with an animated pulse as **Critical Dark Spots**.
- Includes a dedicated, accessible HTML table alternative for screen readers.

### 3. Quote-Verified Anti-Hallucination Rigor
- Every claim extracted from a document is accompanied by an exact quotation.
- The server runs normalized substring verification on raw source texts.
- Verified claims receive the **SOURCED** badge and can be viewed directly in an **Evidence Drawer** with the exact passage highlighted in the source document.
- Unverified statements are downgraded to **UNCERTAIN** with an integrity alert.

### 4. Three-Label Epistemic Transparency
- `SOURCED`: Certified verbatim quotation from source text.
- `AI_SIGNAL`: Inferred potential gap or contradiction (never presented as a definitive fact).
- `UNCERTAIN`: Failed quote verification or single unconfirmed secondary source.

### 5. Cross-Source Conflict Explorer
Normalizes conflicting figures (e.g. ₹2.5 Lakh vs ₹5.0 Lakh family income) side-by-side. Computes a source trust weight based on domain authority (official domain > blog > community) and active cycle status.

### 6. Explainable Decision Readiness Score (0-100)
Calculated via an auditable weighted formula:

```
Score = 0.30 x Coverage + 0.25 x Agreement + 0.20 x Freshness + 0.15 x Authority + 0.10 x Evidence Integrity
```

Lists plain-text deductions explaining exactly why points were lost.

### 7. Prioritized "Verify-Next" Checklist
- Priority formula:

```
Priority = Severity (1-4) x Uncertainty (1-3) x Impact (1-3)
```

- Persisted completion checkboxes (localStorage with try/catch fallback).
- One-click **"Copy Draft"** button generating a ready-to-send helpdesk inquiry email.
- One-click export to a clean Markdown checklist.

### 8. 1-Click Competition Demo Pack (100% Offline Ready)
Includes a precomputed scholarship scenario featuring an official portal, an educational blog, and an archived AY 2023-24 PDF circular. Demonstrates the renewal dark spot, income contradiction, and stale cycle in under 2 seconds with **no API key required**.

> **SAMPLE DATA:** All sources, scheme details and figures in the demo pack are fictional and created for demonstration only. They do not represent any real scholarship's actual rules.

---

## 🔄 How It Works (Pipeline Architecture)

```mermaid
flowchart TD
    A[User enters Topic + Sources / Clicks Demo] --> B[Ingest & SSRF Guard Layer]
    B --> C[Cheerio Clean Text & Domain Classifier]
    C --> D[Deterministic Freshness & Cycle Regex Parser]
    D --> E[Expectation-First Dimension Mapper]
    E --> F[Gemini 2.5 Flash / Heuristic Fallback Engine]
    F --> G[Server-Side Normalized Quote Verifier]
    G --> H[Conflict Normalizer & Trust Ranker]
    H --> I[Explainable Readiness Score 0-100]
    I --> J[Prioritized Verify-Next Checklist]
    J --> K[Interactive Dark Spot Map & Evidence Drawer]
```

---

## 🛠️ Technology Stack & Rationale

| Layer               | Technology                      | Rationale                                                                                               |
|---------------------|---------------------------------|---------------------------------------------------------------------------------------------------------|
| **Framework**       | Next.js 15 (App Router)         | Server Components by default, minimal client JS, route handlers for secure API isolation.               |
| **Language**        | TypeScript (Strict Mode)        | Zero `any` types; Zod schemas as single source of truth for runtime validation.                         |
| **Styling**         | Tailwind CSS                    | Zero runtime CSS overhead, accessible observatory dark theme, high-contrast tokens.                     |
| **LLM Provider**    | Google Gemini (`@google/genai`) | High-speed structured JSON extraction via Gemini 2.5 Flash. Server-side only; never exposed to browser. |
| **Fallback Engine** | Custom Heuristic Engine         | Deterministic keyword, currency regex, and sentence matching for offline resilience.                    |
| **Ingestion**       | Cheerio + SSRF Guard            | Fast HTML boilerplate stripping; restricts private IPv4 and metadata access.                            |
| **Testing**         | Vitest                          | Sub-second execution for all deterministic modules and invariants.                                      |

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts       # Main analysis endpoint (rate limited)
│   │   │   └── ingest/route.ts        # SSRF-protected URL fetcher
│   │   ├── globals.css                # Radar grid & WCAG focus styles
│   │   ├── layout.tsx                 # SEO metadata, typography, skip link
│   │   └── page.tsx                   # Main page: hero, input, demo, results
│   ├── components/
│   │   ├── ConflictExplorer.tsx       # Side-by-side contradiction comparator
│   │   ├── DarkSpotMap.tsx            # Hero 2D matrix heatmap & table view
│   │   ├── EvidenceDrawer.tsx         # Slide-over quote inspector
│   │   ├── FindingsList.tsx           # AI signals & potential gaps list
│   │   ├── MethodologyModal.tsx       # In-app methodology guide
│   │   ├── ReadinessScoreCard.tsx     # SVG radial gauge & score breakdown
│   │   ├── ResponsibleAIPanel.tsx     # AI limitations and disclosure
│   │   ├── SourcesList.tsx            # Source authority & freshness audit
│   │   ├── ThreeLabelBadge.tsx        # SOURCED / AI_SIGNAL / UNCERTAIN
│   │   └── VerifyChecklist.tsx        # Action checklist with email drafts
│   ├── data/
│   │   └── scholarship-pack.ts        # Fictional scholarship demo data
│   ├── lib/
│   │   ├── analysis/
│   │   │   ├── authority.ts           # Domain authority classifier
│   │   │   ├── checklist.ts           # Severity x Uncertainty x Impact math
│   │   │   ├── conflicts.ts           # Conflict normalizer & trust engine
│   │   │   ├── freshness.ts           # Academic cycle & date regex parser
│   │   │   ├── quote-verifier.ts      # Normalized quote verification
│   │   │   └── scoring.ts             # Explainable 5-factor scoring engine
│   │   ├── ingest/
│   │   │   └── ssrf.ts                # Private IP & metadata security guard
│   │   └── llm/
│   │       ├── gemini.ts              # Gemini 2.5 Flash structured adapter
│   │       ├── heuristic.ts           # Deterministic offline fallback
│   │       ├── index.ts               # Unified orchestrator
│   │       └── types.ts               # Interface definitions
│   └── types/
│       ├── index.ts                   # Core data models
│       └── schemas.ts                 # Zod validation schemas
├── tests/
│   ├── deterministic.test.ts          # Unit tests for SSRF, quotes, scoring
│   ├── heuristic.test.ts              # Unit tests for offline fallback
│   └── scholarship-pack.test.ts       # Verbatim quote & dark spot invariants
├── docs/
│   ├── ARCHITECTURE.md                # Sequence diagrams & module contracts
│   ├── DECISIONS.md                   # Trade-offs & architectural choices
│   ├── DEMO_SCRIPT.md                 # 3-minute presentation script & 8 Q&As
│   ├── QUALITY_REPORT.md              # Lighthouse & WCAG 2.2 AA audit results
│   └── SUBMISSION_DESCRIPTION.md      # Hackathon submission description
└── .env.example                       # Environment configuration template
```

---

## ⚡ Quickstart Setup (5 Steps)

### 1. Clone the repository
```bash
git clone https://github.com/ajaykumar82474/DarkSpot-Radar.git
cd DarkSpot-Radar
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables (Optional)
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Google Gemini key:
```
GEMINI_API_KEY=your_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, the app runs completely offline using the built-in deterministic heuristic engine.)*

### 4. Run the test suite
```bash
npm test
```
*(All 20 unit tests pass in under 1 second.)*

### 5. Launch the application
```bash
npm run dev
```
Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable         | Required | Server/Client        | Description                                                                                                                           |
|------------------|----------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| `GEMINI_API_KEY` | Optional | **Server-side only** | Google Gemini API key for deep extraction. If omitted, app seamlessly runs in basic offline heuristic mode. Never exposed to browser. |

---

## 🎯 How to Run the Competition Demo

1. Open the homepage at `http://localhost:3000`.
2. Click **"Launch Scholarship Demo"**.
3. In under 2 seconds, the full audit loads with:
   - **Critical Dark Spot:** The "Renewal Policy" row glows red across all sources.
   - **Direct Contradiction:** Income limit is flagged as conflicting (₹2.5L Official vs ₹5.0L Blog vs ₹2.0L PDF).
   - **Stale Source:** The archived notification is tagged as an earlier session (`AY 2023-24`).
   - **Click any cell:** The Evidence Drawer opens with the exact quote highlighted in the source document.
   - **Checklist:** Click "Copy Draft" to copy a ready-made inquiry email for the helpdesk.

---

## 🧪 Testing & Quality Gates

Run all automated checks:

```bash
npm test          # Run Vitest test suite (20 tests)
npm run typecheck # TypeScript strict type verification
npm run lint      # ESLint checks
npm run build     # Production Next.js
