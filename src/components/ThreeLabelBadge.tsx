import React from "react";
import { FindingLabel } from "@/types";
import { CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  label: FindingLabel;
  size?: "sm" | "md";
}

export function ThreeLabelBadge({ label, size = "md" }: Props) {
  const isSm = size === "sm";

  if (label === "SOURCED") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded border ${
          isSm ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        } bg-emerald-950/70 border-emerald-500/40 text-emerald-300`}
        title="Directly backed by a verified verbatim quote from an analyzed source."
      >
        <CheckCircle2 className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />
        <span>SOURCED</span>
      </span>
    );
  }

  if (label === "AI_SIGNAL") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded border ${
          isSm ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        } bg-sky-950/70 border-sky-500/40 text-sky-300`}
        title="Inferred by gap-detection engine. Always labelled as a potential signal, not a definitive fact."
      >
        <Sparkles className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />
        <span>AI SIGNAL</span>
      </span>
    );
  }

  // UNCERTAIN
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded border ${
        isSm ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      } bg-amber-950/70 border-amber-500/40 text-amber-300`}
      title="Quote could not be verified verbatim in source, or backed only by an unverified source."
    >
      <AlertTriangle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} aria-hidden="true" />
      <span>UNCERTAIN</span>
    </span>
  );
}

export function LabelLegend() {
  return (
    <div
      className="p-3 bg-radar-900 border border-radar-700/60 rounded-lg text-xs space-y-2 text-slate-300"
      role="region"
      aria-label="Evidence and AI Signal Transparency Legend"
    >
      <div className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] flex items-center justify-between">
        <span>Three-Label Evidence Legend</span>
        <span className="text-[10px] text-radar-400 font-normal">Strict Anti-Hallucination Standard</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <div className="flex items-start gap-2">
          <ThreeLabelBadge label="SOURCED" size="sm" />
          <p className="text-[11px] text-slate-400">Exact verbatim quote verified in source text.</p>
        </div>
        <div className="flex items-start gap-2">
          <ThreeLabelBadge label="AI_SIGNAL" size="sm" />
          <p className="text-[11px] text-slate-400">Potential gap or contradiction identified by the engine.</p>
        </div>
        <div className="flex items-start gap-2">
          <ThreeLabelBadge label="UNCERTAIN" size="sm" />
          <p className="text-[11px] text-slate-400">Unverified quote or single unconfirmed source.</p>
        </div>
      </div>
    </div>
  );
}
