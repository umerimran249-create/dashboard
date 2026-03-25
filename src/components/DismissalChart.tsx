"use client";

type Props = { dismissals: Record<string, number> };

const COLORS = [
  "bg-cyan-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-sky-500", "bg-orange-500", "bg-teal-500",
];

export default function DismissalChart({ dismissals }: Props) {
  const entries = Object.entries(dismissals || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-4">No dismissal data.</p>;
  }

  const total = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="space-y-2">
      {entries.map(([kind, count], i) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={kind} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${COLORS[i % COLORS.length]}`} />
            <span className="text-[11px] text-slate-300 flex-1 capitalize truncate">{kind}</span>
            <span className="text-[10px] text-slate-500">{count}</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${COLORS[i % COLORS.length]} rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 w-7 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
