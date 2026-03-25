"use client";
import { useState } from "react";
import type { UnorthodoxShotEntry } from "@/lib/types";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";

const SHOT_META: Record<string, { label: string; color: string; risk: string; emoji: string }> = {
  "slog":          { label: "Slog",         color: "#f59e0b", risk: "High",    emoji: "💥" },
  "slog sweep":    { label: "Slog Sweep",   color: "#8b5cf6", risk: "Medium",  emoji: "🌀" },
  "reverse sweep": { label: "Reverse Sweep",color: "#06b6d4", risk: "Medium",  emoji: "↩️" },
  "scoop":         { label: "Scoop",        color: "#10b981", risk: "High",    emoji: "🥄" },
  "upper cut":     { label: "Upper Cut",    color: "#ef4444", risk: "High",    emoji: "✂️" },
  "hook":          { label: "Hook",         color: "#f97316", risk: "High",    emoji: "🪝" },
  "switch hit":    { label: "Switch Hit",   color: "#ec4899", risk: "Extreme", emoji: "🔄" },
  "reverse scoop": { label: "Rev. Scoop",   color: "#6366f1", risk: "Extreme", emoji: "🌪️" },
  "lap":           { label: "Lap Shot",     color: "#14b8a6", risk: "Medium",  emoji: "🌊" },
  "drop and run":  { label: "Drop & Run",   color: "#84cc16", risk: "Low",     emoji: "🏃" },
  "slice":         { label: "Slice",        color: "#a78bfa", risk: "Medium",  emoji: "🍕" },
};

