"use client";

type Score = { runs: number; out: boolean };
type Props = { scores: Score[] };

export default function InningsRunChart({ scores }: Props) {
  if (!scores?.length) {
    return <p className="text-slate-500 text-sm text-center py-4">No innings data.</p>;
  }

  const recent = scores.slice(-20);
  const max = Math.max(...recent.map((s) => s.runs), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-20">
        {recent.map((score, i) => {
          const h = Math.max(2, (score.runs / max) * 100);
          const color = score.runs >= 50 ? "bg-amber-400" : score.runs >= 20 ? "bg-cyan-500" : "bg-slate-600";
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full">
              <div
                className={`w-full rounded-sm ${color} ${!score.out ? "opacity-60 border-t-2 border-white/30" : ""}`}
                style={{ height: `${h}%` }}
                title={`${score.runs}${score.out ? "" : "*"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block"/>50+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-cyan-500 inline-block"/>20–49</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-600 inline-block"/>&lt;20</span>
        <span className="flex items-center gap-1"><span className="w-2 h-1.5 border-t-2 border-white/50 inline-block"/>not out</span>
      </div>
      <div className="text-[10px] text-slate-500 text-center">
        Last {recent.length} innings · hover bar for score
      </div>
    </div>
  );
}
