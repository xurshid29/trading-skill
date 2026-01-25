// Enum types matching backend
export type PatternType = 'starting_uptrend' | 'consolidation' | 'downtrend_reversal' | 'unknown';
export type TierType = 'buy' | 'watch' | 'skip';
export type NewsStatusType = 'pending' | 'clean' | 'red_flag';
export type ScreeningStatus = 'running' | 'completed' | 'failed';
export type TradeStatus = 'planned' | 'active' | 'partial' | 'closed' | 'cancelled';
export type TradeAction = 'buy' | 'sell';

// Database entity types
export interface User {
  id: string;
  username: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Screening {
  id: string;
  user_id: string | null;
  name: string | null;
  price_min: number | null;
  price_max: number | null;
  filters: Record<string, unknown>;
  status: ScreeningStatus;
  total_results: number;
  created_at: string;
  completed_at: string | null;
}

// Recommendation structure for trade setups
export interface Recommendation {
  entry: { min: number; max: number };
  stopLoss: number;
  target1: number;
  target2?: number;
  riskReward: string;
  thesis: string;
  catalysts: string[];
  risks: string[];
  watchReason?: string; // Only for WATCH tier - why not BUY
  sector?: string;
  industry?: string;
  company?: string;
  marketCap?: number;
  pe?: number;
}

// Raw data structure
export interface ScreeningRawData {
  news?: string[];
  recommendation?: Recommendation;
  [key: string]: unknown;
}

export interface ScreeningResult {
  id: string;
  screening_id: string;
  ticker: string;
  price: number | null;
  change_pct: number | null;
  volume: number | null;
  avg_volume: number | null;
  market_cap: number | null;
  rsi: number | null;
  sma20_pct: number | null;
  sma50_pct: number | null;
  sma200_pct: number | null;
  high_52w_pct: number | null;
  low_52w_pct: number | null;
  beta: number | null;
  atr: number | null;
  inst_own_pct: number | null;
  inst_trans_pct: number | null;
  insider_own_pct: number | null;
  insider_trans_pct: number | null;
  short_float_pct: number | null;
  short_ratio: number | null;
  profit_margin_pct: number | null;
  pe_ratio: number | null;
  debt_equity: number | null;
  dividend_yield: number | null;
  pattern: PatternType;
  tier: TierType;
  news_status: NewsStatusType;
  news_notes: string | null;
  earnings_date: string | null;
  raw_data: ScreeningRawData | null;
  created_at: string;
}

export interface ScreeningWithResults extends Screening {
  results: ScreeningResult[];
}

export interface TradeSetup {
  id: string;
  user_id: string | null;
  screening_result_id: string | null;
  ticker: string;
  entry_price: number | null;
  stop_loss: number | null;
  target_1: number | null;
  target_2: number | null;
  risk_reward: number | null;
  position_size: number | null;
  daily_bias: string | null;
  order_block_low: number | null;
  order_block_high: number | null;
  fvg_low: number | null;
  fvg_high: number | null;
  liquidity_swept: boolean;
  choch_confirmed: boolean;
  status: TradeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// API request/response types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateScreeningRequest {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  filters?: Record<string, unknown>;
}

export interface UpdateResultRequest {
  tier?: TierType;
  newsStatus?: NewsStatusType;
  newsNotes?: string;
  rawData?: ScreeningRawData;
}

export interface DashboardStats {
  totalScreenings: number;
  recentScreenings: number;
  tierCounts: {
    buy: number;
    watch: number;
    skip: number;
  };
}
