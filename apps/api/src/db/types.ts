import type { Generated, ColumnType } from 'kysely';

// Enum types matching PostgreSQL
export type PatternType = 'starting_uptrend' | 'consolidation' | 'downtrend_reversal' | 'unknown';
export type TierType = 'buy' | 'watch' | 'skip';
export type NewsStatusType = 'pending' | 'clean' | 'red_flag';
export type ScreeningStatus = 'running' | 'completed' | 'failed';
export type TradeStatus = 'planned' | 'active' | 'partial' | 'closed' | 'cancelled';
export type TradeAction = 'buy' | 'sell';

// Table interfaces
export interface UsersTable {
  id: Generated<string>;
  username: string;
  password: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  active: Generated<boolean>;
}

export interface ScreeningsTable {
  id: Generated<string>;
  user_id: string | null;
  name: string | null;
  price_min: number | null;
  price_max: number | null;
  filters: Record<string, unknown>;
  status: Generated<ScreeningStatus>;
  total_results: Generated<number>;
  created_at: Generated<Date>;
  completed_at: Date | null;
}

export interface ScreeningResultsTable {
  id: Generated<string>;
  screening_id: string;
  ticker: string;

  // Price & Volume
  price: number | null;
  change_pct: number | null;
  volume: number | null;
  avg_volume: number | null;
  market_cap: number | null;

  // Technical indicators
  rsi: number | null;
  sma20_pct: number | null;
  sma50_pct: number | null;
  sma200_pct: number | null;
  high_52w_pct: number | null;
  low_52w_pct: number | null;
  beta: number | null;
  atr: number | null;

  // Ownership
  inst_own_pct: number | null;
  inst_trans_pct: number | null;
  insider_own_pct: number | null;
  insider_trans_pct: number | null;

  // Short interest
  short_float_pct: number | null;
  short_ratio: number | null;

  // Fundamentals
  profit_margin_pct: number | null;
  pe_ratio: number | null;
  debt_equity: number | null;
  dividend_yield: number | null;

  // Classification
  pattern: Generated<PatternType>;
  tier: Generated<TierType>;

  // News check
  news_status: Generated<NewsStatusType>;
  news_notes: string | null;
  earnings_date: Date | null;

  // Raw data
  raw_data: Record<string, unknown> | null;

  created_at: Generated<Date>;
}

export interface TradeSetupsTable {
  id: Generated<string>;
  user_id: string | null;
  screening_result_id: string | null;
  ticker: string;

  // Entry plan
  entry_price: number | null;
  stop_loss: number | null;
  target_1: number | null;
  target_2: number | null;
  risk_reward: number | null;
  position_size: number | null;

  // SMC analysis
  daily_bias: string | null;
  order_block_low: number | null;
  order_block_high: number | null;
  fvg_low: number | null;
  fvg_high: number | null;
  liquidity_swept: Generated<boolean>;
  choch_confirmed: Generated<boolean>;

  // Status
  status: Generated<TradeStatus>;
  notes: string | null;

  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface TradeExecutionsTable {
  id: Generated<string>;
  trade_setup_id: string;
  action: TradeAction;
  quantity: number;
  price: number;
  fees: Generated<number>;
  executed_at: Date;
  notes: string | null;
  created_at: Generated<Date>;
}

// Database interface
export interface Database {
  users: UsersTable;
  screenings: ScreeningsTable;
  screening_results: ScreeningResultsTable;
  trade_setups: TradeSetupsTable;
  trade_executions: TradeExecutionsTable;
}
