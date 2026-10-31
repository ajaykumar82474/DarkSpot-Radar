"use client";

import React from "react";
import { EvidenceIntegrityStats, ScoreBreakdown } from "@/types";
import { ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  score: ScoreBreakdown;
  evidenceIntegrity: EvidenceIntegrityStats;
}

export function ReadinessScoreCard({ score, evidenceIntegrity }: Props) {
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400 stroke-emerald-500";
    if (val >= 55) return "text-amber-400 stroke-amber-500";
    return "text-rose-400 stroke-rose-500";
  };

  const getBadgeStyle = (val: number) => {
    if (val >= 80) return "bg-emerald-950/80 text-emerald-300 border-emerald-500/40";
    if (val >= 55) return "bg-amber-950/80 text-amber-300 border-amber-500/40";
    return "bg-rose-950/80 text-rose-300 border-rose-500/40";
  };

  // SVG circle calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.finalScore / 100) * circumference;

  return (
    <section
      aria-labelledby="readiness-score-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-5 sm:p-6 shadow-xl"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-radar-800">
        {/* Score Ring + Verdict */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-radar-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`${getScoreColor(score.finalScore)} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-100 font-mono tracking-tighter">
                {score.finalScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase -mt-1">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono tracking-wider text-radar-400 uppercase">
                Decision Readiness Index
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(
                  score.finalScore
                )}`}
              >
                {score.finalScore >= 80 ? "Decision Ready" : score.finalScore >= 55 ? "Proceed With Caution" : "High Risk / Gaps"}
              </span>
            </div>
            <h2 id="readiness-score-title" className="text-base sm:text-lg font-bold text-slate-100 max-w-xl">
              {score.verdict}
            </h2>
          </div>
        </div>

        {/* Live Evidence Integrity Meter */}
        <div className="bg-radar-950 p-4 rounded-lg border border-radar-800 w-full lg:w-72 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Evidence Integrity
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {evidenceIntegrity.percentage}%
            </span>
          </div>
          <div className="w-full bg-radar-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${evidenceIntegrity.percentage}%` }}
              role="progressbar"
              aria-valuenow={evidenceIntegrity.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Evidence Integrity percentage"
            />
          </div>
          <p className="text-[11px] text-slate-400">
            <span className="text-slate-200 font-medium">
              {evidenceIntegrity.verifiedClaims} of {evidenceIntegrity.totalClaims}
            </span>{" "}
            extracted claims verified verbatim against raw source documents.
          </p>
        </div>
      </div>

      {/* Transparent Breakdown Factors */}
      <div className="pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Explainable Factor Breakdown (No Black Box)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-radar-850/60 rounded-lg border border-radar-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Coverage (30%)</span>
              <span className="font-mono font-bold text-slate-100">{score.coverageScore}/100</span>
            </div>
            <div className="w-full bg-radar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full"
                style={{ width: `${score.coverageScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Dimensions addressed in sources</p>
          </div>

          <div className="p-3 bg-radar-850/60 rounded-lg border border-radar-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Agreement (25%)</span>
              <span className="font-mono font-bold text-slate-100">{score.agreementScore}/100</span>
            </div>
            <div className="w-full bg-radar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full"
                style={{ width: `${score.agreementScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Cross-source consistency</p>
          </div>

          <div className="p-3 bg-radar-850/60 rounded-lg border border-radar-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Freshness (20%)</span>
              <span className="font-mono font-bold text-slate-100">{score.freshnessScore}/100</span>
            </div>
            <div className="w-full bg-radar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-400 h-full rounded-full"
                style={{ width: `${score.freshnessScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Active cycle alignment</p>
          </div>

          <div className="p-3 bg-radar-850/60 rounded-lg border border-radar-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Authority (15%)</span>
              <span className="font-mono font-bold text-slate-100">{score.authorityScore}/100</span>
            </div>
            <div className="w-full bg-radar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${score.authorityScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Official domain presence</p>
          </div>

          <div className="p-3 bg-radar-850/60 rounded-lg border border-radar-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">Quote Integrity (10%)</span>
              <span className="font-mono font-bold text-slate-100">{score.evidenceIntegrityScore}/100</span>
            </div>
            <div className="w-full bg-radar-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full"
                style={{ width: `${score.evidenceIntegrityScore}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Verbatim quote match rate</p>
          </div>
        </div>

        {/* Penalties / Deductions */}
        {score.penalties.length > 0 && (
          <div className="mt-4 p-3 bg-rose-950/25 border border-rose-900/40 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Score Deductions Applied:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-rose-200/90 font-mono">
              {score.penalties.map((pen, i) => (
                <li key={i}>{pen}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
