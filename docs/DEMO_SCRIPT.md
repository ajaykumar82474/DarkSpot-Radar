# DarkSpot Radar - 3-Minute Live Demo Script & Judge Q&A (docs/DEMO_SCRIPT.md)

**Challenge:** Shinchan Online Hackathon 2026  
**Track:** Digital Dark Spot: AI-Assisted Information Gap Detection Platform  
**Target Duration:** 3 minutes (180 seconds)

---

## Part 1: The 3-Minute Live Walkthrough

### 0:00 – 0:30: The Hook & The Problem
> **Presenter:**  
> "Judges, consider a first-generation student applying for a critical national scholarship. They search Google, they read three blogs and an official PDF, and they ask ChatGPT to summarize it. ChatGPT gives a beautiful summary.
> 
> But that summary **fails to tell them what is missing, what contradicts, and what is dangerously outdated**. The student applies, only to be rejected because the blog quoted an old income limit and the official guidelines never mentioned that Year 2 renewal requires a 75% cutoff.
> 
> This is the **Digital Dark Spot**. Summarizers condense existing text; **DarkSpot Radar reveals what is absent and conflicting**."

---

### 0:30 – 1:00: The 1-Click Competition Demo
> **Action:** Click **"Launch Scholarship Demo"** on the landing page.
>
> **Presenter:**  
> "Notice what happened in under 2 seconds: DarkSpot Radar ingested 3 independent sources—the National Scholarship Portal, an educational blog, and an archived department circular from 2023.
> 
> Instead of a chat window, look at our hero visual: the **Dark Spot Matrix Heatmap**."

---

### 1:00 – 1:30: The Signature Innovation (Dark Spot Map & Quote Verification)
> **Action:** Scroll to the Dark Spot Map. Hover over the glowing row for **"Renewal Policy & Continuation Rules"**.
>
> **Presenter:**  
> "This is our core innovation: **Expectation-First Analysis**. Before reading deeply, the engine asks: *'What must a prudent person verify for a scholarship?'* It establishes 8 mandatory dimensions.
> 
> Look at the **Renewal Policy** row: it glows bright red with a radar pulse. Across all three sources, coverage is 0%. A summarizer would never tell you renewal rules are missing because the text doesn't contain them. DarkSpot Radar flags it as a critical Dark Spot immediately.
> 
> Now let's click on the **Eligibility** cell from the Official Portal."
>
> **Action:** Click on the Eligibility cell. The **Evidence Drawer** slides in from the right.
>
> **Presenter:**  
> "Here is our anti-hallucination guarantee: every claim is verified against the raw document text using normalized substring matching. You can see the exact quote highlighted in yellow in the document viewer, certified with a **SOURCED** badge. If a quote cannot be verified verbatim, it is automatically downgraded to **UNCERTAIN**."

---

### 1:30 – 2:00: Conflict Explorer & Freshness Audit
> **Action:** Close drawer and scroll down to the **Conflict Explorer**.
>
> **Presenter:**  
> "Here is where students get misled. Look at **Annual Family Income Ceiling**:
> - The Official Portal states: **₹2,50,000** with a Tehsildar certificate.
> - The Blog claims: **₹5,00,000** with a notary affidavit.
> - The Archived PDF says: **₹2,00,000**.
> 
> DarkSpot Radar normalizes these competing values side-by-side, audits the domain authority (.gov vs blog), flags the PDF as a **Stale Cycle (AY 2023-24)**, and transparently advises trusting the active 2025-26 official portal."

---

### 2:00 – 2:30: Explainable Decision Readiness Score
> **Action:** Scroll up to the **Decision Readiness Index** card.
>
> **Presenter:**  
> "Is this student ready to hit submit? DarkSpot Radar answers with an explainable **Decision Readiness Score: 60/100 (Proceed With Caution)**.
> 
> This is not an unexplainable black box. Every factor is transparent:
> - Coverage: 75%
> - Agreement: 50% (penalized for 2 active contradictions)
> - Freshness: 67% (penalized for the 2023-24 stale circular)
> - Authority: 67%
> - Evidence Integrity: 100% verified quotes.
> Every point deduction is explained in plain bullet points."

---