const RISK_COLOR: Record<string, string> = {
  "Low": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Medium": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "High": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "Extreme": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ConnectionBadge({ name, count, total }: { name: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorMap: Record<string, string> = {
    "middled": "bg-emerald-500/20 text-emerald-300",
    "well timed": "bg-cyan-500/20 text-cyan-300",
    "mis-timed": "bg-amber-500/20 text-amber-300",
    "missed": "bg-rose-500/20 text-rose-300",
    "neutral": "bg-slate-500/20 text-slate-400",
    "inside edge": "bg-orange-500/20 text-orange-300",
    "outside edge": "bg-red-500/20 text-red-300",
    "top edge": "bg-yellow-500/20 text-yellow-300",
    "bottom edge": "bg-pink-500/20 text-pink-300",
  };
  const cls = colorMap[name] || "bg-slate-700/40 text-slate-400";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cls}`}>
      {name} <span className="opacity-70">{pct}%</span>
    </span>
  );
}

function ShotDetailCard({ shotKey, data, expanded, onToggle }: {
  shotKey: string;
  data: UnorthodoxShotEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = SHOT_META[shotKey] || { label: shotKey, color: "#6b7280", risk: "—", emoji: "🏏" };
  const riskCls = RISK_COLOR[meta.risk] || "bg-slate-700/40 text-slate-400 border-slate-700";

  const topConns = Object.entries(data.connections || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const connTotal = topConns.reduce((s, [, v]) => s + v, 0);

  const topLines = Object.entries(data.lines || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topLengths = Object.entries(data.lengths || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxLineV = Math.max(...topLines.map(([, v]) => v), 1);
  const maxLenV = Math.max(...topLengths.map(([, v]) => v), 1);

  const paceB = data.bowler_types?.["PACE"] || 0;
  const spinB = data.bowler_types?.["SPIN"] || 0;
  const totalBT = paceB + spinB;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/40 transition-colors text-left"
      >
        <span className="text-lg">{meta.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-white text-sm">{meta.label}</span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${riskCls}`}>
              {meta.risk} Risk
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span><span className="text-cyan-400 font-black">{data.balls}</span> balls</span>
            <span><span className="text-white font-bold">{data.runs}</span> runs</span>
            <span>SR <span className="text-amber-400 font-bold">{data.sr}</span></span>
            <span>Dots <span className="text-slate-300 font-bold">{data.dot_pct}%</span></span>
            <span>Boundaries <span className="text-emerald-400 font-bold">{data.boundary_pct}%</span></span>
            <span>Wickets <span className="text-rose-400 font-bold">{data.wickets}</span>
              {data.wicket_sr && <span className="text-slate-600"> (SR {data.wicket_sr})</span>}
            </span>
          </div>
        </div>
        {/* SR gauge */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <div className="text-xl font-black" style={{ color: meta.color }}>{data.sr}</div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">Strike Rate</div>
        </div>
        <div className="text-slate-500 ml-1 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* SR bar */}
      <div className="px-4 pb-2">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, data.sr / 3)}%`, background: meta.color }} />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800 pt-4">
          {/* 4-stat row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "4s", value: data.fours, color: "text-blue-400" },
              { label: "6s", value: data.sixes, color: "text-purple-400" },
              { label: "Dot %", value: `${data.dot_pct}%`, color: "text-slate-300" },
              { label: "Wkt SR", value: data.wicket_sr ?? "—", color: "text-rose-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-2 text-center">
                <div className={`text-base font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contact quality */}
          {topConns.length > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Contact Quality</p>
              <div className="flex flex-wrap gap-1">
                {topConns.map(([conn, cnt]) => (
                  <ConnectionBadge key={conn} name={conn} count={cnt} total={connTotal} />
                ))}
              </div>
            </div>
          )}

          {/* Pace vs Spin */}
          {totalBT > 0 && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">vs Bowler Type</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-10">Pace</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(paceB / totalBT) * 100}%` }} />
                  </div>
                  <span className="text-slate-300 w-20 text-right">{paceB}b · {Math.round((paceB / totalBT) * 100)}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 w-10">Spin</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(spinB / totalBT) * 100}%` }} />
                  </div>
                  <span className="text-slate-300 w-20 text-right">{spinB}b · {Math.round((spinB / totalBT) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Line & Length */}
          <div className="grid grid-cols-2 gap-4">
            {topLengths.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Length</p>
                <div className="space-y-1">
                  {topLengths.map(([label, val]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{label}</span>
                        <span className="text-[10px] text-slate-300">{val}</span>
                      </div>
                      <MiniBar value={val} max={maxLenV} color={meta.color} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {topLines.length > 0 && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Line</p>
                <div className="space-y-1">
                  {topLines.map(([label, val]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{label}</span>
                        <span className="text-[10px] text-slate-300">{val}</span>
                      </div>
                      <MiniBar value={val} max={maxLineV} color={meta.color} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  unorthodox: Record<string, UnorthodoxShotEntry>;
  playerName: string;
};

export default function UnorthodoxShotsPanel({ unorthodox, playerName }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"balls" | "sr" | "sixes" | "wickets">("balls");

  const shots = Object.entries(unorthodox || {})
    .filter(([, d]) => d.balls >= 2)
    .sort((a, b) => {
      if (sortBy === "balls") return b[1].balls - a[1].balls;
      if (sortBy === "sr") return b[1].sr - a[1].sr;
      if (sortBy === "sixes") return b[1].sixes - a[1].sixes;
      if (sortBy === "wickets") return b[1].wickets - a[1].wickets;
      return 0;
    });

  if (shots.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center">
        <Zap size={28} className="text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No unorthodox shot data found for {playerName}.</p>
        <p className="text-slate-600 text-xs mt-1">This player may not have played any recorded unorthodox shots.</p>
      </div>
    );
  }

  const totalBalls = shots.reduce((s, [, d]) => s + d.balls, 0);
  const totalRuns = shots.reduce((s, [, d]) => s + d.runs, 0);
  const totalSixes = shots.reduce((s, [, d]) => s + d.sixes, 0);
  const totalWkts = shots.reduce((s, [, d]) => s + d.wickets, 0);
  const overallSR = totalBalls > 0 ? Math.round((totalRuns / totalBalls) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Unorthodox Balls", value: totalBalls, color: "text-cyan-400" },
          { label: "Runs Scored", value: totalRuns, color: "text-white" },
          { label: "Overall SR", value: overallSR, color: "text-amber-400" },
          { label: "6s Hit", value: totalSixes, color: "text-purple-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Sort by:</span>
        {(["balls", "sr", "sixes", "wickets"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
              sortBy === key
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
            }`}
          >
            {key === "balls" ? "Usage" : key === "sr" ? "Strike Rate" : key === "sixes" ? "Sixes" : "Wickets lost"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-slate-600">{shots.length} shot type{shots.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Radar-style overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {shots.map(([shotKey, data]) => {
          const meta = SHOT_META[shotKey] || { label: shotKey, color: "#6b7280", risk: "—", emoji: "🏏" };
          const riskCls = RISK_COLOR[meta.risk] || "bg-slate-700/40 text-slate-400 border-slate-700";
          return (
            <button
              key={shotKey}
              onClick={() => setExpanded(expanded === shotKey ? null : shotKey)}
              className={`rounded-xl border p-3 text-left transition-all hover:scale-[1.02] ${
                expanded === shotKey
                  ? "border-opacity-60 bg-slate-800/60"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
              style={expanded === shotKey ? { borderColor: meta.color } : {}}
            >
              <div className="text-xl mb-1">{meta.emoji}</div>
              <div className="text-xs font-black text-white mb-1">{meta.label}</div>
              <div className="text-2xl font-black mb-0.5" style={{ color: meta.color }}>{data.sr}</div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1.5">SR · {data.balls}b</div>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${riskCls}`}>
                {meta.risk}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail cards */}
      <div className="space-y-2">
        {shots.map(([shotKey, data]) => (
          <ShotDetailCard
            key={shotKey}
            shotKey={shotKey}
            data={data}
            expanded={expanded === shotKey}
            onToggle={() => setExpanded(expanded === shotKey ? null : shotKey)}
          />
        ))}
      </div>
    </div>
  );
}
