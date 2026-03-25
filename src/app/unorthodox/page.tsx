import fs from "fs";
import path from "path";
import Link from "next/link";
import type { UnorthodoxData } from "@/lib/types";
import { ArrowLeft, FlameKindling, Zap, TrendingUp, Star } from "lucide-react";
import UnorthodoxGlobalView from "@/components/UnorthodoxGlobalView";

function getDataDir() { return path.join(process.cwd(), "public", "data"); }

function loadUnorthodox(): UnorthodoxData | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(getDataDir(), "unorthodox_shots.json"), "utf-8"));
  } catch { return null; }
}

const SHOT_META: Record<string, { emoji: string; description: string }> = {
  "slog":          { emoji: "💥", description: "Brute-force hit across the line, primarily off pace bowling. High risk, extreme reward." },
  "slog sweep":    { emoji: "🌀", description: "Sweeping slog against spin across the line. One of the most common T20 attacking plays." },
  "reverse sweep": { emoji: "↩️", description: "Switching grip to play behind point off spin. Disrupts field settings." },
  "scoop":         { emoji: "🥄", description: "Flicking ball over wicketkeeper off pace. Requires exceptional reflexes." },
  "upper cut":     { emoji: "✂️", description: "Slapping short ball over point/third man. Exploits short-pitched pace." },
  "hook":          { emoji: "🪝", description: "Pulling short ball to leg side. High miss-rate but boundary-heavy." },
  "switch hit":    { emoji: "🔄", description: "Switching stance mid-delivery against spin. A rare skill shot." },
  "reverse scoop": { emoji: "🌪️", description: "Scooping ball behind wicketkeeper off pace. Extremely high-risk." },
  "lap":           { emoji: "🌊", description: "Fine glance/lap off pace bowling. Redirecting away from fielders." },
  "drop and run":  { emoji: "🏃", description: "Soft drop for a quick single. Placement over power." },
  "slice":         { emoji: "🍕", description: "Slicing ball through covers. Touch shot variant." },
};

