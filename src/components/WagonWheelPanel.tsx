"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

type BallByBallRow = {
  Zone?: number | string;
  zone?: number | string;
  Angle?: number | string;
  batsman_runs?: number;
  is_wicket?: number | string;
};

type WagonMetric =
  | "runsTotal" | "runsPercentage"
  | "shotTotal" | "shotPercentage"
  | "dotsTotal" | "dotsPercentage"
  | "boundaryTotal" | "boundaryPercentage";

type ViewMode = "wagon" | "spider";

type NormalizedShot = {
  runs: number;
  zone: number | null;
  x: number;
  y: number;
  source: "coords" | "zone" | "angle" | "none";
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const CRICKET_SECTORS = [
  { name: "Fine Leg", startAngle: 45, endAngle: 90, key: "oneCount" },
  { name: "Square Leg", startAngle: 90, endAngle: 135, key: "twoCount" },
  { name: "Mid Wicket", startAngle: 135, endAngle: 180, key: "threeCount" },
  { name: "Long On", startAngle: 180, endAngle: 225, key: "fourCount" },
  { name: "Mid Off", startAngle: 225, endAngle: 270, key: "fiveCount" },
  { name: "Extra Cover", startAngle: 270, endAngle: 315, key: "sixCount" },
  { name: "Cover", startAngle: 315, endAngle: 360, key: "sevenCount" },
  { name: "Point", startAngle: 0, endAngle: 45, key: "eightCount" },
] as const;

const SECTOR_POSITIONS = [
  { top: "12%", left: "60%" },
  { top: "12%", left: "36%" },
  { top: "28%", left: "17%" },
  { top: "56%", left: "15%" },
  { top: "78%", left: "32%" },
  { top: "78%", left: "68%" },
  { top: "56%", left: "83%" },
  { top: "28%", left: "80%" },
];

const IMAGE_RATIO = 454 / 520;
const CENTER_X_RATIO = 227 / 454;
const CENTER_Y_RATIO = 227 / 520;
const OUTER_RADIUS_RATIO = 180 / 454;
const WAGON_MAX_RADIUS_RATIO = 100 / 454;
const WAGON_MIN_RADIUS_RATIO = 20 / 454;
const SPIDER_ZONE_RADIUS_RATIO = 135 / 454;

const clean = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s || s === "\\N" || s === "-") return "";
  if (["nan", "null", "undefined"].includes(s.toLowerCase())) return "";
  return s;
};

