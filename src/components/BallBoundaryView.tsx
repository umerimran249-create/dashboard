"use client";

import { useState, useMemo } from "react";
import type { BallBoundaryData, BallPlayerRow, BallCell, HeatmapRow } from "@/lib/types";
import { Trophy, Target, TrendingUp, Zap, ChevronUp, ChevronDown, Info } from "lucide-react";

// ── Color helpers ─────────────────────────────────────────────────────────────
const BND_STRONG = "#27ae60";
const BND_NORMAL = "#e6b33e";
const BND_WEAK   = "#c0392b";

function bndColor(pct: number | null | undefined): string {
  if (pct == null) return "transparent";
  if (pct >= 35) return BND_STRONG;
  if (pct >= 18) return BND_NORMAL;
  return BND_WEAK;
}

function srColor(sr: number | null | undefined): string {
  if (sr == null) return "transparent";
  if (sr >= 160) return BND_STRONG;
  if (sr >= 110) return BND_NORMAL;
  return BND_WEAK;
}

function shotColor(color: string | null | undefined): string {
  if (color === "strong") return BND_STRONG;
  if (color === "normal") return BND_NORMAL;
  if (color === "weak")   return BND_WEAK;
  return "transparent";
}

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Stat badge ────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center bg-[#0c162b] border border-white/10 rounded-2xl px-5 py-4 min-w-[110px]">
      <div className={`text-2xl font-black ${accent ?? "text-cyan-400"}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-400 font-bold">{sub}</div>}
      <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

// ── Global ball bar chart ─────────────────────────────────────────────────────
function GlobalBallChart({
  global,
  best,
  mode,
}: {
  global: BallBoundaryData["global"];
  best: string;
  mode: "win" | "all";
}) {
  const balls = ["1","2","3","4","5","6"];
  const cells = balls.map(b => global[b]?.[mode]);
  const maxPct = Math.max(...cells.map(c => c?.bnd_pct ?? 0), 1);

  return (
    <div className="bg-[#0c162b] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Target size={18} className="text-cyan-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Boundary % by Ball Position {mode === "win" ? "(Winning Matches)" : "(All Matches)"}
        </h3>
      </div>

      <div className="flex items-end gap-3 h-44">
        {balls.map((b, i) => {
          const cell = cells[i];
          const pct = cell?.bnd_pct ?? 0;
          const heightPct = (pct / (maxPct * 1.15)) * 100;
          const isTop = b === best && mode === "win";
          const color = isTop ? "#06b6d4" : bndColor(pct);

          return (
            <div key={b} className="flex-1 flex flex-col items-center gap-1">
              {/* percentage label */}
              <div className={`text-xs font-black ${isTop ? "text-cyan-400" : "text-slate-300"}`}>
                {cell ? `${pct}%` : "—"}
              </div>

              {/* bar */}
              <div className="w-full relative" style={{ height: "120px" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: hexAlpha(color.startsWith("#") ? color : "#888888", 0.85),
                    border: isTop ? "2px solid #06b6d4" : "1px solid rgba(255,255,255,0.08)",
                  }}
                />
                {isTop && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                    HIGHEST
                  </div>
                )}
              </div>

              {/* ball label */}
              <div className={`text-[11px] font-black uppercase tracking-wider ${isTop ? "text-cyan-400" : "text-slate-400"}`}>
                Ball {b}
              </div>

              {/* sub stats */}
              {cell && (
                <div className="text-[9px] text-slate-500 text-center leading-tight">
                  SR {cell.sr}<br />
                  {cell.balls} balls
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-5 text-[11px]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: BND_WEAK }} />
          <span className="text-slate-400">Weak (&lt;18%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: BND_NORMAL }} />
          <span className="text-slate-400">Normal (18-35%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ background: BND_STRONG }} />
          <span className="text-slate-400">Strong (&gt;35%)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-cyan-400" />
          <span className="text-slate-400">Highest ball</span>
        </span>
      </div>
    </div>
  );
}

// ── Player heatmap table ──────────────────────────────────────────────────────
type SortKey = "name" | "team" | "total" | `b${string}`;

function BallHeatmapTable({
  players,
  teams,
  mode,
}: {
  players: BallPlayerRow[];
  teams: string[];
  mode: "win" | "all";
}) {
  const [teamFilter, setTeamFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortAsc, setSortAsc] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const BALLS = ["1","2","3","4","5","6"];

  const filtered = useMemo(() => {
    let rows = players;
    if (teamFilter !== "All") rows = rows.filter(p => p.team === teamFilter);
    rows = [...rows].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "name") return sortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      if (sortKey === "team") return sortAsc
        ? a.team.localeCompare(b.team)
        : b.team.localeCompare(a.team);
      if (sortKey === "total") {
        va = mode === "win" ? a.total_win_balls : a.total_win_balls;
        vb = mode === "win" ? b.total_win_balls : b.total_win_balls;
      } else {
        const ball = sortKey.replace("b", "");
        va = (mode === "win" ? a.win[ball] : a.all[ball])?.bnd_pct ?? -1;
        vb = (mode === "win" ? b.win[ball] : b.all[ball])?.bnd_pct ?? -1;
      }
      return sortAsc ? va - vb : vb - va;
    });
    return rows;
  }, [players, teamFilter, sortKey, sortAsc, mode]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown size={10} className="text-slate-600" />;
    return sortAsc
      ? <ChevronUp size={10} className="text-cyan-400" />
      : <ChevronDown size={10} className="text-cyan-400" />;
  }

  function showTip(e: React.MouseEvent, cell: BallCell, ball: string, name: string) {
    if (!cell) return;
    const content = [
      `${name} — Ball ${ball}`,
      `Balls: ${cell.balls}`,
      `Boundary %: ${cell.bnd_pct}%`,
      `Boundaries: ${cell.boundaries} (${cell.fours}×4, ${cell.sixes}×6)`,
      `SR: ${cell.sr}`,
      `Dot %: ${cell.dot_pct}%`,
      `Wickets: ${cell.wickets}`,
    ].join("\n");
    setTooltip({ x: e.clientX + 12, y: e.clientY - 10, content });
  }

  return (
    <div className="bg-[#0c162b] border border-white/10 rounded-2xl overflow-hidden">
      {/* Controls */}
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase">Team</span>
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="bg-[#081225] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
          >
            <option value="All">All Teams</option>
            {teams.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="text-[11px] text-slate-400">{filtered.length} players shown</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ borderSpacing: "4px", borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 bg-[#0d2557] text-white text-[12px] font-bold uppercase px-4 py-3 rounded-xl text-left min-w-[180px] cursor-pointer hover:bg-[#122d63] transition-colors"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1">Player <SortIcon k="name" /></div>
              </th>
              <th
                className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl cursor-pointer hover:bg-[#122d63] transition-colors whitespace-nowrap"
                onClick={() => toggleSort("team")}
              >
                <div className="flex items-center gap-1">Team <SortIcon k="team" /></div>
              </th>
              <th
                className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl cursor-pointer hover:bg-[#122d63] transition-colors whitespace-nowrap"
                onClick={() => toggleSort("total")}
              >
                <div className="flex items-center gap-1">Win Balls <SortIcon k="total" /></div>
              </th>
              {BALLS.map(b => (
                <th
                  key={b}
                  className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl cursor-pointer hover:bg-[#122d63] transition-colors whitespace-nowrap"
                  onClick={() => toggleSort(`b${b}` as SortKey)}
                >
                  <div className="flex items-center gap-1">Ball {b} <SortIcon k={`b${b}` as SortKey} /></div>
                </th>
              ))}
              <th className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl whitespace-nowrap">
                Best Ball
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isBestBallMode = mode === "win";
              return (
                <tr key={p.name} className="group">
                  <td className="sticky left-0 z-10 bg-[#0f1d37] group-hover:bg-[#152240] text-white font-bold text-sm px-4 py-3 rounded-xl min-w-[180px] transition-colors">
                    <div>{p.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{p.batting_style}</div>
                  </td>
                  <td className="bg-[#0f1d37] group-hover:bg-[#152240] text-slate-300 text-[12px] px-3 py-3 rounded-xl whitespace-nowrap transition-colors">
                    {p.team}
                  </td>
                  <td className="bg-[#0f1d37] group-hover:bg-[#152240] text-white font-bold text-sm px-3 py-3 rounded-xl text-center transition-colors">
                    {mode === "win" ? p.total_win_balls : "—"}
                  </td>
                  {BALLS.map(b => {
                    const cell = mode === "win" ? p.win[b] : p.all[b];
                    const color = cell ? bndColor(cell.bnd_pct) : null;
                    return (
                      <td
                        key={b}
                        className="text-center px-2 py-3 rounded-xl text-[12px] font-black cursor-pointer transition-all duration-150 hover:scale-105 hover:z-20"
                        style={{
                          backgroundColor: color ? hexAlpha(color, 0.22) : "rgba(255,255,255,0.02)",
                          border: color ? `1px solid ${hexAlpha(color, 0.4)}` : "1px solid rgba(255,255,255,0.06)",
                          color: color ? color : "#4b5563",
                          minWidth: "100px",
                        }}
                        onMouseMove={e => cell && showTip(e, cell, b, p.name)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {cell ? (
                          <>
                            <div>{cell.bnd_pct}%</div>
                            <div className="text-[9px] font-normal opacity-70 mt-0.5">
                              {cell.sr} SR · {cell.balls}b
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="bg-[#0f1d37] group-hover:bg-[#152240] text-center px-3 py-3 rounded-xl transition-colors">
                    {isBestBallMode && p.best_ball_win ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[11px] font-black px-2.5 py-1 rounded-lg">
                          Ball {p.best_ball_win}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">{p.best_bnd_win}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#081225]/97 border border-white/14 rounded-xl px-3 py-2 text-[12px] text-white pointer-events-none whitespace-pre-line shadow-2xl"
          style={{ left: tooltip.x, top: tooltip.y, maxWidth: 260 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ── Shot Heatmap (Pace or Spin) ───────────────────────────────────────────────
function ShotHeatmapTable({
  rows,
  shots,
  title,
  teams,
}: {
  rows: HeatmapRow[];
  shots: string[];
  title: string;
  teams: string[];
}) {
  const [teamFilter, setTeamFilter] = useState("All");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const filtered = useMemo(() => {
    if (teamFilter === "All") return rows;
    return rows.filter(r => r.team === teamFilter);
  }, [rows, teamFilter]);

  const formatShot = (s: string) =>
    s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  function showTip(e: React.MouseEvent, cell: NonNullable<HeatmapRow["cells"][string]>, shot: string, name: string) {
    const content = [
      `${name} — ${formatShot(shot)}`,
      `Score: ${cell.score}/100 (${cell.color.toUpperCase()})`,
      `Balls: ${cell.balls}  Runs: ${cell.runs}  Wkts: ${cell.wickets}`,
      `SR: ${cell.sr}  AVG: ${cell.avg ?? "—"}`,
      `Boundary %: ${cell.bnd_pct}%  Dot %: ${cell.dot_pct}%`,
    ].join("\n");
    setTooltip({ x: e.clientX + 12, y: e.clientY - 10, content });
  }

  return (
    <div className="bg-[#0c162b] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold uppercase">Team</span>
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="bg-[#081225] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
          >
            <option value="All">All Teams</option>
            {teams.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderSpacing: "4px", borderCollapse: "separate" }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#0d2557] text-white text-[12px] font-bold uppercase px-4 py-3 rounded-xl text-left min-w-[180px]">
                Player
              </th>
              <th className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl whitespace-nowrap">
                Team
              </th>
              {shots.map(s => (
                <th key={s} className="bg-[#0d2557] text-white text-[12px] font-bold uppercase px-3 py-3 rounded-xl whitespace-nowrap min-w-[110px]">
                  {formatShot(s)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.name} className="group">
                <td className="sticky left-0 z-10 bg-[#0f1d37] group-hover:bg-[#152240] text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors">
                  {row.name}
                </td>
                <td className="bg-[#0f1d37] group-hover:bg-[#152240] text-slate-300 text-[12px] px-3 py-3 rounded-xl whitespace-nowrap transition-colors">
                  {row.team}
                </td>
                {shots.map(shot => {
                  const cell = row.cells[shot];
                  const color = cell ? shotColor(cell.color) : null;
                  return (
                    <td
                      key={shot}
                      className="text-center px-2 py-3 rounded-xl text-[12px] font-black cursor-pointer transition-all duration-150 hover:scale-105 hover:z-20"
                      style={{
                        backgroundColor: color ? hexAlpha(color, 0.22) : "rgba(255,255,255,0.02)",
                        border: color ? `1px solid ${hexAlpha(color, 0.4)}` : "1px solid rgba(255,255,255,0.06)",
                        color: color ? color : "#4b5563",
                        height: "50px",
                      }}
                      onMouseMove={e => cell && showTip(e, cell, shot, row.name)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {cell ? (
                        <>
                          <div>{cell.bnd_pct}%</div>
                          <div className="text-[9px] font-normal opacity-70">
                            SR {cell.sr}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-[#081225]/97 border border-white/14 rounded-xl px-3 py-2 text-[12px] text-white pointer-events-none whitespace-pre-line shadow-2xl"
          style={{ left: tooltip.x, top: tooltip.y, maxWidth: 280 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

// ── Main exported view ────────────────────────────────────────────────────────
export default function BallBoundaryView({ data }: { data: BallBoundaryData }) {
  const [matchMode, setMatchMode] = useState<"win" | "all">("win");
  const [activeTab, setActiveTab] = useState<"boundary" | "pace" | "spin">("boundary");

  const teams = useMemo(() => {
    const t = new Set(data.players.map(p => p.team));
    return [...t].sort();
  }, [data.players]);

  const BALLS = ["1","2","3","4","5","6"];
  const globalWin = data.global;

  return (
    <div className="space-y-6">
      {/* ── Hero Summary ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.07),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Target size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Ball-by-Ball Boundary Analysis</h2>
              <p className="text-[11px] text-slate-400">Boundary % at each ball (1–6) within an over • Winning matches highlighted</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Stat
              label="Highest Boundary Ball"
              value={`Ball ${data.best_global_ball}`}
              sub={`${data.best_global_bnd}% boundary`}
              accent="text-cyan-400"
            />
            {BALLS.map(b => {
              const cell = globalWin[b]?.win;
              return (
                <Stat
                  key={b}
                  label={`Ball ${b}`}
                  value={cell ? `${cell.bnd_pct}%` : "—"}
                  sub={cell ? `SR ${cell.sr}` : undefined}
                  accent={b === data.best_global_ball ? "text-cyan-400" : "text-slate-300"}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
          {(["win", "all"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMatchMode(m)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                matchMode === m
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "win" ? "Winning Matches" : "All Matches"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Info size={12} />
          <span>Hover any cell for full stats</span>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex gap-1 border-b border-slate-800 pb-px">
        {[
          { id: "boundary" as const, label: "Ball Boundary Heatmap", icon: <Target size={14} /> },
          { id: "pace" as const, label: "Pace Shot Heatmap", icon: <Zap size={14} /> },
          { id: "spin" as const, label: "Spin Shot Heatmap", icon: <TrendingUp size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "text-cyan-400 border-b-2 border-cyan-400 -mb-px"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "boundary" && (
        <div className="space-y-6">
          <GlobalBallChart
            global={data.global}
            best={data.best_global_ball}
            mode={matchMode}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] px-1">
            {[
              { color: BND_WEAK,   label: "Weak — Boundary < 18%" },
              { color: BND_NORMAL, label: "Normal — 18% to 35%" },
              { color: BND_STRONG, label: "Strong — Boundary > 35%" },
              { color: "#4b5563",  label: "Blank — Insufficient Data (<3 balls)" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ background: hexAlpha(color, 0.5), border: `1px solid ${hexAlpha(color, 0.7)}` }} />
                <span className="text-slate-400">{label}</span>
              </div>
            ))}
          </div>

          <BallHeatmapTable
            players={data.players}
            teams={teams}
            mode={matchMode}
          />
        </div>
      )}

      {activeTab === "pace" && (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[11px] px-1">
            <div className="text-slate-400 text-sm">
              Color based on composite score: SR (35%) + Boundary% (35%) + Dot% (15%) + Wicket SR (15%).
              Cells show Boundary % / SR.
            </div>
            {[
              { color: BND_WEAK,   label: "Weak (score < 35)" },
              { color: BND_NORMAL, label: "Normal (35–60)" },
              { color: BND_STRONG, label: "Strong (score ≥ 60)" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ background: hexAlpha(color, 0.5), border: `1px solid ${hexAlpha(color, 0.7)}` }} />
                <span className="text-slate-400">{label}</span>
              </div>
            ))}
          </div>
          <ShotHeatmapTable
            rows={data.heatmap.pace}
            shots={data.heatmap.pace_shots}
            title="Batting vs Pace — Shot Heatmap"
            teams={teams}
          />
        </div>
      )}

      {activeTab === "spin" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-[11px] px-1">
            <div className="text-slate-400 text-sm">
              Color based on composite score: SR (35%) + Boundary% (35%) + Dot% (15%) + Wicket SR (15%).
              Cells show Boundary % / SR.
            </div>
            {[
              { color: BND_WEAK,   label: "Weak (score < 35)" },
              { color: BND_NORMAL, label: "Normal (35–60)" },
              { color: BND_STRONG, label: "Strong (score ≥ 60)" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm" style={{ background: hexAlpha(color, 0.5), border: `1px solid ${hexAlpha(color, 0.7)}` }} />
                <span className="text-slate-400">{label}</span>
              </div>
            ))}
          </div>
          <ShotHeatmapTable
            rows={data.heatmap.spin}
            shots={data.heatmap.spin_shots}
            title="Batting vs Spin — Shot Heatmap"
            teams={teams}
          />
        </div>
      )}
    </div>
  );
}
