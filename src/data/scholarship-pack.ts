/**
 * Scholarship Sample Pack (Clearly labelled SAMPLE DATA for demo).
 * Models a realistic high-stakes scholarship research scenario:
 * Source 1: Official Portal (Current cycle 2025-26)
 * Source 2: Educational Blog (Secondary source with inflated income limit & informal advice)
 * Source 3: Archived Circular (AY 2023-24 PDF text with outdated deadlines and legacy income limit)
 *
 * Guaranteed Demonstration Invariants:
 * - Critical Dark Spot: Renewal policy is completely unmentioned across all sources.
 * - Direct Conflicts: Family income ceiling (₹2.5 Lakh vs ₹5.0 Lakh vs ₹2.0 Lakh), Required documents list.
 * - Outdated Source: Source 3 is dated AY 2023-24 with elapsed deadline.
 * - Evidence Integrity: Exact quotes present for live verification.
 */

import {
  AnalysisResult,
  ExpectedDimension,
  Source,
  DimensionCellCoverage,
  Finding,
  ConflictItem,
} from "@/types";
import { computeDecisionReadinessScore } from "@/lib/analysis/scoring";
import { generateChecklist } from "@/lib/analysis/checklist";
import { verifyQuoteInSource } from "@/lib/analysis/quote-verifier";

