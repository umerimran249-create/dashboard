"use client";

type StatEntry = { runs: number; balls: number; dots?: number; wickets?: number };
type Props = {
  lengthStats: Record<string, StatEntry>;
  lineStats: Record<string, StatEntry>;
  type: "batting" | "bowling";
};

function HeatRow({
  label, data, type, maxVal,
}: { label: string; data: StatEntry; type: "batting" | "bowling"; maxVal: number }) {
  const metric = type === "batting"
    ? (data.balls > 0 ? (data.runs / data.balls) * 100 : 0)
    : (data.balls > 0 ? (data.runs / data.balls) * 6 : 0);
  const metricStr = type === "batting"
    ? (data.balls > 0 ? ((data.runs / data.balls) * 100).toFixed(0) : "—")
    : (data.balls > 0 ? ((data.runs / data.balls) * 6).toFixed(2) : "—");

  const pct = maxVal > 0 ? (metric / maxVal) * 100 : 0;
  const dotPct = data.balls > 0 && data.dots !== undefined ? Math.round((data.dots / data.balls) * 100) : 0;

  const colorClass = type === "batting"
    ? pct > 70 ? "bg-cyan-500" : pct > 40 ? "bg-emerald-500" : "bg-rose-500"
    : pct > 70 ? "bg-rose-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 bg-slate-800 rounded-md overflow-hidden">
        <div className={`h-full ${colorClass} rounded-md transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-[10px] text-white w-8 text-right font-bold shrink-0">{metricStr}</span>
      <span className="text-[10px] text-slate-600 w-10 shrink-0">{data.balls}b</span>
      {data.wickets !== undefined && (
        <span className="text-[10px] text-violet-400 w-6 shrink-0">{data.wickets}w</span>
      )}
      {dotPct > 0 && (
        <span className="text-[10px] text-slate-600 w-8 shrink-0">{dotPct}%•</span>
      )}
    </div>
  );
}

export default function LengthLineHeatmap({ lengthStats, lineStats, type }: Props) {
  const lengthEntries = Object.entries(lengthStats || {})
    .filter(([, d]) => d.balls >= 3)
    .sort((a, b) => b[1].balls - a[1].balls)
    .slice(0, 8);

  const lineEntries = Object.entries(lineStats || {})
    .filter(([, d]) => d.balls >= 3)
    .sort((a, b) => b[1].balls - a[1].balls)
    .slice(0, 6);

  const maxLengthMetric = Math.max(
    ...lengthEntries.map(([, d]) =>
      type === "batting" ? (d.balls > 0 ? (d.runs / d.balls) * 100 : 0) : (d.balls > 0 ? (d.runs / d.balls) * 6 : 0)
    ),
    1
  );
  const maxLineMetric = Math.max(
    ...lineEntries.map(([, d]) =>
      type === "batting" ? (d.balls > 0 ? (d.runs / d.balls) * 100 : 0) : (d.balls > 0 ? (d.runs / d.balls) * 6 : 0)
    ),
    1
  );

  return (
    <div className="space-y-4">
      {lengthEntries.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Length · {type === "batting" ? "SR" : "Economy"}
          </p>
          <div className="space-y-1.5">
            {lengthEntries.map(([label, data]) => (
              <HeatRow key={label} label={label} data={data} type={type} maxVal={maxLengthMetric} />
            ))}
          </div>
        </div>
      )}
      {lineEntries.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Line · {type === "batting" ? "SR" : "Economy"}
          </p>
          <div className="space-y-1.5">
            {lineEntries.map(([label, data]) => (
              <HeatRow key={label} label={label} data={data} type={type} maxVal={maxLineMetric} />
            ))}
          </div>
        </div>
      )}
      {lengthEntries.length === 0 && lineEntries.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">No length/line data available.</p>
      )}
    </div>
  );
}