const RISK_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  "Low":     { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  "Medium":  { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30" },
  "High":    { text: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/30" },
  "Extreme": { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/30" },
};

export default function UnorthodoxPage() {
  const data = loadUnorthodox();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="text-center">
          <FlameKindling size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Unorthodox shots data not generated yet.</p>
          <p className="text-slate-600 text-sm">Run <code className="bg-slate-800 px-1 rounded">python process_unorthodox.py</code> first.</p>
          <Link href="/" className="mt-4 inline-block text-cyan-400 hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  const { global: globalShots, players, meta } = data;

  // aggregate totals
  const totalBalls = Object.values(globalShots).reduce((s, d) => s + d.balls, 0);
  const totalRuns = Object.values(globalShots).reduce((s, d) => s + d.runs, 0);
  const totalSixes = Object.values(globalShots).reduce((s, d) => s + d.sixes, 0);
  const totalWkts = Object.values(globalShots).reduce((s, d) => s + d.wickets, 0);
  const overallSR = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : "0";

  // sorted shot overview
  const shotsByUsage = Object.entries(globalShots).sort((a, b) => b[1].balls - a[1].balls);

  return (
    <div className="min-h-screen bg-[#050811]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#050811]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-semibold hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <FlameKindling size={16} className="text-amber-400" />
          <span className="text-sm font-black text-white">Unorthodox Shots Analytics</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Hero */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.10),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
              <FlameKindling size={10} />
              Advanced Batting Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Unorthodox Shots<br />
              <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                Deep Analytics
              </span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl mb-6">
              Scoops, switch hits, reverse sweeps, hooks, slogs and more — analysed by strike rate,
              contact quality, bowler type, line & length, and player proficiency.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Balls",    value: totalBalls.toLocaleString(), color: "text-cyan-400" },
                { label: "Runs Scored",    value: totalRuns.toLocaleString(),  color: "text-white" },
                { label: "Overall SR",     value: overallSR,                   color: "text-amber-400" },
                { label: "6s Hit",         value: totalSixes.toLocaleString(), color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center">
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shot type cards overview */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Shot Type Overview</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {shotsByUsage.map(([shotKey, d]) => {
              const m = meta[shotKey];
              const shotMeta = SHOT_META[shotKey] || { emoji: "🏏", description: "" };
              if (!m) return null;
              const riskStyle = RISK_COLOR[m.risk] || RISK_COLOR["Medium"];
              const paceB = d.bowler_types?.["PACE"] || 0;
              const spinB = d.bowler_types?.["SPIN"] || 0;
              const totalBT = paceB + spinB;

              return (
                <div
                  key={shotKey}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
                >
                  {/* Title */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{shotMeta.emoji}</span>
                        <span className="font-black text-white text-sm">{m.label}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                        {m.risk} Risk
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: m.color }}>{d.sr}</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">SR</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 leading-relaxed">{shotMeta.description}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="bg-slate-800/50 rounded-lg py-1.5">
                      <div className="text-sm font-black text-cyan-400">{d.balls.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-600 uppercase">Balls</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg py-1.5">
                      <div className="text-sm font-black text-emerald-400">{d.boundary_pct}%</div>
                      <div className="text-[9px] text-slate-600 uppercase">Boundary</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg py-1.5">
                      <div className="text-sm font-black text-rose-400">{d.dot_pct}%</div>
                      <div className="text-[9px] text-slate-600 uppercase">Dot</div>
                    </div>
                  </div>

                  {/* Pace vs spin bar */}
                  {totalBT > 0 && (
                    <div>
                      <div className="flex justify-between text-[9px] text-slate-500 mb-1 uppercase tracking-wider">
                        <span>Pace {Math.round((paceB / totalBT) * 100)}%</span>
                        <span>Spin {Math.round((spinB / totalBT) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-orange-500" style={{ width: `${(paceB / totalBT) * 100}%` }} />
                        <div className="h-full bg-violet-500 flex-1" />
                      </div>
                    </div>
                  )}

                  {/* SR bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.sr / 3)}%`, background: m.color }} />
                  </div>

                  {/* Top lengths */}
                  {Object.keys(d.lengths || {}).length > 0 && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-600 mb-1">Common Length</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(d.lengths).slice(0, 3).map(([len, cnt]) => (
                          <span key={len} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                            {len}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Interactive detailed view with leaderboards */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-cyan-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Shot Leaderboards & Breakdowns</h2>
          </div>
          <UnorthodoxGlobalView data={data} />
        </section>

        {/* Most unorthodox players */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Star size={18} className="text-amber-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Most Unorthodox Batters</h2>
            <span className="text-[11px] text-slate-500 ml-1">(by total unorthodox balls faced)</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Player</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Balls</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Runs</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">SR</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">6s</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Shot Mix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {players.slice(0, 30).map((p, i) => {
                  const topShots = Object.entries(p.shots).sort((a, b) => b[1].balls - a[1].balls).slice(0, 4);
                  return (
                    <tr key={p.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className={`px-4 py-3 text-sm font-black ${i < 3 ? "text-amber-400" : "text-slate-600"}`}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/player/${p.file}`}
                          className="font-semibold text-white text-sm hover:text-amber-300 transition-colors"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-cyan-400 font-black text-sm">{p.total_balls}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 text-sm">{p.total_runs}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-amber-400 font-bold text-sm">{p.overall_sr}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-purple-400 font-bold text-sm">{p.total_sixes}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {topShots.map(([shot, s]) => {
                            const m = meta[shot];
                            return m ? (
                              <span
                                key={shot}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}
                              >
                                {SHOT_META[shot]?.emoji} {m.label} {s.balls}b
                              </span>
                            ) : null;
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-6 text-center text-slate-600 text-xs">
        Talking Bat · Cricket Analytics · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
