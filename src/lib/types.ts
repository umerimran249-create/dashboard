export type PlayerIndex = {
  name: string;
  country: string;
  batting_style: string;
  bowling_style: string;
  team: string;
  file: string;
  batting_runs: number;
  batting_avg: number;
  batting_sr: number;
  batting_innings: number;
  bowling_wickets: number;
  bowling_economy: number;
  bowling_avg: number;
  bowling_innings: number;
};

export type PhaseStats = { runs: number; balls: number; sr: number };
export type BowlingPhaseStats = { runs: number; balls: number; wickets: number; economy: number };

export type ZoneData = { runs: number; balls: number; dots: number; fours: number; sixes: number };

export type BattingStats = {
  innings: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dots: number;
  dot_pct: number;
  dismissals: number;
  not_outs: number;
  fifties: number;
  hundreds: number;
  average: number;
  strike_rate: number;
  best_score: string;
  phases: { pp: PhaseStats; mid: PhaseStats; death: PhaseStats };
  zones: Record<string, ZoneData>;
  line_stats: Record<string, { runs: number; balls: number; dots: number; wickets: number }>;
  length_stats: Record<string, { runs: number; balls: number; dots: number; wickets: number }>;
  shot_stats: Record<string, { runs: number; balls: number; dots: number }>;
  vs_pace: { runs: number; balls: number; dots: number; dismissals: number; fours: number; sixes: number };
  vs_spin: { runs: number; balls: number; dots: number; dismissals: number; fours: number; sixes: number };
  dismissal_kinds: Record<string, number>;
  by_tournament: Record<string, { runs: number; balls: number; innings: number }>;
  innings_scores: { runs: number; out: boolean }[];
};

export type BowlingStats = {
  innings: number;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  dots: number;
  dot_pct: number;
  economy: number;
  average: number;
  strike_rate: number;
  fours_conceded: number;
  sixes_conceded: number;
  wides: number;
  no_balls: number;
  phases: { pp: BowlingPhaseStats; mid: BowlingPhaseStats; death: BowlingPhaseStats };
  length_stats: Record<string, { runs: number; balls: number; wickets: number; dots: number }>;
  line_stats: Record<string, { runs: number; balls: number; wickets: number; dots: number }>;
  delivery_stats: Record<string, { runs: number; balls: number; wickets: number }>;
  vs_rhb: { runs: number; balls: number; wickets: number };
  vs_lhb: { runs: number; balls: number; wickets: number };
  dismissal_kinds: Record<string, number>;
  by_tournament: Record<string, { runs: number; balls: number; wickets: number; innings: number }>;
};

export type WagonRow = { Zone?: string | number; batsman_runs?: number; is_wicket?: number };

export type PlayerProfile = {
  name: string;
  country: string;
  batting_style: string;
  bowling_style: string;
  team: string;
  batting: BattingStats;
  bowling: BowlingStats;
  wagon_rows: WagonRow[];
  unorthodox?: Record<string, UnorthodoxShotEntry>;
};

export type TeamBowlerRow = {
  name: string;
  innings: number;
  overs: number;
  wickets: number;
  runs: number;
  economy: number;
  average: number;
  strike_rate: number;
  dot_pct: number;
};

export type TeamBatterRow = {
  name: string;
  innings: number;
  runs: number;
  balls: number;
  average: number;
  strike_rate: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  best_score: string;
  dot_pct: number;
};

export type TeamStats = Record<string, { batting: TeamBatterRow[]; bowling: TeamBowlerRow[] }>;

// ── Unorthodox shots ──────────────────────────────────────────────────────────

export type UnorthodoxShotEntry = {
  balls: number;
  runs: number;
  dots: number;
  fours: number;
  sixes: number;
  wickets: number;
  sr: number;
  dot_pct: number;
  boundary_pct: number;
  wicket_sr: number | null;
  connections: Record<string, number>;
  bowler_types: Record<string, number>;
  lines: Record<string, number>;
  lengths: Record<string, number>;
  zones: Record<string, number>;
  label?: string;
  color?: string;
  risk?: string;
  type?: string;
  top_players?: UnorthodoxPlayerRow[];
};

export type UnorthodoxPlayerRow = {
  name: string;
  file: string;
  balls: number;
  runs: number;
  sr: number;
  wickets: number;
  fours: number;
  sixes: number;
  dot_pct: number;
  boundary_pct: number;
};

export type UnorthodoxPlayerTotal = {
  name: string;
  file: string;
  total_balls: number;
  total_runs: number;
  total_wickets: number;
  total_sixes: number;
  overall_sr: number;
  shots: Record<string, { balls: number; runs: number; sr: number; wickets: number }>;
};

export type UnorthodoxData = {
  meta: Record<string, { label: string; color: string; risk: string; type: string }>;
  global: Record<string, UnorthodoxShotEntry>;
  players: UnorthodoxPlayerTotal[];
};

// ── Ball Boundary Analysis ─────────────────────────────────────────────────

export type BallCell = {
  balls: number;
  runs: number;
  wickets: number;
  fours: number;
  sixes: number;
  boundaries: number;
  dots: number;
  sr: number;
  avg: number | null;
  dot_pct: number;
  bnd_pct: number;
} | null;

export type BallPlayerRow = {
  name: string;
  team: string;
  batting_style: string;
  win: Record<string, BallCell>;
  all: Record<string, BallCell>;
  best_ball_win: string | null;
  best_bnd_win: number | null;
  total_win_balls: number;
  total_win_bdry: number;
};

export type HeatmapShotCell = {
  balls: number;
  runs: number;
  wickets: number;
  boundaries: number;
  dots: number;
  sr: number;
  avg: number | null;
  dot_pct: number;
  bnd_pct: number;
  score: number;
  color: "strong" | "normal" | "weak";
} | null;

export type HeatmapRow = {
  name: string;
  team: string;
  cells: Record<string, HeatmapShotCell>;
};

export type BallBoundaryData = {
  global: Record<string, { win: BallCell; all: BallCell }>;
  best_global_ball: string;
  best_global_bnd: number;
  ball_labels: string[];
  players: BallPlayerRow[];
  heatmap: {
    pace_shots: string[];
    spin_shots: string[];
    pace: HeatmapRow[];
    spin: HeatmapRow[];
  };
};