export const SCHOLARSHIP_SOURCES: Source[] = [
  {
    id: "src-official",
    title: "National Scholarship Portal - PM-USP Guidelines (Official)",
    url: "https://scholarships.gov.in/schemes/pm-usp-guidelines",
    domain: "scholarships.gov.in",
    authority: "OFFICIAL",
    extractedCycle: "2025-26",
    extractedDate: "2025-08-10",
    isStale: false,
    freshnessWarning: undefined,
    rawText: `NATIONAL SCHOLARSHIP PORTAL (NSP)
SCHEME GUIDELINES FOR PRADHAN MANTRI UCHCHATAR SHIKSHA PROTSAHAN (PM-USP)
Academic Session: 2025-26 | Department of Higher Education, Ministry of Education

1. OBJECTIVE & BENEFIT:
The scheme provides financial assistance of ₹20,000 per annum for undergraduate studies across college and university courses to students from socio-economically weaker sections. Disbursal is made via Direct Benefit Transfer (DBT) directly into the student's Aadhaar-seeded bank account.

2. ELIGIBILITY CRITERIA:
Students above the 80th percentile of successful candidates in the relevant stream from a recognized Class 12th board. Pursuing a regular degree course from a recognized AICTE/UGC university.
Income Ceiling: The parental/family annual income must not exceed ₹2,50,000 (Two Lakh Fifty Thousand Rupees) from all sources. An income certificate issued by a Competent Revenue Authority (not below the rank of Tehsildar) is mandatory.

3. MANDATORY DOCUMENTS REQUIRED:
Applicants must upload the following verified documents:
- Class 12th Board Marksheet
- Competent Revenue Authority Income Certificate (valid for FY 2025-26)
- College Bonafide Student Enrollment Certificate signed by Dean/Principal
- Aadhaar-linked Bank Account Passbook front page
- Active Mobile Number linked to DigiLocker for instant e-KYC.

4. APPLICATION DEADLINE & PORTAL:
Online applications open on August 15, 2025. The deadline for online application submission on the National Scholarship Portal (scholarships.gov.in) is October 31, 2025. Institute verification must be completed by November 15, 2025.

5. SELECTION & QUOTA:
Selection is strictly merit-cum-means based on 12th board percentiles allocated state-wise as per census quotas.

6. HELPDESK & GRIEVANCES:
For assistance, contact the National Scholarship Portal Helpdesk at helpdesk@nsp.gov.in or call toll-free 0120-6619540 (Monday to Friday, 9:00 AM - 5:30 PM).

Note: Scheme terms subject to ministry circulars.`,
  },
  {
    id: "src-blog",
    title: "EduPathway India - Complete PM-USP Scholarship Guide & Review",
    url: "https://edupathway-india.org/pm-usp-scholarship-review",
    domain: "edupathway-india.org",
    authority: "SECONDARY",
    extractedDate: "2025-09-02",
    isStale: false,
    freshnessWarning: "Independent educational blog. Rules should be cross-checked against official gazette.",
    rawText: `EDUPATHWAY INDIA - SCHOLARSHIPS & CAREERS
Guide to PM-USP Central Sector Scholarship Scheme 2025

Are you worried about college tuition? The PM-USP scheme awards ₹20,000 every year to meritorious degree students. Here is our breakdown of everything you need to know.

ELIGIBILITY & RELAXATION:
While initial drafts cited ₹2.5 Lakh, state education forums report that students with family income up to ₹5,00,000 per annum are frequently approved under state quota expansions if vacancy exists. A self-declaration affidavit sworn before a notary is accepted by many private colleges during verification.

DOCUMENTS CHECKLIST:
According to our campus counselors, you only need:
- 10th and 12th passing certificates
- Self-attested notarized income declaration (or salary slip of parents)
- Bank account details (any savings bank account works, Aadhaar seeding is optional)
- College identity card copy.

DEADLINE EXTENSION:
Do not panic if you missed October! NSP traditionally extends the application window until December 15th every single year.

VERDICT:
A fantastic opportunity for all college freshers. Make sure to consult your college admin office early!`,
  },
  {
    id: "src-pdf",
    title: "Dept of Higher Education - Archived Circular Notification (PDF)",
    url: "https://education.gov.in/sites/default/files/archived/pm-usp-2023-24.pdf",
    domain: "education.gov.in",
    authority: "OFFICIAL",
    extractedCycle: "2023-24",
    extractedDate: "2023-07-20",
    isStale: true,
    freshnessWarning: "Refers to an earlier cycle (2023-24). Rules, deadlines and amounts may have changed.",
    rawText: `GOVERNMENT OF INDIA - MINISTRY OF EDUCATION
DEPARTMENT OF HIGHER EDUCATION
NOTIFICATION NO. F.1-4/2023-NS-I
Academic Year: AY 2023-24

Subject: Central Sector Scheme of Scholarship for College and University Students (now subsumed under PM-USP)

1. Total Fresh Scholarships: 82,000 per year (41,000 for boys and 41,000 for girls).
2. Rate of Scholarship: ₹12,000 per annum at Graduation level for first three years.
3. Parental Income Ceiling: The gross annual income ceiling is ₹2,00,000 per annum for the AY 2023-24 cohort. Income certificate from Executive Magistrate is required.
4. Application Period: Portal will be accessible from 1st July 2023 to 30th September 2023. Late submissions will not be entertained.
5. All verification shall be completed through state nodal officers.`,
  },
];

export const SCHOLARSHIP_EXPECTED_DIMENSIONS: ExpectedDimension[] = [
  {
    id: "dim-eligibility",
    name: "Eligibility & Academic Criteria",
    description: "Percentile cutoff, qualifying exam percentage, and degree enrollment prerequisites.",
    importance: "CRITICAL",
  },
  {
    id: "dim-income",
    name: "Family Income Ceiling",
    description: "Maximum annual household income limit and issuing authority for income certificate.",
    importance: "CRITICAL",
  },
  {
    id: "dim-documents",
    name: "Required Documents & KYC",
    description: "Mandatory verification documents, Aadhaar seeding requirements, and certifying authorities.",
    importance: "CRITICAL",
  },
  {
    id: "dim-deadline",
    name: "Application Deadlines & Timeline",
    description: "Opening dates, closing deadlines, and institutional verification windows.",
    importance: "HIGH",
  },
  {
    id: "dim-renewal",
    name: "Renewal Policy & Continuation Rules",
    description: "Minimum GPA/attendance needed to maintain scholarship into 2nd, 3rd, and 4th years.",
    importance: "CRITICAL", // THIS IS THE SIGNATURE DARK SPOT!
  },
  {
    id: "dim-amount",
    name: "Benefit Amount & Disbursal Mode",
    description: "Total annual financial assistance and DBT/account payment structure.",
    importance: "HIGH",
  },
  {
    id: "dim-selection",
    name: "Selection & Quota Allocation",
    description: "How applicants are ranked, reservation quotas, and state-wise seat allocations.",
    importance: "MEDIUM",
  },
  {
    id: "dim-contact",
    name: "Helpdesk & Official Contacts",
    description: "Direct email addresses, helpline phone numbers, and official grievance escalation channels.",
    importance: "MEDIUM",
  },
];

