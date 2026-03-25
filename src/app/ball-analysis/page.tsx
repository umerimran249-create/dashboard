import fs from "fs";
import path from "path";
import Link from "next/link";
import type { BallBoundaryData } from "@/lib/types";
import { Trophy, Target, Zap, Home } from "lucide-react";
import BallBoundaryView from "@/components/BallBoundaryView";

function getDataDir() {
  return path.join(process.cwd(), "public", "data");
}

function loadBallBoundary(): BallBoundaryData | null {
  try {
    const p = path.join(getDataDir(), "ball_boundary.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

export default function BallAnalysisPage() {
  const data = loadBallBoundary();

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
            <Link href="/" className="px-3 py-1.5 text-sm font-semibold text-slate-400 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5">
              <Home size={14} />
              Home
            </Link>
            <Link href="/unorthodox" className="px-3 py-1.5 text-sm font-semibold text-amber-400 rounded-lg hover:bg-amber-500/10 transition-colors">
              Unorthodox
            </Link>
            <Link href="/ball-analysis" className="px-3 py-1.5 text-sm font-semibold text-cyan-400 rounded-lg bg-cyan-500/10">
              <span className="flex items-center gap-1.5">
                <Target size={14} />
                Ball Analysis
              </span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap size={10} />
            Ball-by-Ball Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Boundary Analysis
            <span className="block bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Ball 1 — 6
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Boundary percentage at each ball position within an over, filtered by winning matches.
            Includes pace and spin shot heatmaps with composite scoring (like the Talking Bat Heatmaps reference).
          </p>
        </div>

        {data ? (
          <BallBoundaryView data={data} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Target size={48} className="text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-300 mb-2">Data not found</h2>
            <p className="text-slate-500 max-w-sm">
              Run <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400">python process_ball_boundary.py</code> to generate the analytics data.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-16 py-6 text-center text-xs text-slate-600">
        <span className="font-bold">US- Analytics</span>
        <span className="mx-2">·</span>
        Talking Bat Analytics
      </footer>
    </div>
  );
}
