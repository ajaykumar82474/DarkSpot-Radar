"use client";

import React, { useState } from "react";
import { AnalysisResult, Source } from "@/types";
import { getScholarshipDemoAnalysis } from "@/data/scholarship-pack";
import { DarkSpotMap } from "@/components/DarkSpotMap";
import { ReadinessScoreCard } from "@/components/ReadinessScoreCard";
import { ConflictExplorer } from "@/components/ConflictExplorer";
import { VerifyChecklist } from "@/components/VerifyChecklist";
import { FindingsList } from "@/components/FindingsList";
import { SourcesList } from "@/components/SourcesList";
import { LabelLegend } from "@/components/ThreeLabelBadge";
import { ResponsibleAIPanel } from "@/components/ResponsibleAIPanel";
import { MethodologyModal } from "@/components/MethodologyModal";
import {
  Radar,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Globe,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [customSources, setCustomSources] = useState<Source[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [isUrlIngesting, setIsUrlIngesting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal
  const [showMethodology, setShowMethodology] = useState(false);

  // Quick 1-click scholarship demo flow
  const handleRunScholarshipDemo = () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStage(1);

    // Simulate staged pipeline for rich UX feedback
    setTimeout(() => setAnalysisStage(2), 600);
    setTimeout(() => setAnalysisStage(3), 1200);
    setTimeout(() => setAnalysisStage(4), 1800);
    setTimeout(() => {
      const demo = getScholarshipDemoAnalysis();
      setTopic(demo.topic);
      setAnalysisResult(demo);
      setIsAnalyzing(false);
      setAnalysisStage(0);
    }, 2200);
  };

  // URL Ingest
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsUrlIngesting(true);
    setUrlError(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest URL");
      }

      setCustomSources((prev) => [...prev, data.source]);
      setUrlInput("");
    } catch (err: unknown) {
      setUrlError((err as Error)?.message || "Failed to ingest URL");
    } finally {
      setIsUrlIngesting(false);
    }
  };

  // Text Paste Ingest
  const handleAddPastedText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteText.trim()) return;

    const newSource: Source = {
      id: `src-${Date.now()}`,
      title: pasteTitle.trim(),
      authority: "COMMUNITY_OR_UNKNOWN",
      rawText: pasteText.trim(),
    };

    setCustomSources((prev) => [...prev, newSource]);
    setPasteTitle("");
    setPasteText("");
  };

  // Remove source
  const handleRemoveSource = (id: string) => {
    setCustomSources((prev) => prev.filter((s) => s.id !== id));
  };

  // Run live custom analysis
  const handleRunCustomAnalysis = async () => {
    if (!topic.trim()) {
      setErrorMessage("Please enter your research topic or question.");
      return;
    }

    if (customSources.length === 0) {
      setErrorMessage("Please add at least one source (URL or pasted text) to audit.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStage(1);

    const stageTimer1 = setTimeout(() => setAnalysisStage(2), 800);
    const stageTimer2 = setTimeout(() => setAnalysisStage(3), 1600);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          sources: customSources.map((s) => ({
            id: s.id,
            title: s.title,
            url: s.url,
            rawText: s.rawText,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysisStage(4);
      setTimeout(() => {
        setAnalysisResult(data.result);
        setIsAnalyzing(false);
        setAnalysisStage(0);
      }, 500);
    } catch (err: unknown) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setErrorMessage((err as Error)?.message || "An unexpected error occurred during analysis.");
      setIsAnalyzing(false);
      setAnalysisStage(0);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setTopic("");
    setCustomSources([]);
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-radar-800 bg-radar-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-radar-900 border border-radar-700/80 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Radar className="w-5 h-5 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                  DarkSpot Radar
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/30">
                  Shinchan Hackathon 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Digital Dark Spot: AI-Assisted Information Gap Detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowMethodology(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-radar-900 hover:bg-radar-800 text-slate-200 border border-radar-700 transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>How It Works</span>
            </button>
            {analysisResult && (
              <button
                onClick={handleReset}
                className="text-xs px-3 py-1.5 rounded-lg bg-radar-800 hover:bg-radar-700 text-slate-200 transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>New Audit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Landing / Input Section (shown when no result) */}
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-8 max-w-4xl mx-auto pt-4 sm:pt-10">
            {/* Hero Pitch */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radar-900 border border-radar-700 text-xs text-sky-300 font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Expectation-First AI Gap Detection Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
                See what your sources <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-rose-400">
                  don&apos;t tell you.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Standard summarizers only condense what&apos;s there. DarkSpot Radar creates an Expected Information Map to reveal <strong>missing prerequisites</strong>, <strong>conflicting eligibility rules</strong>, and <strong>outdated cycle data</strong> before you make high-stakes decisions.
              </p>
            </div>

            {/* 1-Click Competition Demo Button */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-radar-900 to-radar-950 border border-sky-500/30 shadow-[0_0_25px_rgba(56,189,248,0.12)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40 uppercase">
                      Competition Demo Pack
                    </span>
                    <span className="text-xs text-slate-400">Ready in &lt; 2 seconds • Zero setup</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 mt-1">
                    PM-USP Scholarship Scenario (Official vs Blog vs Archived Circular)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Demonstrates a critical missing renewal dark spot, 2 direct income & Aadhaar contradictions, and a stale 2023-24 circular.
                  </p>
                </div>

                <button
                  onClick={handleRunScholarshipDemo}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0 transition-transform active:scale-95 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <span>Launch Scholarship Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Audit Section */}
            <div className="bg-radar-900/70 border border-radar-800 rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="border-b border-radar-800 pb-4">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Radar className="w-4 h-4 text-sky-400" />
                  <span>Audit Custom Topic & Sources</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your question or decision goal, then ingest live URLs or paste document text.
                </p>
              </div>

              {/* Topic Input */}
              <div className="space-y-1.5">
                <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  1. Research Goal / Question / Scheme Name
                </label>
                <input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. National Merit Fellowship Eligibility & Selection Guidelines"
                  className="w-full px-4 py-3 rounded-xl bg-radar-950 border border-radar-700/80 text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-transparent focus:outline-none"
                />
              </div>

              {/* Source Ingestion Tabs */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  2. Add Sources to Compare & Audit
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* URL Ingest Form */}
                  <form onSubmit={handleAddUrl} className="p-4 rounded-xl bg-radar-950 border border-radar-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Fetch Live Webpage (SSRF Protected)</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://scholarships.gov.in/scheme"
                        className="flex-1 px-3 py-2 rounded-lg bg-radar-900 border border-radar-750 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isUrlIngesting || !urlInput.trim()}
                        className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors shrink-0"
                      >
                        {isUrlIngesting ? "Fetching..." : "Add URL"}
                      </button>
                    </div>
                    {urlError && <p className="text-[11px] text-rose-400">{urlError}</p>}
                  </form>

                  {/* Paste Text Form */}
                  <form onSubmit={handleAddPastedText} className="p-4 rounded-xl bg-radar-950 border border-radar-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>Paste Document Text</span>
                    </div>
                    <input
                      type="text"
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      placeholder="Source title (e.g. Circular Notification PDF)"
                      className="w-full px-3 py-1.5 rounded-lg bg-radar-900 border border-radar-750 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="Paste extracted or copied text here..."
                      className="w-full px-3 py-1.5 rounded-lg bg-radar-900 border border-radar-750 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!pasteTitle.trim() || !pasteText.trim()}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors"
                      >
                        Add Pasted Source
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Added Sources List */}
              {customSources.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                      Staged Sources ({customSources.length})
                    </span>
                    <button
                      onClick={() => setCustomSources([])}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {customSources.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg bg-radar-950 border border-radar-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate">
                          <span className="font-medium text-slate-200">{s.title}</span>
                          {s.url && (
                            <span className="text-slate-500 ml-2 font-mono text-[11px]">
                              {s.url}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveSource(s.id)}
                          aria-label={`Remove source ${s.title}`}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error notice */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Run Button */}
              <div className="pt-2">
                <button
                  onClick={handleRunCustomAnalysis}
                  disabled={!topic.trim() || customSources.length === 0}
                  className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <Radar className="w-4 h-4" />
                  <span>Run Deep Gap & Contradiction Audit</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staged Loading Progress View */}
        {isAnalyzing && (
          <div
            className="max-w-xl mx-auto py-16 space-y-8"
            role="status"
            aria-live="polite"
          >
            <div className="text-center space-y-3">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-sky-500/30 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-radar-900 border border-sky-400 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                  <Radar className="w-6 h-6 animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                Auditing Digital Dark Spots...
              </h2>
              <p className="text-xs text-slate-400">
                Running expectation-first dimension mapping and normalized quote verification.
              </p>
            </div>

            {/* Stepper */}
            <div className="space-y-3 bg-radar-900/90 border border-radar-800 p-5 rounded-2xl shadow-xl">
              {[
                { stage: 1, title: "Collecting & Cleaning Sources", desc: "SSRF guard passed, extracting readable plain text" },
                { stage: 2, title: "Mapping Expected Information Dimensions", desc: "Formulating what a careful person must verify for this domain" },
                { stage: 3, title: "Quote-Verified Anti-Hallucination & Conflict Audit", desc: "Testing verbatim quotes against raw texts and isolating contradictions" },
                { stage: 4, title: "Scoring Decision Readiness & Prioritizing Next Steps", desc: "Generating explainable 0-100 index and verify-next checklist" },
              ].map((step) => {
                const isDone = analysisStage > step.stage;
                const isCurrent = analysisStage === step.stage;

                return (
                  <div key={step.stage} className="flex items-start gap-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-[11px] font-bold mt-0.5 ${
                        isDone
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500"
                          : isCurrent
                          ? "bg-sky-950 text-sky-300 border border-sky-500 animate-pulse"
                          : "bg-radar-800 text-slate-500 border border-radar-700"
                      }`}
                    >
                      {isDone ? "✓" : step.stage}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrent ? "text-sky-300" : isDone ? "text-slate-200" : "text-slate-500"}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Dashboard (Active when analysis is loaded) */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-8 animate-fadeIn">
            {/* Topic & Executive Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-radar-900 border border-radar-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400">
                    Audit Subject
                  </span>
                  {analysisResult.isBasicMode && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
                      Running in basic mode (offline heuristics)
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  {analysisResult.topic}
                </h1>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed pt-1">
                  {analysisResult.executiveSummary.overview}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-lg bg-radar-800 hover:bg-radar-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-radar-700 transition-colors focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Audit</span>
                </button>
              </div>
            </div>

            {/* 1. Decision Readiness Score Card + Live Evidence Integrity */}
            <ReadinessScoreCard
              score={analysisResult.score}
              evidenceIntegrity={analysisResult.evidenceIntegrity}
            />

            {/* 2. Signature Visual: DARK SPOT MAP Heatmap Matrix */}
            <DarkSpotMap
              dimensions={analysisResult.expectedDimensions}
              sources={analysisResult.sources}
              matrix={analysisResult.matrix}
            />

            {/* 3. Prioritized Verify-Next Action Checklist */}
            <VerifyChecklist
              checklist={analysisResult.checklist}
              topic={analysisResult.topic}
              readinessScore={analysisResult.score.finalScore}
            />

            {/* 4. Cross-Source Conflict Explorer */}
            <ConflictExplorer
              conflicts={analysisResult.conflicts}
              sources={analysisResult.sources}
            />

            {/* 5. Information Gaps & AI Signals List */}
            <FindingsList
              findings={analysisResult.findings}
              sources={analysisResult.sources}
            />

            {/* 6. Source Authority & Freshness Review */}
            <SourcesList sources={analysisResult.sources} />

            {/* 7. Legend & Responsible AI Transparency */}
            <div className="space-y-4 pt-2">
              <LabelLegend />
              <ResponsibleAIPanel />
            </div>
          </div>
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="border-t border-radar-800/80 bg-radar-950 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-200">DarkSpot Radar</span>
            <span>— AI-Assisted Information Gap Detection Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
            <span>Shinchan Online Hackathon 2026</span>
            <span>•</span>
            <span>WCAG 2.2 AA Compliant</span>
            <span>•</span>
            <span>Quote-Verified Rigor</span>
          </div>
        </div>
      </footer>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
}
