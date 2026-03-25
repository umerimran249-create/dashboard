"use client";
import type { BowlingStats } from "@/lib/types";

type Props = { deliveryStats: BowlingStats["delivery_stats"] };

const COLORS = [
  "from-cyan-500 to-cyan-400",
  "from-violet-500 to-violet-400",
  "from-emerald-500 to-emerald-400",
  "from-amber-500 to-amber-400",
  "from-rose-500 to-rose-400",
  "from-sky-500 to-sky-400",
  "from-orange-500 to-orange-400",
  "from-teal-500 to-teal-400",
];

export default function BowlingDeliveryChart({ deliveryStats }: Props) {
  const entries = Object.entries(deliveryStats || {})
    .filter(([, d]) => d.balls >= 3)
    .map(([delivery, data]) => ({
      delivery,
      balls: data.balls,
      runs: data.runs,
      wickets: data.wickets,
      economy: data.balls > 0 ? parseFloat(((data.runs / data.balls) * 6).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.balls - a.balls)
    .slice(0, 8);

  if (entries.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-4">No delivery data available.</p>;
  }

  const maxBalls = Math.max(...entries.map((e) => e.balls));

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {entries.map((e, i) => (
        <div key={e.delivery}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[130px]">{e.delivery}</span>
            <div className="flex items-center gap-2 text-[10px] shrink-0">
              <span className="text-violet-400 font-bold">{e.wickets}w</span>
              <span className="text-slate-400">{e.balls}b</span>
              <span className="text-amber-400">E {e.economy}</span>
            </div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${COLORS[i % COLORS.length]} rounded-full`}
              style={{ width: `${(e.balls / maxBalls) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
