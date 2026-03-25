import fs from "fs";
import path from "path";
import Link from "next/link";
import type { PlayerProfile, PlayerIndex } from "@/lib/types";
import { ArrowLeft, Trophy, Zap, Target, TrendingUp, Activity, BarChart3, FlameKindling } from "lucide-react";
import WagonWheelPanel from "@/components/WagonWheelPanel";
import PhaseChart from "@/components/PhaseChart";
import ShotBreakdown from "@/components/ShotBreakdown";
import LengthLineHeatmap from "@/components/LengthLineHeatmap";
import BowlingDeliveryChart from "@/components/BowlingDeliveryChart";
import DismissalChart from "@/components/DismissalChart";
import InningsRunChart from "@/components/InningsRunChart";
import UnorthodoxShotsPanel from "@/components/UnorthodoxShotsPanel";

function getDataDir() {
  return path.join(process.cwd(), "public", "data");
}

export async function generateStaticParams() {
  try {
    const p = path.join(getDataDir(), "players_index.json");
    const players: PlayerIndex[] = JSON.parse(fs.readFileSync(p, "utf-8"));
    return players.map((player) => ({
      slug: player.file.replace(".json", ""),
    }));
  } catch {
    return [];
  }
}

function loadPlayer(slug: string): PlayerProfile | null {
  try {
    const p = path.join(getDataDir(), `${slug}.json`);
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

const TEAM_ACCENT: Record<string, string> = {
  "Hyderabad Kingsman": "text-violet-400",
  "Islamabad United": "text-red-400",
  "Lahore Qalandars": "text-emerald-400",
  "Quetta Gladiators": "text-blue-400",
  "Rawalpiniz": "text-yellow-400",
  "Karachi Kings": "text-cyan-400",
  "Peshawr Zalmi": "text-orange-400",
  "Multan Sultan": "text-teal-400",
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
      <div className={`text-xl font-black ${accent || "text-cyan-400"}`}>{value}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon, title, color }: { icon: React.ReactNode; title: string; color?: string }) {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-2 border-b border-slate-800 ${color || ""}`}>
      {icon}
      <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = loadPlayer(slug);

  if (!player) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-4">Player not found</p>
          <Link href="/" className="text-cyan-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const { batting: bat, bowling: bowl } = player;
  const accentClass = TEAM_ACCENT[player.team] || "text-slate-400";
  const hasBatting = bat?.innings > 0;
  const hasBowling = bowl?.innings > 0;

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
          <span className="text-sm font-bold text-white truncate">{player.name}</span>
          <span className={`text-xs font-bold ml-auto hidden sm:inline ${accentClass}`}>{player.team}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Player Hero */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_60%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-black text-slate-300 shrink-0">
              {player.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${accentClass}`}>{player.team}</div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {player.country && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                    {player.country}
                  </span>
                )}
                {player.batting_style && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                    {player.batting_style}
                  </span>
                )}
                {player.bowling_style && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                    {player.bowling_style}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── BATTING SECTION ── */}
        {hasBatting && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Batting</h2>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              <StatCard label="Innings" value={bat.innings} />
              <StatCard label="Runs" value={bat.runs} accent="text-cyan-400" />
              <StatCard label="Average" value={bat.average} accent="text-emerald-400" />
              <StatCard label="Strike Rate" value={bat.strike_rate} accent="text-amber-400" />
              <StatCard label="Best" value={bat.best_score} accent="text-violet-400" />
              <StatCard label="50s" value={bat.fifties} accent="text-sky-400" />
              <StatCard label="100s" value={bat.hundreds} accent="text-yellow-400" />
              <StatCard label="4s" value={bat.fours} accent="text-blue-400" />
              <StatCard label="6s" value={bat.sixes} accent="text-purple-400" />
            </div>

            {/* Phase + Wagon + Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Wagon Wheel */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Wagon Wheel</div>
                  </div>
                  <div className="p-3">
                    <WagonWheelPanel rawRows={player.wagon_rows} battingStyle={player.batting_style} />
                  </div>
                </div>
              </div>

              {/* Phase Analysis */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <Activity size={14} className="text-cyan-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Phase Analysis</div>
                  </div>
                  <div className="p-4">
                    <PhaseChart phases={bat.phases} type="batting" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <Target size={14} className="text-violet-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Vs Pace / Spin</div>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: "vs Pace", data: bat.vs_pace, color: "bg-cyan-500" },
                      { label: "vs Spin", data: bat.vs_spin, color: "bg-violet-500" },
                    ].map(({ label, data, color }) => {
                      const sr = data.balls > 0 ? ((data.runs / data.balls) * 100).toFixed(1) : "0.0";
                      const dotPct = data.balls > 0 ? Math.round((data.dots / data.balls) * 100) : 0;
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">{label}</span>
                            <span className="text-slate-400">{data.runs}r / {data.balls}b · SR {sr}</span>
                          </div>
                          <div className="flex gap-1 text-[10px] text-slate-500">
                            <span>{data.fours}×4</span>
                            <span>·</span>
                            <span>{data.sixes}×6</span>
                            <span>·</span>
                            <span>{dotPct}% dots</span>
                            <span>·</span>
                            <span>{data.dismissals} dis</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, Number(sr))}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dismissals + Innings */}
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <Trophy size={14} className="text-amber-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Dismissals</div>
                  </div>
                  <div className="p-4">
                    <DismissalChart dismissals={bat.dismissal_kinds} />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <BarChart3 size={14} className="text-emerald-400" />
                    <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Recent Innings</div>
                  </div>
                  <div className="p-4">
                    <InningsRunChart scores={bat.innings_scores} />
                  </div>
                </div>
              </div>
            </div>

            {/* Shot Breakdown + Length/Line Heatmap */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Activity size={14} className="text-emerald-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Shot Breakdown</div>
                </div>
                <div className="p-4">
                  <ShotBreakdown shotStats={bat.shot_stats} />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Target size={14} className="text-rose-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Length & Line</div>
                </div>
                <div className="p-4">
                  <LengthLineHeatmap lengthStats={bat.length_stats} lineStats={bat.line_stats} type="batting" />
                </div>
              </div>
            </div>
          </section>
        )}

        {!hasBatting && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-slate-500">
            No batting data found for this player in the dataset.
          </div>
        )}

        {/* ── BOWLING SECTION ── */}
        {hasBowling && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-violet-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Bowling</h2>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              <StatCard label="Innings" value={bowl.innings} />
              <StatCard label="Wickets" value={bowl.wickets} accent="text-violet-400" />
              <StatCard label="Overs" value={bowl.overs} accent="text-cyan-400" />
              <StatCard label="Economy" value={bowl.economy} accent="text-emerald-400" />
              <StatCard label="Average" value={bowl.average || "–"} accent="text-amber-400" />
              <StatCard label="SR" value={bowl.strike_rate || "–"} accent="text-sky-400" />
              <StatCard label="Dot %" value={`${bowl.dot_pct}%`} accent="text-rose-400" />
              <StatCard label="Wides" value={bowl.wides} accent="text-slate-400" />
            </div>

            {/* Bowling charts */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Activity size={14} className="text-violet-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Phase Analysis</div>
                </div>
                <div className="p-4">
                  <PhaseChart phases={bowl.phases} type="bowling" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Delivery Types</div>
                </div>
                <div className="p-4">
                  <BowlingDeliveryChart deliveryStats={bowl.delivery_stats} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Target size={14} className="text-rose-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Wicket Types</div>
                </div>
                <div className="p-4">
                  <DismissalChart dismissals={bowl.dismissal_kinds} />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Target size={14} className="text-rose-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">Length & Line</div>
                </div>
                <div className="p-4">
                  <LengthLineHeatmap lengthStats={bowl.length_stats} lineStats={bowl.line_stats} type="bowling" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                  <Activity size={14} className="text-cyan-400" />
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">vs RHB / LHB</div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: "vs RHB", data: bowl.vs_rhb, color: "bg-cyan-500" },
                    { label: "vs LHB", data: bowl.vs_lhb, color: "bg-violet-500" },
                  ].map(({ label, data, color }) => {
                    const econ = data.balls > 0 ? ((data.runs / data.balls) * 6).toFixed(2) : "0.00";
                    const wsr = data.balls > 0 && data.wickets > 0 ? (data.balls / data.wickets).toFixed(1) : "–";
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">{label}</span>
                          <span className="text-slate-400">{data.wickets}w / {Math.floor(data.balls / 6)}.{data.balls % 6} ov · Econ {econ}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Strike Rate: {wsr}</div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, (data.wickets / Math.max(bowl.wickets, 1)) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {!hasBowling && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-8 text-center text-slate-500 text-sm">
            No bowling data found for this player in the dataset.
          </div>
        )}

        {/* ── UNORTHODOX SHOTS SECTION ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FlameKindling size={20} className="text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Unorthodox Shots</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase tracking-widest">
              Batting Analysis
            </span>
          </div>
          <UnorthodoxShotsPanel
            unorthodox={player.unorthodox || {}}
            playerName={player.name}
          />
        </section>
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-6 text-center text-slate-600 text-xs">
        Talking Bat · Cricket Analytics · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
