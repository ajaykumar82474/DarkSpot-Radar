"use client";

import React, { useState, useEffect } from "react";
import { ChecklistItem } from "@/types";
import { CheckSquare, Square, Copy, Check, Download, AlertOctagon, Mail, ExternalLink } from "lucide-react";
import { exportChecklistToMarkdown } from "@/lib/analysis/checklist";

interface Props {
  checklist: ChecklistItem[];
  topic: string;
  readinessScore: number;
}

export function VerifyChecklist({ checklist, topic, readinessScore }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(checklist);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  // Load persisted checklist completion state from localStorage (wrapped in try/catch)
  useEffect(() => {
    try {
      const storageKey = `verifai-checklist-${topic.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const completedIds: string[] = JSON.parse(saved);
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            completed: completedIds.includes(item.id),
          }))
        );
      }
    } catch {
      // LocalStorage unavailable (private mode or sandbox)
    }
  }, [topic]);

  // Persist completed items to localStorage
  const toggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);

    try {
      const storageKey = `verifai-checklist-${topic.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30)}`;
      const completedIds = updated.filter((it) => it.completed).map((it) => it.id);
      localStorage.setItem(storageKey, JSON.stringify(completedIds));
    } catch {
      // Ignore storage errors
    }
  };

  // Copy helpdesk draft to clipboard
  const handleCopyDraft = async (id: string, draft: string) => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Export to Markdown file download
  const handleExportMarkdown = () => {
    const md = exportChecklistToMarkdown(topic, items, readinessScore);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `darkspot-checklist-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <section
      aria-labelledby="checklist-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-4 sm:p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-radar-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h2 id="checklist-title" className="text-lg font-bold text-slate-100 tracking-tight">
              Prioritized &ldquo;Verify-Next&rdquo; Action Checklist
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Ranked by <code className="text-sky-300">Severity × Uncertainty × Impact</code>. Resolves your biggest blindspots before you make a decision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-300 bg-radar-950 px-3 py-1.5 rounded-lg border border-radar-800">
            Resolved: <span className="text-emerald-400 font-bold">{completedCount}</span> / {items.length}
          </div>
          <button
            onClick={handleExportMarkdown}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-radar-800 hover:bg-radar-700 text-slate-200 border border-radar-700 transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            title="Download full verification checklist as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-radar-400" aria-hidden="true" />
            <span>{exportNotice ? "Exported!" : "Export MD"}</span>
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isDone = item.completed;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? "bg-radar-950/40 border-radar-800/60 opacity-60"
                  : "bg-radar-850/80 border-radar-700/70 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Custom Accessible Checkbox */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  onClick={() => toggleItem(item.id)}
                  aria-label={`Mark task as ${isDone ? "incomplete" : "completed"}: ${item.task}`}
                  className="mt-0.5 text-slate-400 hover:text-sky-400 focus:ring-2 focus:ring-sky-400 rounded focus:outline-none shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3
                      className={`text-sm font-semibold text-slate-100 ${
                        isDone ? "line-through text-slate-500" : ""
                      }`}
                    >
                      <span className="text-radar-400 font-mono text-xs mr-1.5">#{index + 1}</span>
                      {item.task}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-radar-950 border border-radar-800 text-sky-400 font-semibold">
                        Priority {item.priorityScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-amber-300 font-medium">Why it matters:</span> {item.whyItMatters}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-500 font-medium">Where to verify:</span>
                    <span className="text-slate-300">{item.whereToCheck}</span>
                  </div>

                  {/* Helpdesk Query Copy Draft */}
                  <div className="pt-2">
                    <div className="bg-radar-950 p-2.5 rounded-lg border border-radar-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 truncate">
                        <Mail className="w-3.5 h-3.5 text-radar-400 shrink-0" />
                        <span className="text-[11px] font-mono truncate">
                          Draft inquiry query for official helpdesk
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyDraft(item.id, item.helpdeskDraft)}
                        className="text-xs px-2.5 py-1 rounded bg-radar-800 hover:bg-radar-700 text-slate-200 border border-radar-700 transition-colors flex items-center gap-1.5 shrink-0 focus:outline-none"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied Email!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Draft</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
