import fs from "fs";
import path from "path";
import Link from "next/link";
import type { PlayerIndex, TeamStats } from "@/lib/types";
import { Users, TrendingUp, Trophy, Zap, ChevronRight, Shield } from "lucide-react";

function getDataDir() {
  return path.join(process.cwd(), "public", "data");
}

function loadPlayersIndex(): PlayerIndex[] {
  try {
    const p = path.join(getDataDir(), "players_index.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

function loadTeamStats(): TeamStats {
  try {
    const p = path.join(getDataDir(), "team_stats.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

const TEAM_COLORS: Record<string, string> = {
  "Hyderabad Kingsman": "from-violet-600/20 to-purple-900/20 border-violet-700/40",
  "Islamabad United": "from-red-600/20 to-rose-900/20 border-red-700/40",
  "Lahore Qalandars": "from-green-600/20 to-emerald-900/20 border-green-700/40",
  "Quetta Gladiators": "from-blue-600/20 to-blue-900/20 border-blue-700/40",
  "Rawalpiniz": "from-yellow-600/20 to-amber-900/20 border-yellow-700/40",
  "Karachi Kings": "from-cyan-600/20 to-cyan-900/20 border-cyan-700/40",
  "Peshawr Zalmi": "from-orange-600/20 to-orange-900/20 border-orange-700/40",
  "Multan Sultan": "from-teal-600/20 to-teal-900/20 border-teal-700/40",
};

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

function getSafeFilename(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_");
}

export default function HomePage() {
  const players = loadPlayersIndex();
  const teamStats = loadTeamStats();

  const teams = [...new Set(players.map((p) => p.team))].sort();

  const topBatters = [...players]
    .filter((p) => p.batting_innings >= 2)
    .sort((a, b) => b.batting_runs - a.batting_runs)
    .slice(0, 10);

  const topBowlers = [...players]
    .filter((p) => p.bowling_innings >= 2 && p.bowling_wickets > 0)
    .sort((a, b) => b.bowling_wickets - a.bowling_wickets)
    .slice(0, 10);

  const totalPlayers = players.length;
  const totalRuns = players.reduce((s, p) => s + p.batting_runs, 0);
  const totalWickets = players.reduce((s, p) => s + p.bowling_wickets, 0);

  return (
    <div className="min-h-screen bg-[#050811]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#050811]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">Talking Bat</span>
              <span className="text-slate-500 text-xs ml-2 hidden sm:inline">Cricket Analytics</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 text-sm font-semibold text-cyan-400 rounded-lg bg-cyan-500/10">Home</Link>
            <Link href="/unorthodox" className="px-3 py-1.5 text-sm font-semibold text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors">
              Unorthodox
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero */}
        <section>
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.08),transparent_60%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Zap size={10} />
                T20 League · 2024/25 Season
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                Cricket Analytics<br />
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-slate-400 text-base max-w-xl">
                Deep-dive ball-by-ball analytics for {totalPlayers} players across {teams.length} T20 franchises.
                Batting, bowling, wagon wheels, phase analysis and more.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-cyan-400">{totalPlayers}</div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Players</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-violet-400">{teams.length}</div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Teams</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-emerald-400">{totalRuns.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Runs</div>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-amber-400">{totalWickets.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Wickets</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Teams Grid */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-cyan-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Teams</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {teams.map((team) => {
              const teamPlayers = players.filter((p) => p.team === team);
              const topBatter = [...teamPlayers].sort((a, b) => b.batting_runs - a.batting_runs)[0];
              const topBowler = [...teamPlayers].filter(p => p.bowling_wickets > 0).sort((a, b) => b.bowling_wickets - a.bowling_wickets)[0];
              const colorClass = TEAM_COLORS[team] || "from-slate-700/20 to-slate-900/20 border-slate-700/40";
              const accentClass = TEAM_ACCENT[team] || "text-slate-400";

              return (
                <Link
                  key={team}
                  href={`/team/${encodeURIComponent(team)}`}
                  className={`group rounded-2xl border bg-gradient-to-br ${colorClass} p-4 hover:scale-[1.02] transition-all duration-200 hover:shadow-lg`}
                >
                  <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${accentClass}`}>
                    {teamPlayers.filter(p => p.country === "Local").length}L · {teamPlayers.filter(p => p.country === "Foreign").length}F
                  </div>
                  <div className="font-black text-white text-sm leading-tight mb-3">{team}</div>
                  {topBatter && (
                    <div className="text-[10px] text-slate-400">
                      <span className="text-slate-500">Top bat:</span> <span className="text-slate-300">{topBatter.name.split(" ")[0]}</span>
                      <span className={`ml-1 font-bold ${accentClass}`}>{topBatter.batting_runs}r</span>
                    </div>
                  )}
                  {topBowler && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      <span className="text-slate-500">Top bowl:</span> <span className="text-slate-300">{topBowler.name.split(" ")[0]}</span>
                      <span className={`ml-1 font-bold ${accentClass}`}>{topBowler.bowling_wickets}w</span>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">{teamPlayers.length} players</span>
                    <ChevronRight size={12} className={`${accentClass} group-hover:translate-x-0.5 transition-transform`} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Leaderboards */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Top Batters */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Top Run Scorers</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {topBatters.map((p, i) => (
                <Link
                  key={p.name}
                  href={`/player/${getSafeFilename(p.name)}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group"
                >
                  <span className={`text-sm font-black w-6 text-center ${i < 3 ? "text-amber-400" : "text-slate-600"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-black text-base">{p.batting_runs}</div>
                    <div className="text-[10px] text-slate-500">
                      Avg {p.batting_avg} · SR {p.batting_sr}
                    </div>
                  </div>
                </Link>
              ))}
              {topBatters.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                  No data available yet — run the data processor first.
                </div>
              )}
            </div>
          </div>

          {/* Top Bowlers */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-violet-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Top Wicket Takers</h3>
            </div>
            <div className="divide-y divide-slate-800/50">
              {topBowlers.map((p, i) => (
                <Link
                  key={p.name}
                  href={`/player/${getSafeFilename(p.name)}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group"
                >
                  <span className={`text-sm font-black w-6 text-center ${i < 3 ? "text-amber-400" : "text-slate-600"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate group-hover:text-violet-300 transition-colors">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.team}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-violet-400 font-black text-base">{p.bowling_wickets}w</div>
                    <div className="text-[10px] text-slate-500">
                      Econ {p.bowling_economy} · Avg {p.bowling_avg}
                    </div>
                  </div>
                </Link>
              ))}
              {topBowlers.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                  No data available yet — run the data processor first.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All Players */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-emerald-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">All Players</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {players.map((p) => {
              const accentClass = TEAM_ACCENT[p.team] || "text-slate-400";
              const isLHB = p.batting_style?.toUpperCase().includes("LHB") || p.batting_style?.toUpperCase().startsWith("L");
              return (
                <Link
                  key={p.name}
                  href={`/player/${getSafeFilename(p.name)}`}
                  className="group rounded-xl border border-slate-800 bg-slate-900/50 p-3 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 ${accentClass}`}>
                      {p.country === "Foreign" ? "F" : "L"}
                    </span>
                    {isLHB && (
                      <span className="text-[9px] font-bold text-amber-500/70">LHB</span>
                    )}
                  </div>
                  <div className="font-bold text-white text-xs leading-tight mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {p.name}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-wider ${accentClass} mb-2 truncate`}>{p.team}</div>
                  <div className="space-y-0.5">
                    {p.batting_innings > 0 && (
                      <div className="text-[10px] text-slate-400">
                        <span className="text-cyan-400 font-bold">{p.batting_runs}</span>
                        <span className="text-slate-600"> r · </span>
                        <span className="text-slate-400">SR {p.batting_sr}</span>
                      </div>
                    )}
                    {p.bowling_wickets > 0 && (
                      <div className="text-[10px] text-slate-400">
                        <span className="text-violet-400 font-bold">{p.bowling_wickets}</span>
                        <span className="text-slate-600"> wkts · </span>
                        <span className="text-slate-400">E {p.bowling_economy}</span>
                      </div>
                    )}
                    {p.batting_innings === 0 && p.bowling_wickets === 0 && (
                      <div className="text-[10px] text-slate-600">No match data</div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-8 text-center text-slate-600 text-xs">
        Talking Bat · Cricket Analytics · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
