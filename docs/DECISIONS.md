# Architecture & Design Decisions (docs/DECISIONS.md)

**Project:** DarkSpot Radar — AI-Assisted Information Gap & Contradiction Detection Platform  
**Hackathon:** Shinchan Online Hackathon 2026 (Competition Track)

---

## 1. Key Architectural Decisions & Rationale

| Decision | Selected Option | Considered Alternatives | Rationale & Trade-offs |
|---|---|---|---|
| **Paradigm** | Expectation-First Gap Detection | Document Summarization / RAG Chatbot | Summarizers and RAG only operate on provided text; they cannot identify what was never mentioned. Formulating prerequisite dimensions first allows computing the complement (the dark spots). |
| **Evidence Verification** | Strict Normalized Substring Match | Semantic Embedding Similarity | Semantic similarity allows subtle hallucinations (e.g., changing numbers or qualifying criteria). Exact/normalized substring matching guarantees the source author actually wrote the statement. |
| **Three-Label System** | `SOURCED`, `AI_SIGNAL`, `UNCERTAIN` | Binary (Fact / AI Hallucination) | Human decisions operate under gradations of certainty. Distinguishing verified quotes (`SOURCED`) from structural absence signals (`AI_SIGNAL`) and failed quote matches (`UNCERTAIN`) delivers honest transparency. |
| **Offline Resilience** | Heuristic Engine + Precomputed Demo Pack | Online-Only LLM Dependency | Competition demos often fail due to Wi-Fi drops, API quotas, or latency. Providing deterministic heuristics and full offline scholarship data guarantees 100% demo uptime in <2 seconds. |
| **Charts & Matrix** | Custom Tailwind CSS / SVG Grid | Heavy Chart Libraries (Recharts/Chart.js) | Eliminating heavy charting libraries keeps client bundle under 130 kB first-load JS, ensuring rapid initial render and Lighthouse Performance 95+. |
| **Input Security** | Multi-Layer SSRF Guard & Length Capping | Raw `fetch()` | Directly fetching user-supplied URLs exposes server to internal port scanning and cloud metadata theft (`169.254.169.254`). Strict protocol and private IP filtering neutralizes this threat. |
| **Checklist Priority** | `Severity × Uncertainty × Decision Impact` | Simple Chronological / Random | Users cannot investigate 20 things simultaneously. Weighting high-severity contradictions with unverified claims bubbles up the exact blockers that would cause application disqualification. |

---

## 2. Assumptions & Scope Guardrails

1. **Academic & Scheme Cycles:** Standard governmental schemes in India follow academic sessions (e.g. `2025-26`, `2023-24`). The freshness engine treats pre-2025 cohorts as stale notifications that require confirmation.
2. **Authority Hierarchy:** Institutional domains (`.gov`, `.edu`, `.nic.in`, `.ac.in`) are weighted higher than secondary blogs and community discussions. However, even official documents are audited for missing continuation/renewal policies.
3. **Speed Mode Allocations:** In accordance with competition speed mode guidelines, multi-lingual audio/translation and AgriTech scenarios were deferred to focus resources on achieving zero-defect WCAG 2.2 AA accessibility, unit test verification, and complete offline audit flows.