### 2:30 – 3:00: Prioritized "Verify-Next" Checklist & Wrap-Up
> **Action:** Scroll to the **Verify-Next Checklist**. Click "Copy Draft" on the top action item.
>
> **Presenter:**  
> "Finally, we don't just point out problems—we resolve them. The engine computes a priority score using:
> `Severity × Uncertainty × Decision Impact`.
> 
> Item #1 instructs the student to resolve the income ceiling contradiction before submitting. It provides the official helpdesk contact, and with one click of **'Copy Draft'**, generates a polite, pre-formatted inquiry email ready to paste into Gmail.
> 
> DarkSpot Radar works online with Gemini or 100% offline with zero dependencies. It turns information chaos into traceable, verifiable confidence. Thank you!"

---

## Part 2: 8 Likely Judge Questions & Strong Answers

### Q1: "How is this different from Perplexity or Google AI Overviews?"
**Answer:**  
"Perplexity and Google AI Overviews are *retrieval summarizers*: they search documents and synthesize what was written. If no website discusses renewal policies, Perplexity simply omits renewal from its summary without alerting you. DarkSpot Radar is *expectation-first*: it defines the necessary decision dimensions upfront and actively highlights the missing void (the dark spots)."

### Q2: "What happens if Gemini hallucinates a quote?"
**Answer:**  
"It is impossible for a hallucinated quote to be marked as verified in our system. Every quote returned by the LLM is piped through our deterministic `verifyQuoteInSource()` function on the Node server. If the substring does not exist in the ingested document text, the claim is instantly downgraded to `UNCERTAIN` and flagged with an alert banner."

### Q3: "How does the app perform if the Gemini API key fails or runs out of credits?"
**Answer:**  
"DarkSpot Radar is built with a resilient dual-engine architecture. If the API key is missing, invalid, or rate-limited, the system automatically falls back to our deterministic heuristic engine. It maps domain templates, runs regex cycle/date parsers, and detects financial discrepancies offline, displaying a visible 'Running in basic mode' banner."

### Q4: "Why did you build your own matrix and charts instead of using a library like Chart.js or Recharts?"
**Answer:**  
"Performance and accessibility. Recharts or Chart.js adds over 150 kB of JavaScript, increases First Contentful Paint, and renders SVGs that are difficult for screen readers to navigate. Our custom grid achieved a First Load JS of only 103 kB, zero layout shifts, and provides a toggleable HTML table alternative for screen readers, meeting WCAG 2.2 AA standards."

### Q5: "How do you detect that a source is outdated?"
**Answer:**  
"We built a deterministic cycle and date parser (`src/lib/analysis/freshness.ts`). It uses regular expressions to capture academic/scheme sessions like `2023-24`, `AY 2024-25`, or publication dates, comparing them against the active 2025-26 cycle. Outdated documents are tagged with purple warning badges and penalized in the Readiness Score."

### Q6: "How do you protect against malicious URL submissions (SSRF)?"
**Answer:**  
"Our `/api/ingest` route enforces strict SSRF protections in `src/lib/ingest/ssrf.ts`. We reject non-HTTP/HTTPS protocols and block requests resolving to localhost, loopback (`127.0.0.1`, `::1`), private IPv4 subnets (`10.x`, `172.16.x`, `192.168.x`), and cloud metadata IP addresses (`169.254.169.254`). We also enforce an 8-second timeout and 2MB payload cap."

### Q7: "Why did you use the formula `Severity × Uncertainty × Decision Impact` for the checklist?"
**Answer:**  
"In high-stakes decisions, human attention is the scarcest resource. A contradiction in an income ceiling is Critical Severity (4) and maximum Uncertainty (3) with immediate application rejection Impact (3) = Priority 36. An unverified secondary contact is Low Severity (1) = Priority 3. This mathematical sorting ensures users resolve dealbreakers first."

### Q8: "How does your app comply with responsible AI guidelines?"
**Answer:**  
"We enforce a strict Three-Label system: `SOURCED`, `AI_SIGNAL`, and `UNCERTAIN`. All AI outputs are explicitly labelled as 'Potential gaps' or 'Possible conflicts'—never presented as definitive judicial facts. Furthermore, every finding includes a direct link that opens the original source text with the exact supporting passage highlighted."
