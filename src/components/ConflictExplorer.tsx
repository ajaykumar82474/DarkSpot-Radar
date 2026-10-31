"use client";

import React, { useState } from "react";
import { ConflictItem, Source } from "@/types";
import { GitCompare, ShieldAlert, CheckCircle, ExternalLink, ArrowRight } from "lucide-react";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface Props {
  conflicts: ConflictItem[];
  sources: Source[];
}

export function ConflictExplorer({ conflicts, sources }: Props) {
  const [activeEvidence, setActiveEvidence] = useState<{
    source: Source;
    quote: string;
    aspect: string;
  } | null>(null);

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="bg-radar-900 border border-radar-800 rounded-xl p-5 text-center text-slate-400 text-xs">
        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        No direct contradictions detected among the analyzed sources.
      </div>
    );
  }

  return (
    <section
      aria-labelledby="conflicts-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-4 sm:p-6 shadow-xl space-y-5"
    >
      <div className="border-b border-radar-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="w-5 h-5 text-pink-500" aria-hidden="true" />
          <h2 id="conflicts-title" className="text-lg font-bold text-slate-100 tracking-tight">
            Cross-Source Conflict Explorer
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Normalized competing statements detected across sources. Ranked with trust suggestions and rationale.
        </p>
      </div>

      <div className="space-y-4">
        {conflicts.map((conflict) => {
          const trustedSource = sources.find((s) => s.id === conflict.suggestedTrustSourceId);

          return (
            <div
              key={conflict.id}
              className="p-4 sm:p-5 rounded-xl bg-radar-850/80 border border-radar-700/70 space-y-4 shadow-md"
            >
              {/* Aspect Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-radar-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-pink-400 font-semibold">
                  Contradiction: {conflict.aspect}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-pink-950/60 border border-pink-500/30 text-pink-300 font-mono">
                  {conflict.values.length} Disagreeing Sources
                </span>
              </div>

              {/* Side-by-Side Values Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {conflict.values.map((val) => {
                  const src = sources.find((s) => s.id === val.sourceId);
                  const isTrusted = conflict.suggestedTrustSourceId === val.sourceId;

                  return (
                    <div
                      key={val.sourceId}
                      className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                        isTrusted
                          ? "bg-radar-800/90 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.12)]"
                          : "bg-radar-900 border-radar-800"
                      }`}
                    >
                      <div>
                        {/* Source Authority & Cycle Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                              val.authority === "OFFICIAL"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {val.authority}
                          </span>
                          {val.cycle && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Cycle: {val.cycle}
                            </span>
                          )}
                          {isTrusted && (
                            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              ✓ Recommended
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="text-xs font-medium text-slate-200 line-clamp-1 mb-2">
                          {val.sourceTitle}
                        </p>

                        {/* Stated Value */}
                        <div className="bg-radar-950 p-2.5 rounded border border-radar-800 text-xs font-semibold text-slate-100 mb-2">
                          {val.statedValue}
                        </div>

                        {/* Verbatim Quote */}
                        <p className="text-[11px] text-slate-400 italic line-clamp-3">
                          &ldquo;{val.quote}&rdquo;
                        </p>
                      </div>

                      {/* Inspect Quote Button */}
                      {src && (
                        <button
                          onClick={() =>
                            setActiveEvidence({
                              source: src,
                              quote: val.quote,
                              aspect: conflict.aspect,
                            })
                          }
                          className="mt-3 text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 pt-2 border-t border-radar-800/80 focus:outline-none"
                        >
                          <span>Inspect in Source Text</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Resolution Reasoning & Advice */}
              <div className="p-3 bg-radar-950 rounded-lg border border-radar-800 flex items-start gap-2.5 text-xs">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-slate-300 space-y-0.5">
                  <span className="font-semibold text-emerald-300">
                    Engine Trust Recommendation:
                  </span>{" "}
                  <span>{conflict.resolutionReasoning}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <EvidenceDrawer
        isOpen={!!activeEvidence}
        onClose={() => setActiveEvidence(null)}
        source={activeEvidence?.source}
        dimensionName={activeEvidence?.aspect}
        selectedQuote={activeEvidence?.quote}
      />
    </section>
  );
}
