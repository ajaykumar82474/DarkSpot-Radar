"use client";

import React, { useState } from "react";
import { Finding, Source } from "@/types";
import { ThreeLabelBadge } from "./ThreeLabelBadge";
import { EvidenceDrawer } from "./EvidenceDrawer";
import { AlertCircle, ArrowRight, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  findings: Finding[];
  sources: Source[];
}

export function FindingsList({ findings, sources }: Props) {
  const [activeEvidence, setActiveEvidence] = useState<{
    source: Source;
    quote?: string;
    findingTitle: string;
  } | null>(null);

  return (
    <section
      aria-labelledby="findings-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-4 sm:p-6 shadow-xl space-y-4"
    >
      <div className="border-b border-radar-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h2 id="findings-title" className="text-lg font-bold text-slate-100 tracking-tight">
              Information Gaps & Potential Signals
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            AI-detected blind spots labelled strictly as signals and potential gaps, backed by verifiable citations.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-radar-950 px-2.5 py-1 rounded border border-radar-800">
          {findings.length} Signals Identified
        </span>
      </div>

      <div className="space-y-3">
        {findings.map((finding) => {
          const primarySourceId = finding.sourceIds[0];
          const source = sources.find((s) => s.id === primarySourceId);
          const quote = finding.evidence?.[0]?.quote;

          return (
            <div
              key={finding.id}
              className={`p-4 rounded-xl border space-y-2.5 ${
                finding.type === "GAP"
                  ? "bg-rose-950/20 border-rose-600/40"
                  : finding.type === "CONFLICT"
                  ? "bg-pink-950/20 border-pink-600/40"
                  : "bg-radar-850/80 border-radar-700/70"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ThreeLabelBadge label={finding.label} size="sm" />
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      finding.severity === "CRITICAL"
                        ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                        : "bg-amber-950 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {finding.severity} SEVERITY
                  </span>
                  <span className="text-[11px] font-mono text-radar-400">
                    Type: {finding.type}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Confidence: {Math.round(finding.confidence * 100)}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {finding.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {finding.description}
                </p>
              </div>

              {finding.recommendedAction && (
                <div className="p-2.5 rounded-lg bg-radar-950 border border-radar-800 text-xs text-sky-300 flex items-start gap-2">
                  <span className="font-semibold text-sky-400 shrink-0">Recommendation:</span>
                  <span>{finding.recommendedAction}</span>
                </div>
              )}

              {/* Source inspect action if quote exists */}
              {source && quote && (
                <div className="pt-2 flex items-center justify-between text-xs border-t border-radar-800/80">
                  <span className="text-slate-400 text-[11px] truncate max-w-sm">
                    Ref: &ldquo;{quote.slice(0, 70)}...&rdquo;
                  </span>
                  <button
                    onClick={() =>
                      setActiveEvidence({
                        source,
                        quote,
                        findingTitle: finding.title,
                      })
                    }
                    className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 focus:outline-none shrink-0"
                  >
                    <span>View Quote in Source</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EvidenceDrawer
        isOpen={!!activeEvidence}
        onClose={() => setActiveEvidence(null)}
        source={activeEvidence?.source}
        dimensionName={activeEvidence?.findingTitle}
        selectedQuote={activeEvidence?.quote}
      />
    </section>
  );
}
