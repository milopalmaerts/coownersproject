export type TradeDirection = "long" | "short";
export type TradeOutcome = "win" | "loss" | "breakeven";
export type RuleFollowed = "yes" | "partially" | "no";

export interface PartialExit {
  price: number | null;
  pctClosed: number | null; // 0-100
  r: number | null;
}

export interface JournalTrade {
  id: string;
  user_id: string;
  trade_date: string; // ISO date
  asset: string;
  direction: TradeDirection;
  setup: string | null;
  strategy: string | null;
  timeframe: string | null;
  session: string | null;
  entry_price: number | null;
  stop_loss: number | null;
  tp1: number | null;
  tp2: number | null;
  tp3: number | null;
  risk_amount: number | null;
  risk_pct: number | null;
  position_size: number | null;
  tp1_pct_closed: number | null;
  tp1_r: number | null;
  tp2_pct_closed: number | null;
  tp2_r: number | null;
  tp3_pct_closed: number | null;
  tp3_r: number | null;
  final_exit_price: number | null;
  final_exit_r: number | null;
  remaining_pct: number | null;
  result_r: number; // authoritative — manually overridable
  result_amount: number | null;
  outcome: TradeOutcome; // DB-generated from result_r
  screenshot_before_url: string | null;
  screenshot_after_url: string | null;
  entry_reason: string | null;
  exit_reason: string | null;
  mistakes: string | null;
  emotion_before: string | null;
  emotion_during: string | null;
  emotion_after: string | null;
  confidence: number | null; // 1-10
  fear: number | null; // 1-10
  fomo: boolean;
  revenge_trading: boolean;
  overtrading: boolean;
  patience: number | null; // 1-10
  discipline: number | null; // 1-10
  rule_followed: RuleFollowed | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalDailyReview {
  id: string;
  user_id: string;
  review_date: string;
  starting_balance: number | null;
  ending_balance: number | null;
  what_went_well: string | null;
  what_went_wrong: string | null;
  followed_plan: RuleFollowed | null;
  main_emotion: string | null;
  lesson_learned: string | null;
  improvement_tomorrow: string | null;
  created_at: string;
}
