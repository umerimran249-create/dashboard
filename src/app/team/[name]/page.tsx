import fs from "fs";
import path from "path";
import Link from "next/link";
import type { TeamStats, PlayerIndex } from "@/lib/types";
import { ArrowLeft, TrendingUp, Zap, Users, Target, Trophy } from "lucide-react";

function getDataDir() { return path.join(process.cwd(), "public", "data"); }

function loadTeamStats(): TeamStats {
  try { return JSON.parse(fs.readFileSync(path.join(getDataDir(), "team_stats.json"), "utf-8")); }
  catch { return {}; }
}

function loadPlayersIndex(): PlayerIndex[] {
  try { return JSON.parse(fs.readFileSync(path.join(getDataDir(), "players_index.json"), "utf-8")); }
  catch { return []; }
}

export async function generateStaticParams() {
  const stats = loadTeamStats();
  return Object.keys(stats).map((name) => ({ name }));
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

function getSafeFilename(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "_");
}

const TH = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right first:text-left ${className}`}>{children}</th>
);
const TD = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-3 py-2 text-xs text-slate-300 text-right first:text-left ${className}`}>{children}</td>
);

export default async function TeamPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const teamName = decodeURIComponent(name);
  const teamStats = loadTeamStats();
  const allPlayers = loadPlayersIndex();

  const stats = teamStats[teamName];
  const teamPlayers = allPlayers.filter((p) => p.team === teamName);
  const accentClass = TEAM_ACCENT[teamName] || "text-slate-400";

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Team not found</p>
          <Link href="/" className="text-cyan-400 hover:underline">← Back</Link>
        </div>
      </div>
    );
  }

  const localCount = teamPlayers.filter((p) => p.country === "Local").length;
  const foreignCount = teamPlayers.filter((p) => p.country === "Foreign").length;

  return (
    <div className="min-h-screen bg-[#050811]">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#050811]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight">Talking Bat</span>
              <span className={`text-xs ml-2 hidden sm:inline ${accentClass}`}>{teamName}</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-400 rounded-lg hover:bg-slate-800 transition-colors">
              <ArrowLeft size={14} />
              Home
            </Link>
            <Link href="/unorthodox" className="px-3 py-1.5 text-sm font-semibold text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors">
              Unorthodox
            </Link>
            <Link href="/ball-analysis" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-cyan-300 rounded-lg hover:bg-cyan-500/10 transition-colors">
              <Target size={14} />
              Ball Analysis
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${accentClass}`}>Franchise</div>
          <h1 className="text-3xl font-black text-white mb-3">{teamName}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-center">
              <div className={`text-xl font-black ${accentClass}`}>{teamPlayers.length}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Squad</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-black text-slate-300">{localCount}L / {foreignCount}F</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Local / Foreign</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-black text-cyan-400">
                {stats.batting.reduce((s, p) => s + p.runs, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Team Runs</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-black text-violet-400">
                {stats.bowling.reduce((s, p) => s + p.wickets, 0)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Team Wickets</div>
            </div>
          </div>
        </section>

        {/* Batting Table */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-cyan-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Batting</h2>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-800">
                <tr>
                  <TH className="text-left">Player</TH>
                  <TH>Inn</TH>
                  <TH>Runs</TH>
                  <TH>Balls</TH>
                  <TH>Avg</TH>
                  <TH>SR</TH>
                  <TH>4s</TH>
                  <TH>6s</TH>
                  <TH>50s</TH>
                  <TH>HS</TH>
                  <TH>Dot%</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats.batting.map((p) => (
                  <tr key={p.name} className="hover:bg-slate-800/30 transition-colors">
                    <TD>
                      <Link href={`/player/${getSafeFilename(p.name)}`} className="font-semibold text-white hover:text-cyan-300 transition-colors">
                        {p.name}
                      </Link>
                    </TD>
                    <TD>{p.innings}</TD>
                    <TD><span className="font-black text-cyan-400">{p.runs}</span></TD>
                    <TD>{p.balls}</TD>
                    <TD>{p.average}</TD>
                    <TD><span className="font-bold text-amber-400">{p.strike_rate}</span></TD>
                    <TD>{p.fours}</TD>
                    <TD>{p.sixes}</TD>
                    <TD>{p.fifties}</TD>
                    <TD className="font-bold text-violet-400">{p.best_score}</TD>
                    <TD>{p.dot_pct}%</TD>
                  </tr>
                ))}
                {stats.batting.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-6 text-center text-slate-500 text-sm">No batting data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bowling Table */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-violet-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Bowling</h2>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-slate-800">
                <tr>
                  <TH className="text-left">Player</TH>
                  <TH>Inn</TH>
                  <TH>Overs</TH>
                  <TH>Wkts</TH>
                  <TH>Runs</TH>
                  <TH>Econ</TH>
                  <TH>Avg</TH>
                  <TH>SR</TH>
                  <TH>Dot%</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats.bowling.map((p) => (
                  <tr key={p.name} className="hover:bg-slate-800/30 transition-colors">
                    <TD>
                      <Link href={`/player/${getSafeFilename(p.name)}`} className="font-semibold text-white hover:text-violet-300 transition-colors">
                        {p.name}
                      </Link>
                    </TD>
                    <TD>{p.innings}</TD>
                    <TD>{p.overs}</TD>
                    <TD><span className="font-black text-violet-400">{p.wickets}</span></TD>
                    <TD>{p.runs}</TD>
                    <TD><span className="font-bold text-amber-400">{p.economy}</span></TD>
                    <TD>{p.average || "–"}</TD>
                    <TD>{p.strike_rate || "–"}</TD>
                    <TD>{p.dot_pct}%</TD>
                  </tr>
                ))}
                {stats.bowling.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-6 text-center text-slate-500 text-sm">No bowling data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Squad */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-emerald-400" />
            <h2 className="text-base font-black text-white uppercase tracking-wider">Full Squad</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {teamPlayers.map((p) => (
              <Link
                key={p.name}
                href={`/player/${getSafeFilename(p.name)}`}
                className="group rounded-xl border border-slate-800 bg-slate-900/50 p-3 hover:border-slate-600 hover:bg-slate-800/60 transition-all"
              >
                <div className="text-[9px] font-bold text-slate-500 mb-1">
                  {p.country} · {p.batting_style}
                </div>
                <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors truncate">{p.name}</div>
                {p.bowling_style && (
                  <div className="text-[9px] text-slate-600 mt-0.5 truncate">{p.bowling_style}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-6 text-center text-slate-600 text-xs">
        Talking Bat · Cricket Analytics · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
