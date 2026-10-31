"use client";

import React, { useState } from "react";
import {
  CoverageStatus,
  DimensionCellCoverage,
  ExpectedDimension,
  Source,
  Claim,
} from "@/types";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Radio,
  Eye,
  Info,
} from "lucide-react";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface DarkSpotMapProps {
  dimensions: ExpectedDimension[];
  sources: Source[];
  matrix: DimensionCellCoverage[];
}

export function DarkSpotMap({ dimensions, sources, matrix }: DarkSpotMapProps) {
  const [selectedCell, setSelectedCell] = useState<{
    source: Source;
    dimension: ExpectedDimension;
    claims: Claim[];
  } | null>(null);

  const [showScreenReaderTable, setShowScreenReaderTable] = useState(false);

  // Helper to find coverage cell
  const getCell = (dimId: string, srcId: string): DimensionCellCoverage => {
    const found = matrix.find((c) => c.dimensionId === dimId && c.sourceId === srcId);
    return (
      found || {
        dimensionId: dimId,
        sourceId: srcId,
        status: "MISSING",
        summary: "No mention found in this source",
        claims: [],
      }
    );
  };

  // Check if a row is a Dark Spot (completely missing across all sources)
  const isDarkSpotRow = (dimId: string): boolean => {
    const rowCells = matrix.filter((c) => c.dimensionId === dimId);
    return rowCells.length > 0 && rowCells.every((c) => c.status === "MISSING");
  };

  // Render cell icon + text pattern + color
  const renderCellContent = (status: CoverageStatus) => {
    switch (status) {
      case "COVERED":
        return (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono">Covered</span>
          </div>
        );
      case "PARTIAL":
        return (
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono">Partial</span>
          </div>
        );
      case "CONFLICTING":
        return (
          <div className="flex items-center gap-1.5 text-pink-400 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono">Conflict</span>
          </div>
        );
      case "OUTDATED":
        return (
          <div className="flex items-center gap-1.5 text-purple-400 font-medium">
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono">Outdated</span>
          </div>
        );
      case "MISSING":
      default:
        return (
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono">Missing</span>
          </div>
        );
    }
  };

  const getCellClasses = (status: CoverageStatus, isDarkSpot: boolean): string => {
    const base =
      "relative p-3 rounded-lg border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer group";

    if (isDarkSpot) {
      return `${base} bg-rose-950/40 border-rose-600/60 shadow-[0_0_12px_rgba(244,63,94,0.18)] hover:bg-rose-950/60 hover:border-rose-500`;
    }

    switch (status) {
      case "COVERED":
        return `${base} bg-emerald-950/25 border-emerald-500/30 hover:bg-emerald-950/45 hover:border-emerald-400`;
      case "PARTIAL":
        return `${base} bg-amber-950/25 border-amber-500/30 hover:bg-amber-950/45 hover:border-amber-400`;
      case "CONFLICTING":
        return `${base} bg-pink-950/30 border-pink-500/40 hover:bg-pink-950/50 hover:border-pink-400`;
      case "OUTDATED":
        return `${base} bg-purple-950/30 border-purple-500/30 hover:bg-purple-950/50 hover:border-purple-400`;
      case "MISSING":
      default:
        return `${base} bg-radar-900/60 border-radar-800 hover:bg-radar-800/60 hover:border-radar-700`;
    }
  };

  return (
    <section
      aria-labelledby="dark-spot-map-title"
      className="bg-radar-900 border border-radar-700/80 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-radar-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" aria-hidden="true" />
            <h2 id="dark-spot-map-title" className="text-lg font-bold text-slate-100 tracking-tight">
              Dark Spot Matrix Heatmap
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Expectation-first gap detection. Rows with no source coverage glow as critical &ldquo;Dark Spots&rdquo;.
          </p>
        </div>

        {/* Legend / Accessible view toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScreenReaderTable(!showScreenReaderTable)}
            className="text-xs px-3 py-1.5 rounded-lg bg-radar-800 hover:bg-radar-700 text-slate-300 border border-radar-700 transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
            aria-expanded={showScreenReaderTable}
          >
            <Eye className="w-3.5 h-3.5 text-radar-400" aria-hidden="true" />
            <span>{showScreenReaderTable ? "Show Matrix View" : "Accessible Table View"}</span>
          </button>
        </div>
      </div>

      {/* Legend Ribbon */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-[11px] text-slate-300 border-b border-radar-800/80 bg-radar-950/40 px-3 rounded-md my-4"
        aria-label="Map status color and icon encoding legend"
      >
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Encoding:</span>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Covered (Verified)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-pink-400" />
          <span>Conflicting</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span>Outdated Cycle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Missing / Dark Spot</span>
        </div>
      </div>

      {/* Screen reader table alternative (WCAG 2.2 AA compliant) */}
      {showScreenReaderTable ? (
        <div className="overflow-x-auto my-4">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Detailed coverage status of expected dimensions across sources</caption>
            <thead>
              <tr className="border-b border-radar-700 text-slate-300 bg-radar-850">
                <th scope="col" className="p-3">Expected Dimension</th>
                <th scope="col" className="p-3">Importance</th>
                {sources.map((s) => (
                  <th key={s.id} scope="col" className="p-3">{s.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim) => {
                const darkSpot = isDarkSpotRow(dim.id);
                return (
                  <tr key={dim.id} className={`border-b border-radar-800 ${darkSpot ? "bg-rose-950/20" : ""}`}>
                    <td className="p-3 font-medium text-slate-200">
                      {dim.name} {darkSpot && <span className="text-rose-400 font-bold">(DARK SPOT)</span>}
                    </td>
                    <td className="p-3 text-slate-400">{dim.importance}</td>
                    {sources.map((s) => {
                      const cell = getCell(dim.id, s.id);
                      return (
                        <td key={s.id} className="p-3">
                          <span className="font-semibold">{cell.status}</span>: {cell.summary}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Visual Matrix Grid */
        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-3">
            {/* Column Headers (Sources) */}
            <div
              className="grid gap-3 items-center text-xs text-slate-400 pb-2 border-b border-radar-800"
              style={{
                gridTemplateColumns: `240px repeat(${sources.length}, minmax(180px, 1fr))`,
              }}
            >
              <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
                Expected Dimension
              </div>
              {sources.map((src, i) => (
                <div key={src.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-slate-200 truncate">
                    <span className="w-4 h-4 rounded-full bg-radar-800 text-center leading-4 text-[10px] text-slate-300 font-mono">
                      {i + 1}
                    </span>
                    <span className="truncate" title={src.title}>{src.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="px-1.5 py-0.2 rounded bg-radar-800 border border-radar-700/80">
                      {src.authority}
                    </span>
                    {src.extractedCycle && <span>• {src.extractedCycle}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Dimension Rows */}
            <div className="space-y-2">
              {dimensions.map((dim) => {
                const darkSpot = isDarkSpotRow(dim.id);

                return (
                  <div
                    key={dim.id}
                    className={`grid gap-3 items-stretch p-2 rounded-xl transition-all ${
                      darkSpot
                        ? "bg-rose-950/20 border-2 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                        : "bg-radar-850/40 border border-radar-800/60"
                    }`}
                    style={{
                      gridTemplateColumns: `240px repeat(${sources.length}, minmax(180px, 1fr))`,
                    }}
                  >
                    {/* Dimension Label */}
                    <div className="flex flex-col justify-center pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-200">{dim.name}</span>
                        {darkSpot && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-900/90 text-rose-200 border border-rose-500 animate-pulse">
                            DARK SPOT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {dim.description}
                      </p>
                      <span className="text-[10px] font-mono text-radar-400 mt-1">
                        Importance: {dim.importance}
                      </span>
                    </div>

                    {/* Source Cells */}
                    {sources.map((src) => {
                      const cell = getCell(dim.id, src.id);

                      return (
                        <button
                          key={src.id}
                          onClick={() =>
                            setSelectedCell({
                              source: src,
                              dimension: dim,
                              claims: cell.claims,
                            })
                          }
                          aria-label={`View evidence for ${dim.name} from ${src.title}. Status: ${cell.status}`}
                          className={getCellClasses(cell.status, darkSpot)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            {renderCellContent(cell.status)}
                            <span className="text-[10px] text-slate-500 group-hover:text-sky-300 transition-colors">
                              Inspect ↗
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {cell.summary}
                          </p>
                          {cell.claims.length > 0 && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                              <span className="font-semibold text-emerald-400">
                                {cell.claims.filter((c) => c.evidence.verified).length}
                              </span>
                              <span>verified claim(s)</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <EvidenceDrawer
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        source={selectedCell?.source}
        dimensionName={selectedCell?.dimension.name}
        claims={selectedCell?.claims}
      />
    </section>
  );
}