export const SCHOLARSHIP_MATRIX: DimensionCellCoverage[] = [
  // Eligibility
  {
    dimensionId: "dim-eligibility",
    sourceId: "src-official",
    status: "COVERED",
    summary: "Requires >80th percentile in 12th board exams and regular university degree enrollment.",
    claims: [
      {
        id: "cl-1",
        dimensionId: "dim-eligibility",
        sourceId: "src-official",
        statement: "Students must be above the 80th percentile of successful candidates in Class 12th board.",
        evidence: {
          sourceId: "src-official",
          quote: "Students above the 80th percentile of successful candidates in the relevant stream from a recognized Class 12th board.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-eligibility",
    sourceId: "src-blog",
    status: "PARTIAL",
    summary: "Mentions eligibility for college freshers with informal advice on quota expansions.",
    claims: [
      {
        id: "cl-2",
        dimensionId: "dim-eligibility",
        sourceId: "src-blog",
        statement: "Awards ₹20,000 every year to meritorious degree students.",
        evidence: {
          sourceId: "src-blog",
          quote: "awards ₹20,000 every year to meritorious degree students",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-eligibility",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "Lists 82,000 quota division for AY 2023-24 cohort.",
    claims: [
      {
        id: "cl-3",
        dimensionId: "dim-eligibility",
        sourceId: "src-pdf",
        statement: "82,000 scholarships divided 41,000 for boys and 41,000 for girls in 2023-24.",
        evidence: {
          sourceId: "src-pdf",
          quote: "Total Fresh Scholarships: 82,000 per year (41,000 for boys and 41,000 for girls).",
          verified: true,
        },
      },
    ],
  },

  // Family Income Ceiling (CONFLICTING)
  {
    dimensionId: "dim-income",
    sourceId: "src-official",
    status: "CONFLICTING",
    summary: "Strict ₹2,50,000 family income ceiling with Tehsildar certificate mandatory.",
    claims: [
      {
        id: "cl-4",
        dimensionId: "dim-income",
        sourceId: "src-official",
        statement: "Parental/family annual income must not exceed ₹2,50,000 from all sources.",
        evidence: {
          sourceId: "src-official",
          quote: "The parental/family annual income must not exceed ₹2,50,000 (Two Lakh Fifty Thousand Rupees) from all sources.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-income",
    sourceId: "src-blog",
    status: "CONFLICTING",
    summary: "Claims students with income up to ₹5,00,000 are approved with notary affidavit.",
    claims: [
      {
        id: "cl-5",
        dimensionId: "dim-income",
        sourceId: "src-blog",
        statement: "Students with family income up to ₹5,00,000 per annum are approved under quota expansions.",
        evidence: {
          sourceId: "src-blog",
          quote: "students with family income up to ₹5,00,000 per annum are frequently approved",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-income",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "Old circular specifies ₹2,00,000 ceiling from 2023-24.",
    claims: [
      {
        id: "cl-6",
        dimensionId: "dim-income",
        sourceId: "src-pdf",
        statement: "Gross annual income ceiling is ₹2,00,000 per annum for the AY 2023-24 cohort.",
        evidence: {
          sourceId: "src-pdf",
          quote: "The gross annual income ceiling is ₹2,00,000 per annum for the AY 2023-24 cohort.",
          verified: true,
        },
      },
    ],
  },

  // Required Documents (CONFLICTING)
  {
    dimensionId: "dim-documents",
    sourceId: "src-official",
    status: "CONFLICTING",
    summary: "Mandates Revenue Authority Income Certificate, Bonafide Enrollment, and Aadhaar DBT seeding.",
    claims: [
      {
        id: "cl-7",
        dimensionId: "dim-documents",
        sourceId: "src-official",
        statement: "Competent Revenue Authority Income Certificate (valid for FY 2025-26) and Aadhaar-linked Bank Passbook.",
        evidence: {
          sourceId: "src-official",
          quote: "Competent Revenue Authority Income Certificate (valid for FY 2025-26)",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-documents",
    sourceId: "src-blog",
    status: "CONFLICTING",
    summary: "Contradicts official rules by claiming notary affidavit is sufficient and Aadhaar seeding is optional.",
    claims: [
      {
        id: "cl-8",
        dimensionId: "dim-documents",
        sourceId: "src-blog",
        statement: "Claims Aadhaar seeding is optional and any savings bank account works.",
        evidence: {
          sourceId: "src-blog",
          quote: "any savings bank account works, Aadhaar seeding is optional",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-documents",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "Requires Executive Magistrate income certificate.",
    claims: [
      {
        id: "cl-9",
        dimensionId: "dim-documents",
        sourceId: "src-pdf",
        statement: "Income certificate from Executive Magistrate is required.",
        evidence: {
          sourceId: "src-pdf",
          quote: "Income certificate from Executive Magistrate is required.",
          verified: true,
        },
      },
    ],
  },

  // Deadlines
  {
    dimensionId: "dim-deadline",
    sourceId: "src-official",
    status: "COVERED",
    summary: "Online deadline is October 31, 2025; Institute verification deadline is November 15, 2025.",
    claims: [
      {
        id: "cl-10",
        dimensionId: "dim-deadline",
        sourceId: "src-official",
        statement: "The deadline for online application submission on the National Scholarship Portal (scholarships.gov.in) is October 31, 2025.",
        evidence: {
          sourceId: "src-official",
          quote: "The deadline for online application submission on the National Scholarship Portal (scholarships.gov.in) is October 31, 2025.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-deadline",
    sourceId: "src-blog",
    status: "PARTIAL",
    summary: "Speculates window is always extended until December 15th.",
    claims: [
      {
        id: "cl-11",
        dimensionId: "dim-deadline",
        sourceId: "src-blog",
        statement: "NSP traditionally extends the application window until December 15th every single year.",
        evidence: {
          sourceId: "src-blog",
          quote: "NSP traditionally extends the application window until December 15th every single year.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-deadline",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "Old deadline 30th September 2023.",
    claims: [
      {
        id: "cl-12",
        dimensionId: "dim-deadline",
        sourceId: "src-pdf",
        statement: "Portal will be accessible from 1st July 2023 to 30th September 2023.",
        evidence: {
          sourceId: "src-pdf",
          quote: "Portal will be accessible from 1st July 2023 to 30th September 2023.",
          verified: true,
        },
      },
    ],
  },

  // Renewal Policy -> COMPLETE DARK SPOT (ALL MISSING)
  {
    dimensionId: "dim-renewal",
    sourceId: "src-official",
    status: "MISSING",
    summary: "CRITICAL GAP: Official scheme guidelines completely omit renewal conditions, minimum CGPA, and back-paper policies.",
    claims: [],
  },
  {
    dimensionId: "dim-renewal",
    sourceId: "src-blog",
    status: "MISSING",
    summary: "No mention of renewal requirements or continuing eligibility.",
    claims: [],
  },
  {
    dimensionId: "dim-renewal",
    sourceId: "src-pdf",
    status: "MISSING",
    summary: "Archived circular contains no renewal framework.",
    claims: [],
  },

  // Amount & Benefit
  {
    dimensionId: "dim-amount",
    sourceId: "src-official",
    status: "COVERED",
    summary: "₹20,000 per annum for undergraduate degree via Aadhaar DBT.",
    claims: [
      {
        id: "cl-13",
        dimensionId: "dim-amount",
        sourceId: "src-official",
        statement: "Financial assistance of ₹20,000 per annum for undergraduate studies via DBT.",
        evidence: {
          sourceId: "src-official",
          quote: "financial assistance of ₹20,000 per annum for undergraduate studies across college and university courses",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-amount",
    sourceId: "src-blog",
    status: "COVERED",
    summary: "Mentions ₹20,000 annual aid.",
    claims: [
      {
        id: "cl-14",
        dimensionId: "dim-amount",
        sourceId: "src-blog",
        statement: "The PM-USP scheme awards ₹20,000 every year to meritorious degree students.",
        evidence: {
          sourceId: "src-blog",
          quote: "The PM-USP scheme awards ₹20,000 every year to meritorious degree students.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-amount",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "Legacy rate was ₹12,000 per annum for first three years in 2023-24.",
    claims: [
      {
        id: "cl-15",
        dimensionId: "dim-amount",
        sourceId: "src-pdf",
        statement: "Rate of Scholarship: ₹12,000 per annum at Graduation level for first three years.",
        evidence: {
          sourceId: "src-pdf",
          quote: "Rate of Scholarship: ₹12,000 per annum at Graduation level for first three years.",
          verified: true,
        },
      },
    ],
  },

  // Selection
  {
    dimensionId: "dim-selection",
    sourceId: "src-official",
    status: "COVERED",
    summary: "Merit-cum-means selection based on state 12th board quotas.",
    claims: [
      {
        id: "cl-16",
        dimensionId: "dim-selection",
        sourceId: "src-official",
        statement: "Selection is strictly merit-cum-means based on 12th board percentiles allocated state-wise.",
        evidence: {
          sourceId: "src-official",
          quote: "Selection is strictly merit-cum-means based on 12th board percentiles allocated state-wise as per census quotas.",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-selection",
    sourceId: "src-blog",
    status: "MISSING",
    summary: "No quota selection details provided.",
    claims: [],
  },
  {
    dimensionId: "dim-selection",
    sourceId: "src-pdf",
    status: "OUTDATED",
    summary: "50-50 boy/girl fixed split of 82,000 awards from 2023 circular.",
    claims: [],
  },

  // Contact / Helpdesk
  {
    dimensionId: "dim-contact",
    sourceId: "src-official",
    status: "COVERED",
    summary: "Official email helpdesk@nsp.gov.in and phone 0120-6619540.",
    claims: [
      {
        id: "cl-17",
        dimensionId: "dim-contact",
        sourceId: "src-official",
        statement: "Contact helpdesk at helpdesk@nsp.gov.in or call toll-free 0120-6619540.",
        evidence: {
          sourceId: "src-official",
          quote: "contact the National Scholarship Portal Helpdesk at helpdesk@nsp.gov.in or call toll-free 0120-6619540",
          verified: true,
        },
      },
    ],
  },
  {
    dimensionId: "dim-contact",
    sourceId: "src-blog",
    status: "PARTIAL",
    summary: "Suggests contacting college administrative clerk.",
    claims: [],
  },
  {
    dimensionId: "dim-contact",
    sourceId: "src-pdf",
    status: "MISSING",
    summary: "No central contact information given.",
    claims: [],
  },
];

export const SCHOLARSHIP_FINDINGS: Finding[] = [
  {
    id: "find-gap-renewal",
    type: "GAP",
    dimensionId: "dim-renewal",
    title: "Critical Information Dark Spot: Renewal Terms Unspecified",
    description: "None of the reviewed sources describe continuation criteria for Year 2 and beyond. It is completely unknown whether a minimum 75% attendance or 7.0 CGPA is required, or what happens if a candidate has an exam backlog.",
    label: "AI_SIGNAL",
    severity: "CRITICAL",
    confidence: 0.95,
    sourceIds: ["src-official", "src-blog", "src-pdf"],
    recommendedAction: "Do not budget for a multi-year degree on this scholarship until getting written confirmation of Year 2+ renewal rules from NSP.",
  },
  {
    id: "find-conflict-income",
    type: "CONFLICT",
    dimensionId: "dim-income",
    title: "Conflicting Family Income Ceilings (₹2.5L vs ₹5.0L vs ₹2.0L)",
    description: "The Official Portal mandates ₹2.5 Lakh with a Tehsildar certificate, EduPathway blog claims up to ₹5.0 Lakh is accepted, while the 2023 notification lists ₹2.0 Lakh.",
    label: "SOURCED",
    severity: "CRITICAL",
    confidence: 0.98,
    sourceIds: ["src-official", "src-blog", "src-pdf"],
    evidence: [
      {
        sourceId: "src-official",
        quote: "The parental/family annual income must not exceed ₹2,50,000 (Two Lakh Fifty Thousand Rupees) from all sources.",
        verified: true,
      },
      {
        sourceId: "src-blog",
        quote: "students with family income up to ₹5,00,000 per annum are frequently approved",
        verified: true,
      },
    ],
    recommendedAction: "Rely exclusively on the official ₹2,50,000 ceiling. Following the blog's ₹5.0 Lakh claim risks outright rejection and blacklisting.",
  },
  {
    id: "find-conflict-aadhaar",
    type: "CONFLICT",
    dimensionId: "dim-documents",
    title: "Contradiction on Aadhaar-Seeded Bank Account Requirement",
    description: "Official portal strictly mandates Aadhaar-seeded bank account for DBT payment, whereas the blog falsely claims 'any savings bank account works, Aadhaar seeding is optional'.",
    label: "SOURCED",
    severity: "HIGH",
    confidence: 0.95,
    sourceIds: ["src-official", "src-blog"],
    evidence: [
      {
        sourceId: "src-official",
        quote: "Aadhaar-linked Bank Account Passbook front page",
        verified: true,
      },
      {
        sourceId: "src-blog",
        quote: "any savings bank account works, Aadhaar seeding is optional",
        verified: true,
      },
    ],
    recommendedAction: "Ensure your bank account is Aadhaar seeded with NPCI mapper immediately. Unseeded accounts fail DBT transfer.",
  },
  {
    id: "find-stale-source",
    type: "STALE",
    dimensionId: "dim-deadline",
    title: "Stale Circular from Prior Session (AY 2023-24)",
    description: "Source 3 references AY 2023-24 circular with an outdated deadline of 30th September 2023 and old disbursal rates (₹12,000 instead of current ₹20,000).",
    label: "SOURCED",
    severity: "HIGH",
    confidence: 1.0,
    sourceIds: ["src-pdf"],
    evidence: [
      {
        sourceId: "src-pdf",
        quote: "Academic Year: AY 2023-24",
        verified: true,
      },
    ],
    recommendedAction: "Discard all timeline and financial figures from this archived notification.",
  },
];

export const SCHOLARSHIP_CONFLICTS: ConflictItem[] = [
  {
    id: "conflict-income",
    dimensionId: "dim-income",
    aspect: "Annual Family Income Ceiling",
    values: [
      {
        sourceId: "src-official",
        sourceTitle: "National Scholarship Portal (Official)",
        authority: "OFFICIAL",
        statedValue: "₹2,50,000 per annum (Tehsildar certificate mandatory)",
        quote: "The parental/family annual income must not exceed ₹2,50,000 (Two Lakh Fifty Thousand Rupees) from all sources.",
        verified: true,
        cycle: "2025-26",
      },
      {
        sourceId: "src-blog",
        sourceTitle: "EduPathway India (Blog)",
        authority: "SECONDARY",
        statedValue: "₹5,00,000 per annum (Notary affidavit accepted)",
        quote: "students with family income up to ₹5,00,000 per annum are frequently approved",
        verified: true,
        cycle: undefined,
      },
      {
        sourceId: "src-pdf",
        sourceTitle: "Archived Circular (PDF)",
        authority: "OFFICIAL",
        statedValue: "₹2,00,000 per annum (Executive Magistrate)",
        quote: "The gross annual income ceiling is ₹2,00,000 per annum for the AY 2023-24 cohort.",
        verified: true,
        cycle: "2023-24",
      },
    ],
    suggestedTrustSourceId: "src-official",
    resolutionReasoning: "Suggest trusting 'National Scholarship Portal (Official)' as it reflects the current 2025-26 cycle. The blog's ₹5.0L claim is unverified hearsay, and the PDF is outdated (2023-24).",
  },
  {
    id: "conflict-banking",
    dimensionId: "dim-documents",
    aspect: "Bank Account & Aadhaar Seeding Rule",
    values: [
      {
        sourceId: "src-official",
        sourceTitle: "National Scholarship Portal (Official)",
        authority: "OFFICIAL",
        statedValue: "Aadhaar-linked DBT account mandatory",
        quote: "Aadhaar-linked Bank Account Passbook front page",
        verified: true,
        cycle: "2025-26",
      },
      {
        sourceId: "src-blog",
        sourceTitle: "EduPathway India (Blog)",
        authority: "SECONDARY",
        statedValue: "Any bank account, Aadhaar seeding optional",
        quote: "any savings bank account works, Aadhaar seeding is optional",
        verified: true,
        cycle: undefined,
      },
    ],
    suggestedTrustSourceId: "src-official",
    resolutionReasoning: "Trust the official portal. Central government DBT guidelines strictly require NPCI Aadhaar bank mapping; non-seeded accounts fail fund disbursement.",
  },
];

/**
 * Returns the fully hydrated scholarship analysis result.
 * Runs deterministic quote verification and scoring live.
 */
export function getScholarshipDemoAnalysis(): AnalysisResult {
  const sources = SCHOLARSHIP_SOURCES;
  const dimensions = SCHOLARSHIP_EXPECTED_DIMENSIONS;
  const matrix = SCHOLARSHIP_MATRIX;
  const findings = SCHOLARSHIP_FINDINGS;
  const conflicts = SCHOLARSHIP_CONFLICTS;

  // Run live quote verification on claims
  let totalClaims = 0;
  let verifiedClaims = 0;

  for (const cell of matrix) {
    for (const claim of cell.claims) {
      totalClaims++;
      const src = sources.find((s) => s.id === claim.sourceId);
      if (src) {
        const verifyRes = verifyQuoteInSource(claim.evidence.quote, src.rawText);
        claim.evidence.verified = verifyRes.verified;
        if (verifyRes.verified) {
          verifiedClaims++;
        }
      }
    }
  }

  // Calculate live score
  const score = computeDecisionReadinessScore({
    sources,
    expectedDimensions: dimensions,
    matrix,
    findings,
    conflictsCount: conflicts.length,
    totalClaims,
    verifiedClaims,
  });

  // Generate live checklist
  const checklist = generateChecklist(
    findings,
    conflicts,
    dimensions,
    sources,
    "PM-USP Central Sector Scholarship"
  );

  return {
    id: "demo-scholarship-analysis",
    topic: "PM-USP Scholarship Eligibility, Documents & Renewal (Central Sector Scheme)",
    timestamp: new Date().toISOString(),
    isBasicMode: false,
    sources,
    expectedDimensions: dimensions,
    matrix,
    findings,
    conflicts,
    score,
    checklist,
    evidenceIntegrity: {
      totalClaims,
      verifiedClaims,
      percentage: totalClaims > 0 ? Math.round((verifiedClaims / totalClaims) * 100) : 100,
    },
    executiveSummary: {
      overview: "Analysis of 3 sources for PM-USP Scholarship uncovered 1 critical dark spot (renewal policy is entirely missing), 2 major contradictions regarding family income ceiling and Aadhaar DBT seeding, and 1 outdated source referencing past 2023-24 circulars.",
      criticalGapsCount: 1,
      conflictsCount: conflicts.length,
      staleSourcesCount: sources.filter((s) => s.isStale).length,
    },
  };
}
