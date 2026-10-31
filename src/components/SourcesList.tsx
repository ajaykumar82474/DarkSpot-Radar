"use client";

import React, { useState } from "react";
import { Source } from "@/types";
import { BookOpen, ExternalLink, Calendar, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface Props {
  sources: Source[];
}

export function SourcesList({ sources }: Props) {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  return (
    <section
      aria-labelledby="sources-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-4 sm:p-6 shadow-xl space-y-4"
    >
      <div className="border-b border-radar-800 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h2 id="sources-title" className="text-lg font-bold text-slate-100 tracking-tight">
              Source Authority & Freshness Review
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Audit of analyzed documents, origin domains, cycle dates, and staleness warnings.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-radar-950 px-2.5 py-1 rounded border border-radar-800">
          {sources.length} Documents Analyzed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sources.map((source, index) => {
          return (
            <div
              key={source.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                source.isStale
                  ? "bg-purple-950/20 border-purple-500/40"
                  : "bg-radar-850/80 border-radar-700/70"
              }`}
            >
              <div>
                {/* Authority & Cycle Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      source.authority === "OFFICIAL"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                        : source.authority === "SECONDARY"
                        ? "bg-sky-950 text-sky-300 border-sky-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {source.authority} SOURCE
                  </span>

                  {source.extractedCycle && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-radar-950 border border-radar-800 text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-radar-400" />
                      {source.extractedCycle}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 mb-2">
                  {source.title}
                </h3>

                {/* Date or Freshness Warning */}
                {source.freshnessWarning && (
                  <div className="p-2 rounded bg-radar-950/90 border border-radar-800 text-[11px] text-amber-300 flex items-start gap-1.5 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{source.freshnessWarning}</span>
                  </div>
                )}

                {source.extractedDate && !source.freshnessWarning && (
                  <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-radar-400" />
                    Dated: {source.extractedDate}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-radar-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedSource(source)}
                  className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 focus:outline-none"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Document</span>
                </button>

                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <span>External</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <EvidenceDrawer
        isOpen={!!selectedSource}
        onClose={() => setSelectedSource(null)}
        source={selectedSource || undefined}
        dimensionName="Complete Source Document"
      />
    </section>
  );
}
