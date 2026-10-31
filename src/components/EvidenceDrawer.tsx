"use client";

import React, { useEffect, useRef } from "react";
import { Source, Claim } from "@/types";
import { X, ExternalLink, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { ThreeLabelBadge } from "./ThreeLabelBadge";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  source?: Source;
  dimensionName?: string;
  claims?: Claim[];
  selectedQuote?: string;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  source,
  dimensionName,
  claims = [],
  selectedQuote,
}: EvidenceDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard accessibility: Escape to close and focus management
  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !source) return null;

  // Active quote to highlight: either selectedQuote or the first claim's quote
  const quoteToHighlight = selectedQuote || claims[0]?.evidence.quote || "";

  // Split source text to render highlighted quote accurately
  let beforeQuote = source.rawText;
  let highlightedSnippet = "";
  let afterQuote = "";

  if (quoteToHighlight) {
    const cleanQuote = quoteToHighlight.trim();
    const idx = source.rawText.toLowerCase().indexOf(cleanQuote.toLowerCase());
    if (idx !== -1) {
      beforeQuote = source.rawText.substring(0, idx);
      highlightedSnippet = source.rawText.substring(idx, idx + cleanQuote.length);
      afterQuote = source.rawText.substring(idx + cleanQuote.length);
    }
  }

  const isVerified = claims.some((c) => c.evidence.verified) || highlightedSnippet.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        className="w-full max-w-2xl bg-radar-900 border-l border-radar-700/80 h-full flex flex-col shadow-2xl overflow-hidden focus:outline-none"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-radar-800 bg-radar-950 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-wider text-radar-400 uppercase">
                Evidence Inspector
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-sky-400 font-medium">
                {dimensionName || "Dimension Evidence"}
              </span>
            </div>
            <h2 id="evidence-drawer-title" className="text-lg font-semibold text-slate-100 line-clamp-2">
              {source.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span
                className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                  source.authority === "OFFICIAL"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                    : source.authority === "SECONDARY"
                    ? "bg-blue-950/80 text-blue-300 border border-blue-500/30"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}
              >
                {source.authority} SOURCE
              </span>
              {source.extractedCycle && (
                <span className="px-2 py-0.5 rounded bg-radar-800 border border-radar-700 text-slate-300 text-[11px]">
                  Cycle: {source.extractedCycle}
                </span>
              )}
              {source.isStale && (
                <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px]">
                  Outdated Cycle
                </span>
              )}
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close evidence drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-radar-800 transition-colors focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`px-5 py-3 border-b flex items-center justify-between text-xs ${
            isVerified
              ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-300"
              : "bg-amber-950/40 border-amber-900/50 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {isVerified ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            )}
            <span className="font-medium">
              {isVerified
                ? "Quote Verified: Backed by source text"
                : "Unverified: Quote could not be matched verbatim in source text"}
            </span>
          </div>
          <ThreeLabelBadge label={isVerified ? "SOURCED" : "UNCERTAIN"} size="sm" />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Claims List */}
          {claims.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-radar-400" />
                Claims Extracted from This Source
              </h3>
              <div className="space-y-2">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3 rounded-lg bg-radar-850 border border-radar-700/60 text-xs space-y-1.5"
                  >
                    <p className="text-slate-200 font-medium">{claim.statement}</p>
                    <div className="bg-radar-950/80 p-2 rounded border border-radar-800 text-slate-300 text-[11px] italic">
                      &ldquo;{claim.evidence.quote}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text Viewer with Quote Highlight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Source Document Viewer
              </h3>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>

            <div className="p-4 bg-radar-950 border border-radar-800 rounded-lg font-mono text-xs text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-wrap select-text">
              {highlightedSnippet ? (
                <>
                  <span>{beforeQuote}</span>
                  <mark
                    className="bg-amber-400/25 text-amber-200 px-1 py-0.5 rounded border border-amber-400/40 font-semibold"
                    title="Verified matching quotation in source document"
                  >
                    {highlightedSnippet}
                  </mark>
                  <span>{afterQuote}</span>
                </>
              ) : (
                <span>{source.rawText}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-radar-800 bg-radar-950/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-radar-800 hover:bg-radar-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