const normalizeAngle = (angle: number) => {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const buildFieldGeometry = (canvasWidth: number) => {
  const canvasHeight = canvasWidth / IMAGE_RATIO;
  const centerPoint: [number, number] = [
    canvasWidth * CENTER_X_RATIO,
    canvasHeight * CENTER_Y_RATIO,
  ];
  return {
    canvasWidth,
    canvasHeight,
    centerPoint,
    outerRadius: canvasWidth * OUTER_RADIUS_RATIO,
    wagonMaxRadius: canvasWidth * WAGON_MAX_RADIUS_RATIO,
    wagonMinRadius: canvasWidth * WAGON_MIN_RADIUS_RATIO,
    spiderZoneRadius: canvasWidth * SPIDER_ZONE_RADIUS_RATIO,
  };
};

const getSectorForAngle = (angle: number) => {
  const a = normalizeAngle(angle);
  return CRICKET_SECTORS.find((s) => {
    const { startAngle: start, endAngle: end } = s;
    if (start > end) return a >= start || a <= end;
    return a >= start && a <= end;
  });
};

const zoneNumberToSectorKey = (zone: number | null) => {
  if (!zone || zone < 1 || zone > 8) return null;
  return CRICKET_SECTORS[zone - 1].key;
};

const pointFromZoneCenter = (zone: number, geometry: ReturnType<typeof buildFieldGeometry>) => {
  const sector = CRICKET_SECTORS[zone - 1];
  const midAngle = (sector.startAngle + sector.endAngle) / 2;
  const rad = (midAngle * Math.PI) / 180;
  return {
    x: geometry.centerPoint[0] + Math.cos(rad) * geometry.spiderZoneRadius,
    y: geometry.centerPoint[1] - Math.sin(rad) * geometry.spiderZoneRadius,
  };
};

const parseZoneNumeric = (zoneRaw: unknown) => {
  const raw = clean(zoneRaw);
  if (!raw) return null;
  const z = parseInt(raw, 10);
  if (!Number.isNaN(z) && z >= 1 && z <= 8) return z;
  return null;
};

const isPureNumericZone = (zoneRaw: unknown) => /^[1-8]$/.test(clean(zoneRaw));

const parseZoneCoordinate = (
  zoneRaw: unknown,
  geometry: ReturnType<typeof buildFieldGeometry>
): { zone: number | null; x: number; y: number } | null => {
  const raw = clean(zoneRaw);
  if (!raw) return null;
  const parts = raw.split(/[-, ]+/).map(Number).filter((n) => Number.isFinite(n));
  if (parts.length >= 6) {
    const [hitX, hitY, , , width, height] = parts;
    const x = clamp((hitX / width) * geometry.canvasWidth, 0, geometry.canvasWidth);
    const y = clamp((hitY / height) * geometry.canvasHeight, 0, geometry.canvasHeight);
    const dx = x - geometry.centerPoint[0];
    const dy = geometry.centerPoint[1] - y;
    const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
    const sector = getSectorForAngle(angle);
    const zone = sector ? CRICKET_SECTORS.findIndex((s) => s.key === sector.key) + 1 : null;
    return { zone, x, y };
  }
  return null;
};

const parseAngleFallback = (angleRaw: unknown) => {
  const a = Number(angleRaw);
  if (!Number.isFinite(a)) return null;
  const sector = getSectorForAngle(normalizeAngle(a));
  if (!sector) return null;
  return CRICKET_SECTORS.findIndex((s) => s.key === sector.key) + 1;
};

const remapLHBNumericZone = (zone: number | null, isLHB: boolean) => {
  if (!zone || !isLHB) return zone;
  const m: Record<number, number> = { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 };
  return m[zone] ?? zone;
};

const buildNormalizedShot = (
  row: BallByBallRow,
  geometry: ReturnType<typeof buildFieldGeometry>,
  isLHB: boolean
): NormalizedShot => {
  const runs = Number(row.batsman_runs ?? 0);
  const rawZone = row.Zone ?? row.zone;

  const coordParsed = parseZoneCoordinate(rawZone, geometry);
  if (coordParsed) return { runs, zone: coordParsed.zone, x: coordParsed.x, y: coordParsed.y, source: "coords" };

  const numericZone = parseZoneNumeric(rawZone);
  if (numericZone) {
    const rz = remapLHBNumericZone(numericZone, isLHB);
    const p = pointFromZoneCenter(rz!, geometry);
    return { runs, zone: rz, x: p.x, y: p.y, source: "zone" };
  }

  const angleZone = parseAngleFallback(row.Angle);
  if (angleZone) {
    const p = pointFromZoneCenter(angleZone, geometry);
    return { runs, zone: angleZone, x: p.x, y: p.y, source: "angle" };
  }

  return { runs, zone: null, x: geometry.centerPoint[0], y: geometry.centerPoint[1], source: "none" };
};

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const measure = () => { const w = el.clientWidth; if (w > 0) setWidth(w); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return { ref, width };
}

type CardProps = { title: string; className?: string; children?: React.ReactNode; right?: React.ReactNode };

const Card = ({ title, className, children, right }: CardProps) => (
  <div className={cx("bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden", className)}>
    <div className="px-4 py-3 border-b border-slate-800/70 relative flex items-center justify-center">
      <div className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 text-center">{title}</div>
      {right && <div className="absolute right-4">{right}</div>}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

function WagonSpiderCanvas({
  rawRows, battingStyle, viewMode, displayType, selectedButtons,
}: {
  rawRows: BallByBallRow[];
  battingStyle?: string;
  viewMode: ViewMode;
  displayType: WagonMetric;
  selectedButtons: number[];
}) {
  const { ref: wrapRef, width: wrapWidth } = useMeasuredWidth<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const drawingWidth = useMemo(() => {
    if (!wrapWidth) return 320;
    return Math.max(260, Math.min(wrapWidth - 8, 346));
  }, [wrapWidth]);

  const geometry = useMemo(() => buildFieldGeometry(drawingWidth), [drawingWidth]);

  const isLHB = useMemo(() => {
    const s = (battingStyle || "").toLowerCase().trim();
    return s.includes("left") || s.includes("lhb") || s.startsWith("l");
  }, [battingStyle]);

  const shots = useMemo(
    () => rawRows.map((row) => buildNormalizedShot(row, geometry, isLHB)),
    [rawRows, geometry, isLHB]
  );

  const hasCoordinateZones = useMemo(
    () => rawRows.some((row) => { const raw = clean(row.Zone ?? row.zone); return raw && !isPureNumericZone(raw); }),
    [rawRows]
  );

  const stats = useMemo(() => {
    const base = {
      shotCount: { oneCount: 0, twoCount: 0, threeCount: 0, fourCount: 0, fiveCount: 0, sixCount: 0, sevenCount: 0, eightCount: 0, totalNumber: 0 },
      runCount: { oneCount: 0, twoCount: 0, threeCount: 0, fourCount: 0, fiveCount: 0, sixCount: 0, sevenCount: 0, eightCount: 0, totalRuns: 0 },
      dotCount: { oneCount: 0, twoCount: 0, threeCount: 0, fourCount: 0, fiveCount: 0, sixCount: 0, sevenCount: 0, eightCount: 0, totalDots: 0 },
      boundaryCount: { oneCount: 0, twoCount: 0, threeCount: 0, fourCount: 0, fiveCount: 0, sixCount: 0, sevenCount: 0, eightCount: 0, totalBoundaries: 0 },
    };
    rawRows.forEach((row, i) => {
      const shot = shots[i];
      if (!shot) return;
      const key = zoneNumberToSectorKey(shot.zone);
      if (!key) return;
      base.shotCount[key]++;
      base.shotCount.totalNumber++;
      base.runCount[key] += shot.runs;
      base.runCount.totalRuns += shot.runs;
      if (shot.runs === 0) { base.dotCount[key]++; base.dotCount.totalDots++; }
      if (shot.runs === 4 || shot.runs === 6) { base.boundaryCount[key]++; base.boundaryCount.totalBoundaries++; }
    });
    return base;
  }, [rawRows, shots]);

  const labelSectorOrder: (keyof typeof stats.shotCount)[] = hasCoordinateZones
    ? ["oneCount", "twoCount", "threeCount", "fourCount", "fiveCount", "sixCount", "sevenCount", "eightCount"]
    : ["oneCount", "eightCount", "sevenCount", "sixCount", "fiveCount", "fourCount", "threeCount", "twoCount"];

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, geometry.canvasWidth, geometry.canvasHeight);
  };

  const drawLineFromShot = (ctx: CanvasRenderingContext2D, shot: NormalizedShot) => {
    let color = "rgba(240,240,240,0.55)";
    if (shot.runs === 4) color = "rgba(61,209,255,0.85)";
    if (shot.runs === 6) color = "rgba(216,61,255,0.85)";
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.2, geometry.canvasWidth * 0.004);
    ctx.moveTo(geometry.centerPoint[0], geometry.centerPoint[1]);
    ctx.lineTo(shot.x, shot.y);
    ctx.stroke();
  };

  const drawSectorFill = (ctx: CanvasRenderingContext2D) => {
    for (let angle = 0; angle < 360; angle += 45) {
      const radian = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(geometry.centerPoint[0], geometry.centerPoint[1]);
      ctx.lineTo(
        geometry.centerPoint[0] + Math.cos(radian) * geometry.outerRadius,
        geometry.centerPoint[1] - Math.sin(radian) * geometry.outerRadius
      );
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const visualSectors = [
      { startAngle: 45, endAngle: 90 }, { startAngle: 90, endAngle: 135 },
      { startAngle: 135, endAngle: 180 }, { startAngle: 180, endAngle: 225 },
      { startAngle: 225, endAngle: 270 }, { startAngle: 270, endAngle: 315 },
      { startAngle: 315, endAngle: 360 }, { startAngle: 0, endAngle: 45 },
    ];

    const orderedValues = labelSectorOrder.map((k) =>
      Number(
        displayType.startsWith("runs") ? stats.runCount[k as keyof typeof stats.runCount]
        : displayType.startsWith("dots") ? stats.dotCount[k as keyof typeof stats.dotCount]
        : displayType.startsWith("boundary") ? stats.boundaryCount[k as keyof typeof stats.boundaryCount]
        : stats.shotCount[k as keyof typeof stats.shotCount]
      ) || 0
    );
    const maxValue = Math.max(...orderedValues, 1);

    visualSectors.forEach((vs, index) => {
      const sectorKey = labelSectorOrder[index];
      const value = Number(
        displayType.startsWith("runs") ? stats.runCount[sectorKey as keyof typeof stats.runCount]
        : displayType.startsWith("dots") ? stats.dotCount[sectorKey as keyof typeof stats.dotCount]
        : displayType.startsWith("boundary") ? stats.boundaryCount[sectorKey as keyof typeof stats.boundaryCount]
        : stats.shotCount[sectorKey as keyof typeof stats.shotCount]
      ) || 0;
      if (value <= 0) return;

      const radiusRange = geometry.wagonMaxRadius - geometry.wagonMinRadius;
      const radius = geometry.wagonMinRadius + (value / maxValue) * radiusRange;
      const startRad = (vs.startAngle * Math.PI) / 180;
      const endRad = (vs.endAngle * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(geometry.centerPoint[0], geometry.centerPoint[1]);
      ctx.arc(geometry.centerPoint[0], geometry.centerPoint[1], radius, -startRad, -endRad, true);
      ctx.lineTo(geometry.centerPoint[0], geometry.centerPoint[1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,165,0,0.3)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,165,0,0.65)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const drawSpider = (filters: number[] = []) => {
    if (!canvasRef.current) return;
    clearCanvas();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    shots.forEach((shot) => {
      if (filters.length === 0) { drawLineFromShot(ctx, shot); return; }
      const shouldDraw = filters.some((id) => {
        if (id === 1) return shot.runs === 1;
        if (id === 2) return shot.runs === 2 || shot.runs === 3;
        if (id === 3) return shot.runs === 4;
        if (id === 4) return shot.runs === 6;
        return false;
      });
      if (shouldDraw) drawLineFromShot(ctx, shot);
    });
  };

  const drawWagon = () => {
    if (!canvasRef.current) return;
    clearCanvas();
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) drawSectorFill(ctx);
  };

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;
    if (viewMode === "wagon") drawWagon();
    else drawSpider(selectedButtons);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded, viewMode, displayType, selectedButtons, stats, shots, geometry]);

  const getPrintValue = (key: keyof typeof stats.shotCount) => {
    const formatPct = (num: number, total: number) => total ? `${Math.floor((num / total) * 100)}%` : "0%";
    if (displayType === "shotTotal") return stats.shotCount[key] || 0;
    if (displayType === "shotPercentage") return formatPct(stats.shotCount[key] as number, stats.shotCount.totalNumber);
    if (displayType === "runsTotal") return stats.runCount[key as keyof typeof stats.runCount] || 0;
    if (displayType === "runsPercentage") return formatPct(stats.runCount[key as keyof typeof stats.runCount] as number, stats.runCount.totalRuns);
    if (displayType === "dotsTotal") return stats.dotCount[key as keyof typeof stats.dotCount] || 0;
    if (displayType === "dotsPercentage") return formatPct(stats.dotCount[key as keyof typeof stats.dotCount] as number, stats.dotCount.totalDots);
    if (displayType === "boundaryTotal") return stats.boundaryCount[key as keyof typeof stats.boundaryCount] || 0;
    if (displayType === "boundaryPercentage") return formatPct(stats.boundaryCount[key as keyof typeof stats.boundaryCount] as number, stats.boundaryCount.totalBoundaries);
    return 0;
  };

  const fieldImage = viewMode === "wagon" ? "/assets/wagon.svg" : "/assets/spider.svg";

  return (
    <div ref={wrapRef} className="relative w-full h-full flex items-start justify-center">
      <div className="relative shrink-0" style={{ width: geometry.canvasWidth, height: geometry.canvasHeight }}>
        <img
          src={fieldImage}
          alt="Cricket field"
          className="absolute inset-0 w-full h-full object-fill"
          onLoad={() => setImageLoaded(true)}
        />
        <canvas ref={canvasRef} width={geometry.canvasWidth} height={geometry.canvasHeight} className="absolute inset-0" />
        {viewMode === "wagon" &&
          labelSectorOrder.map((sectorKey, index) => (
            <div
              key={`${String(sectorKey)}-${index}`}
              className="absolute bg-slate-900/90 text-cyan-300 px-2 py-0.5 rounded-lg shadow text-center min-w-[36px] text-[11px] font-bold border border-slate-700"
              style={{ top: SECTOR_POSITIONS[index].top, left: SECTOR_POSITIONS[index].left, transform: "translate(-50%, -50%)" }}
            >
              {getPrintValue(sectorKey)}
            </div>
          ))}
        <div className="absolute bottom-2 right-2 text-[8px] font-black text-slate-600 uppercase italic">
          {`${viewMode} · ${displayType.replace(/([A-Z])/g, " $1").toLowerCase()}`}
        </div>
      </div>
    </div>
  );
}

export default function WagonWheelPanel({ rawRows, battingStyle }: { rawRows: BallByBallRow[]; battingStyle?: string }) {
  const wagonMenuRef = useRef<HTMLDivElement | null>(null);
  const [wagonMenuOpen, setWagonMenuOpen] = useState(false);
  const [wagonViewMode, setWagonViewMode] = useState<ViewMode>("wagon");
  const [wagonDisplayType, setWagonDisplayType] = useState<WagonMetric>("runsTotal");
  const [wagonSelectedButtons, setWagonSelectedButtons] = useState<number[]>([]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wagonMenuRef.current?.contains(e.target as Node)) setWagonMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <Card
      title="Wagon Wheel"
      className="h-full !rounded-none border-0"
      right={
        <div ref={wagonMenuRef} className="relative">
          <button
            onClick={() => setWagonMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-xl border border-slate-700 bg-slate-900/90 flex items-center justify-center text-slate-300 hover:border-cyan-500/60 hover:text-cyan-300 transition-colors"
          >
            <SlidersHorizontal size={14} />
          </button>
          {wagonMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-800 bg-slate-950/98 p-3 shadow-2xl backdrop-blur-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2">View</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {(["wagon", "spider"] as ViewMode[]).map((m) => (
                  <button key={m} onClick={() => setWagonViewMode(m)}
                    className={cx("rounded-xl border px-2 py-1.5 text-[11px] font-bold capitalize transition-colors",
                      wagonViewMode === m ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" : "border-slate-800 bg-slate-900/50 text-slate-400"
                    )}>{m}</button>
                ))}
              </div>
              {wagonViewMode === "wagon" && (
                <>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2">Display</p>
                  <div className="flex flex-col gap-1">
                    {([
                      { label: "Runs Total", value: "runsTotal" },
                      { label: "Runs %", value: "runsPercentage" },
                      { label: "Shots Total", value: "shotTotal" },
                      { label: "Shots %", value: "shotPercentage" },
                      { label: "Dots Total", value: "dotsTotal" },
                      { label: "Dots %", value: "dotsPercentage" },
                      { label: "Boundaries Total", value: "boundaryTotal" },
                      { label: "Boundaries %", value: "boundaryPercentage" },
                    ] as { label: string; value: WagonMetric }[]).map((item) => (
                      <button key={item.value} onClick={() => setWagonDisplayType(item.value)}
                        className={cx("rounded-xl border px-2 py-1.5 text-left text-[11px] font-bold transition-colors",
                          wagonDisplayType === item.value ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" : "border-slate-800 bg-slate-900/50 text-slate-400"
                        )}>{item.label}</button>
                    ))}
                  </div>
                </>
              )}
              {wagonViewMode === "spider" && (
                <>
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 mb-2 mt-1">Filter</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 1, name: "1s", color: "bg-slate-400" },
                      { id: 2, name: "2s/3s", color: "bg-slate-400" },
                      { id: 3, name: "4s", color: "bg-cyan-400" },
                      { id: 4, name: "6s", color: "bg-purple-400" },
                    ].map((btn) => (
                      <button key={btn.id}
                        onClick={() => setWagonSelectedButtons((p) => p.includes(btn.id) ? p.filter((id) => id !== btn.id) : [...p, btn.id])}
                        className={cx("flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition-colors",
                          wagonSelectedButtons.includes(btn.id) ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300" : "border-slate-800 bg-slate-900/50 text-slate-400"
                        )}
                      >
                        <span className={cx("w-2.5 h-1 rounded-full inline-block", btn.color)} />
                        {btn.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      }
    >
      <div className="h-full rounded-xl bg-slate-950/30 overflow-hidden">
        <WagonSpiderCanvas rawRows={rawRows} battingStyle={battingStyle} viewMode={wagonViewMode} displayType={wagonDisplayType} selectedButtons={wagonSelectedButtons} />
      </div>
    </Card>
  );
}
