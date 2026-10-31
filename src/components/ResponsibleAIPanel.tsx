import React from "react";
import { ShieldCheck, Info, Scale, Lock } from "lucide-react";

export function ResponsibleAIPanel() {
  return (
    <section
      aria-labelledby="responsible-ai-title"
      className="bg-radar-950/80 border border-radar-800 rounded-xl p-4 sm:p-5 text-xs text-slate-300 space-y-3"
    >
      <div className="flex items-center gap-2 text-slate-100 font-semibold border-b border-radar-800/80 pb-2">
        <Scale className="w-4 h-4 text-sky-400" aria-hidden="true" />
        <h2 id="responsible-ai-title" className="text-sm tracking-tight">
          System Limitations & Responsible AI Transparency Disclosure
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Info className="w-3.5 h-3.5 text-radar-400" />
            <span>AI Signals vs. Verified Facts</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All AI outputs are systematically labelled as <strong>&ldquo;Potential Gaps&rdquo;</strong> and <strong>&ldquo;Possible Conflicts&rdquo;</strong>. DarkSpot Radar does not manufacture claims without citing or cross-referencing ingested source material.
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verbatim Quote Verification</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Every statement attributed to a document undergoes normalized substring verification against the original ingested text. If a quote cannot be verified verbatim, it is automatically downgraded to <strong>UNCERTAIN</strong>.
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Decision Governance</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            DarkSpot Radar is a decision-support aid, not legal, academic, or financial counsel. For irrevocable commitments, always submit official inquiries using the generated Verify-Next checklist.
          </p>
        </div>
      </div>
    </section>
  );
}
