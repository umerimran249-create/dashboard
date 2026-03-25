"use client";
import type { BattingStats } from "@/lib/types";

type Props = { shotStats: BattingStats["shot_stats"] };

export default function ShotBreakdown({ shotStats }: Props) {
  const entries = Object.entries(shotStats || {})
    .map(([shot, data]) => ({
      shot,
      runs: data.runs,
      balls: data.balls,
      dots: data.dots,
      sr: data.balls > 0 ? parseFloat(((data.runs / data.balls) * 100).toFixed(1)) : 0,
      dotPct: data.balls > 0 ? Math.round((data.dots / data.balls) * 100) : 0,
    }))
    .filter((e) => e.balls >= 3)
    .sort((a, b) => b.balls - a.balls)
    .slice(0, 12);

  if (entries.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-4">No shot data available.</p>;
  }

  const maxBalls = Math.max(...entries.map((e) => e.balls));

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {entries.map((e) => (
        <div key={e.shot}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[140px]">{e.shot}</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
              <span className="text-white font-bold">{e.runs}r</span>
              <span>{e.balls}b</span>
              <span className="text-cyan-400">SR {e.sr}</span>
              <span className="text-slate-600">{e.dotPct}%•</span>
            </div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              style={{ width: `${(e.balls / maxBalls) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
