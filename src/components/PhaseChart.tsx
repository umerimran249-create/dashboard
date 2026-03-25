"use client";
import type { BattingStats, BowlingStats } from "@/lib/types";

type Props =
  | { phases: BattingStats["phases"]; type: "batting" }
  | { phases: BowlingStats["phases"]; type: "bowling" };

const PHASES = [
  { key: "pp", label: "Powerplay", overs: "Ov 1–6", color: "from-cyan-500 to-cyan-400", bg: "bg-cyan-500" },
  { key: "mid", label: "Middle", overs: "Ov 7–15", color: "from-violet-500 to-violet-400", bg: "bg-violet-500" },
  { key: "death", label: "Death", overs: "Ov 16–20", color: "from-rose-500 to-rose-400", bg: "bg-rose-500" },
] as const;

export default function PhaseChart({ phases, type }: Props) {
  const maxSR = type === "batting"
    ? Math.max(...PHASES.map((p) => (phases as BattingStats["phases"])[p.key].sr || 0), 50)
    : Math.max(...PHASES.map((p) => (phases as BowlingStats["phases"])[p.key].economy || 0), 6);

  return (
    <div className="space-y-3">
      {PHASES.map(({ key, label, overs, bg }) => {
        const phaseData = (phases as BattingStats["phases"] & BowlingStats["phases"])[key];
        const balls = phaseData.balls ?? 0;
        const runs = phaseData.runs ?? 0;
        const mainMetric = type === "batting"
          ? (phaseData as BattingStats["phases"]["pp"]).sr ?? 0
          : (phaseData as BowlingStats["phases"]["pp"]).economy ?? 0;
        const wickets = type === "bowling" ? (phaseData as BowlingStats["phases"]["pp"]).wickets ?? 0 : null;

        const pct = maxSR > 0 ? (mainMetric / maxSR) * 100 : 0;
        const overs_str = balls > 0 ? `${Math.floor(balls / 6)}.${balls % 6} ov` : "—";

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-bold text-slate-300">{label}</span>
                <span className="text-[10px] text-slate-500 ml-1.5">{overs}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-white">{runs}r / {overs_str}</span>
                {wickets !== null && <span className="text-xs text-violet-400 ml-1">· {wickets}w</span>}
                <div className="text-[10px] text-slate-500">
                  {type === "batting" ? `SR ${mainMetric}` : `Econ ${mainMetric}`}
                </div>
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${bg} rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
