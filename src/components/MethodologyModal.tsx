"use client";

import React, { useEffect, useRef } from "react";
import { X, Radar, ShieldCheck, GitCompare, Target, Clock, CheckCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MethodologyModal({ isOpen, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-radar-900 border border-radar-700 max-w-3xl w-full rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden focus:outline-none">
        {/* Header */}
        <div className="p-5 border-b border-radar-800 bg-radar-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radar className="w-5 h-5 text-sky-400" />
            <div>
              <h2 id="methodology-modal-title" className="text-base font-bold text-slate-100">
                DarkSpot Radar Engine Methodology
              </h2>
              <p className="text-xs text-slate-400">
                Auditing gaps, contradictions, and staleness for high-stakes decisions
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close methodology modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-radar-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              1. The Innovation: Expectation-First Analysis
            </h3>
            <p>
              Standard AI summarizers and search engines can only condense what is <em>already present</em>. They cannot reveal what is omitted. DarkSpot Radar inverts the paradigm: before deeply parsing sources, the engine creates an <strong>Expected Information Map</strong> containing the prerequisite dimensions a prudent person requires for that topic. Any dimension missing across all reviewed sources glows as a <strong>&ldquo;Dark Spot&rdquo;</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              2. Quote-Verified Anti-Hallucination Rigor
            </h3>
            <p>
              AI models frequently fabricate claims. To prevent this, every factual statement extracted by the engine must be accompanied by an exact quotation. The backend executes a <strong>normalized substring verification</strong> against the raw source document. If a quote cannot be verified verbatim, the finding is immediately downgraded to <strong>UNCERTAIN</strong> and flagged with a warning.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-pink-400" />
              3. Conflict Normalization & Trust Weighting
            </h3>
            <p>
              When sources disagree (e.g. Income limit ₹2.5L vs ₹5.0L), the engine normalizes the competing assertions side-by-side. Trust rankings prioritize:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Official Domain Authority:</strong> .gov, .edu, or official institutions carry primary weight.</li>
              <li><strong>Freshness Alignment:</strong> Active cycle notifications (e.g. 2025-26) supersede legacy cycles (2023-24).</li>
              <li>Always phrased as recommendations: <em>&ldquo;Suggest trusting Official Portal; verify directly.&rdquo;</em></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              4. Explainable Decision Readiness Scoring Formula
            </h3>
            <p>
              The 0–100 score is not a machine learning black box. It is computed via an auditable weighted formula:
            </p>
            <div className="bg-radar-950 p-3 rounded-lg font-mono text-[11px] text-slate-200 border border-radar-800 space-y-1">
              <div>• Coverage (30%): (Covered Dimensions / Total Expected Dimensions) × 100</div>
              <div>• Agreement (25%): 100 − (Contradictions × 25)</div>
              <div>• Freshness (20%): 100 − (Stale Sources × 40 + Undated Sources × 20) / Total</div>
              <div>• Source Authority (15%): (Official Sources × 100 + Secondary × 50) / Total</div>
              <div>• Evidence Integrity (10%): (Verified Claims / Total Extracted Claims) × 100</div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-sky-400" />
              5. Verify-Next Priority Ranking
            </h3>
            <p>
              Uncertainty is converted into action. Checklist tasks are sorted by:
              <br />
              <code className="text-sky-300 font-mono">Priority = Severity (1-4) × Uncertainty (1-3) × Impact (1-3)</code>.
              Each item equips the user with official contact channels and a ready-to-copy inquiry email draft.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-radar-800 bg-radar-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
