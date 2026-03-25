"use client";
import { useState } from "react";
import Link from "next/link";
import type { UnorthodoxData, UnorthodoxShotEntry } from "@/lib/types";

const SHOT_META_LOCAL: Record<string, { emoji: string }> = {
  "slog": { emoji: "💥" }, "slog sweep": { emoji: "🌀" },
  "reverse sweep": { emoji: "↩️" }, "scoop": { emoji: "🥄" },
  "upper cut": { emoji: "✂️" }, "hook": { emoji: "🪝" },
  "switch hit": { emoji: "🔄" }, "reverse scoop": { emoji: "🌪️" },
  "lap": { emoji: "🌊" }, "drop and run": { emoji: "🏃" },
  "slice": { emoji: "🍕" },
};

const SORT_OPTIONS = [
  { key: "balls", label: "Most Used" },
  { key: "sr", label: "Highest SR" },
  { key: "boundary_pct", label: "Boundary %" },
  { key: "dot_pct", label: "Dot %" },
  { key: "wickets", label: "Wickets Lost" },
] as const;

type SortKey = typeof SORT_OPTIONS[number]["key"];

function ConnectionBar({ connections }: { connections: Record<string, number> }) {
  const ORDER = ["middled", "well timed", "neutral", "mis-timed", "missed", "top edge", "outside edge", "inside edge"];
  const COLORS: Record<string, string> = {
    "middled": "#10b981", "well timed": "#06b6d4", "neutral": "#6b7280",
    "mis-timed": "#f59e0b", "missed": "#ef4444", "top edge": "#f97316",
    "outside edge": "#ec4899", "inside edge": "#8b5cf6",
  };
  const total = Object.values(connections).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const sorted = ORDER.filter(k => (connections[k] || 0) > 0)
    .map(k => ({ k, v: connections[k] || 0, pct: Math.round(((connections[k] || 0) / total) * 100) }));

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Contact Quality</p>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {sorted.map(({ k, v, pct }) => (
          <div
            key={k}
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: COLORS[k] || "#6b7280" }}
            title={`${k}: ${v} (${pct}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {sorted.slice(0, 5).map(({ k, pct }) => (
          <span key={k} className="text-[9px] text-slate-400 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: COLORS[k] || "#6b7280" }} />
            {k} {pct}%
          </span>
        ))}
      </div>
    </div>
  );
}

function ShotLeaderboard({ shotKey, data, meta }: {
  shotKey: string;
  data: UnorthodoxShotEntry;
  meta: UnorthodoxData["meta"][string];
}) {
  const [leaderSort, setLeaderSort] = useState<"balls" | "sr" | "sixes">("balls");
  const players = (data.top_players || [])
    .filter(p => p.balls >= 5)
    .sort((a, b) => {
      if (leaderSort === "balls") return b.balls - a.balls;
      if (leaderSort === "sr") return b.sr - a.sr;
      return b.sixes - a.sixes;
    });

  const topLines = Object.entries(data.lines || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topLengths = Object.entries(data.lengths || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxLine = Math.max(...topLines.map(([, v]) => v), 1);
  const maxLen = Math.max(...topLengths.map(([, v]) => v), 1);
  const paceB = data.bowler_types?.["PACE"] || 0;
  const spinB = data.bowler_types?.["SPIN"] || 0;
  const totalBT = paceB + spinB;

  return (
    <div className="space-y-5">
      {/* Aggregate stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: "Balls", value: data.balls.toLocaleString(), color: "text-cyan-400" },
          { label: "Runs", value: data.runs.toLocaleString(), color: "text-white" },
          { label: "SR", value: data.sr, color: "text-amber-400" },
          { label: "Boundary %", value: `${data.boundary_pct}%`, color: "text-emerald-400" },
          { label: "Dot %", value: `${data.dot_pct}%`, color: "text-rose-400" },
          { label: "Wkt SR", value: data.wicket_sr ?? "—", color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-2 text-center">
            <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Contact quality */}
      <ConnectionBar connections={data.connections || {}} />

      {/* Pace vs Spin + Line/Length */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Pace vs Spin */}
        <div className="bg-slate-800/30 rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">vs Bowler Type</p>
          {totalBT > 0 && (
            <div className="space-y-2">
              {[{ label: "Pace", v: paceB, color: "bg-orange-500" }, { label: "Spin", v: spinB, color: "bg-violet-500" }].map(({ label, v, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-bold">{v.toLocaleString()}b · {Math.round((v / totalBT) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${(v / totalBT) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Length */}
        <div className="bg-slate-800/30 rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Length Breakdown</p>
          <div className="space-y-1.5">
            {topLengths.map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-400 truncate max-w-[100px]">{label}</span>
                  <span className="text-slate-300">{val}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(val / maxLen) * 100}%`, background: meta.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line */}
        <div className="bg-slate-800/30 rounded-xl p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Line Breakdown</p>
          <div className="space-y-1.5">
            {topLines.map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-slate-400 truncate max-w-[100px]">{label}</span>
                  <span className="text-slate-300">{val}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(val / maxLine) * 100}%`, background: meta.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Top Players</p>
          <div className="flex gap-1">
            {(["balls", "sr", "sixes"] as const).map((s) => (
              <button key={s} onClick={() => setLeaderSort(s)}
                className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-colors ${leaderSort === s ? "text-white border-slate-500 bg-slate-700" : "text-slate-500 border-slate-700 hover:border-slate-600"}`}
              >
                {s === "balls" ? "Usage" : s === "sr" ? "SR" : "6s"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {players.slice(0, 15).map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
              <span className={`text-xs font-black w-5 text-center ${i < 3 ? "text-amber-400" : "text-slate-600"}`}>{i + 1}</span>
              <Link href={`/player/${p.file}`} className="flex-1 font-semibold text-white text-xs hover:text-amber-300 transition-colors truncate">
                {p.name}
              </Link>
              <span className="text-[10px] text-slate-500">{p.balls}b</span>
              <span className="text-[10px] font-bold" style={{ color: meta.color }}>SR {p.sr}</span>
              <span className="text-[10px] text-purple-400">{p.sixes}×6</span>
              <span className="text-[10px] text-emerald-400">{p.boundary_pct}% bdry</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.sr / 3)}%`, background: meta.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UnorthodoxGlobalView({ data }: { data: UnorthodoxData }) {
  const { global: globalShots, meta } = data;
  const shots = Object.entries(globalShots).sort((a, b) => b[1].balls - a[1].balls);
  const [activeShot, setActiveShot] = useState(shots[0]?.[0] ?? "");
  const [globalSort, setGlobalSort] = useState<SortKey>("balls");

  const sortedForBar = [...shots].sort((a, b) => {
    if (globalSort === "balls") return b[1].balls - a[1].balls;
    if (globalSort === "sr") return b[1].sr - a[1].sr;
    if (globalSort === "boundary_pct") return b[1].boundary_pct - a[1].boundary_pct;
    if (globalSort === "dot_pct") return b[1].dot_pct - a[1].dot_pct;
    if (globalSort === "wickets") return b[1].wickets - a[1].wickets;
    return 0;
  });

  const maxVal = Math.max(...sortedForBar.map(([, d]) => {
    if (globalSort === "balls") return d.balls;
    if (globalSort === "sr") return d.sr;
    if (globalSort === "boundary_pct") return d.boundary_pct;
    if (globalSort === "dot_pct") return d.dot_pct;
    if (globalSort === "wickets") return d.wickets;
    return 0;
  }), 1);

  const getValue = (d: UnorthodoxShotEntry): number => {
    if (globalSort === "balls") return d.balls;
    if (globalSort === "sr") return d.sr;
    if (globalSort === "boundary_pct") return d.boundary_pct;
    if (globalSort === "dot_pct") return d.dot_pct;
    if (globalSort === "wickets") return d.wickets;
    return 0;
  };

  const getLabel = (d: UnorthodoxShotEntry): string => {
    if (globalSort === "balls") return `${d.balls.toLocaleString()} balls`;
    if (globalSort === "sr") return `SR ${d.sr}`;
    if (globalSort === "boundary_pct") return `${d.boundary_pct}% boundary`;
    if (globalSort === "dot_pct") return `${d.dot_pct}% dots`;
    if (globalSort === "wickets") return `${d.wickets} wickets`;
    return "";
  };

  const activeData = globalShots[activeShot];
  const activeMeta = meta[activeShot];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      {/* Sort controls */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Compare by:</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button key={key} onClick={() => setGlobalSort(key)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${globalSort === key ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="p-4 space-y-2">
        {sortedForBar.map(([shotKey, d]) => {
          const m = meta[shotKey];
          const sm = SHOT_META_LOCAL[shotKey] || { emoji: "🏏" };
          if (!m) return null;
          const val = getValue(d);
          const pct = (val / maxVal) * 100;
          return (
            <button
              key={shotKey}
              onClick={() => setActiveShot(shotKey)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${activeShot === shotKey ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
            >
              <span className="text-base w-7 shrink-0">{sm.emoji}</span>
              <span className="text-xs font-bold text-slate-300 w-28 shrink-0 truncate">{m.label}</span>
              <div className="flex-1 h-5 bg-slate-800/60 rounded-lg overflow-hidden">
                <div className="h-full rounded-lg transition-all" style={{ width: `${pct}%`, background: m.color + "cc" }} />
              </div>
              <span className="text-[11px] font-bold text-slate-300 w-24 text-right shrink-0">{getLabel(d)}</span>
            </button>
          );
        })}
      </div>

      {/* Detail panel for active shot */}
      {activeData && activeMeta && (
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{SHOT_META_LOCAL[activeShot]?.emoji || "🏏"}</span>
            <h3 className="text-base font-black text-white">{activeMeta.label}</h3>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: activeMeta.color, borderColor: activeMeta.color + "40", background: activeMeta.color + "15" }}>
              {activeMeta.risk} Risk
            </span>
          </div>
          <ShotLeaderboard shotKey={activeShot} data={activeData} meta={activeMeta} />
        </div>
      )}
    </div>
  );
}
