import type { PatternType, TierType, NewsStatusType } from '../db/types.js';
import type { NewsItem } from './finviz.js';

export interface ClassificationInput {
  rsi: number | null;
  sma20Pct: number | null;
  sma50Pct: number | null;
  beta: number | null;
  shortRatio: number | null;
  shortFloatPct: number | null;
  insiderTransPct: number | null;
}

export interface NewsClassificationResult {
  status: NewsStatusType;
  notes: string | null;
  earningsDate: Date | null;
}

// Red flag keywords for news analysis
const RED_FLAG_KEYWORDS = [
  // Analyst actions
  'downgrade', 'downgraded', 'cut to', 'lowered', 'reduces',
  // Legal/regulatory
  'sec ', 'investigation', 'lawsuit', 'class action', 'fraud', 'settlement',
  // Management
  'ceo resign', 'cfo resign', 'ceo depart', 'cfo depart', 'management change',
  'executive leave', 'steps down',
  // Business concerns
  'recall', 'warning', 'guidance cut', 'lowered outlook', 'miss',
  'bankruptcy', 'default', 'restructuring',
];

// Keywords that suggest earnings proximity
const EARNINGS_KEYWORDS = [
  'earnings', 'quarterly results', 'q1', 'q2', 'q3', 'q4',
  'reports', 'conference call', 'guidance',
];

function inRange(value: number | null, min: number, max: number): boolean {
  if (value === null) return false;
  return value >= min && value <= max;
}

export const classifierService = {
  /**
   * Classify stock pattern based on technical indicators
   *
   * Patterns:
   * - starting_uptrend: RSI 50-65, SMA20 +1% to +10%, SMA50 -3% to +5%
   * - consolidation: RSI 45-55, SMA20 ±3%, SMA50 ±3%
   * - downtrend_reversal: RSI 35-50, SMA20 -10% to -1%
   */
  classifyPattern(input: ClassificationInput): PatternType {
    const { rsi, sma20Pct, sma50Pct } = input;

    // Starting Uptrend: RSI 50-65, SMA20 +1% to +10%, SMA50 -3% to +5%
    if (
      inRange(rsi, 50, 65) &&
      inRange(sma20Pct, 1, 10) &&
      inRange(sma50Pct, -3, 5)
    ) {
      return 'starting_uptrend';
    }

    // Consolidation: RSI 45-55, SMA20 ±3%, SMA50 ±3%
    if (
      inRange(rsi, 45, 55) &&
      inRange(sma20Pct, -3, 3) &&
      inRange(sma50Pct, -3, 3)
    ) {
      return 'consolidation';
    }

    // Downtrend Reversal: RSI 35-50, SMA20 -10% to -1%
    if (
      inRange(rsi, 35, 50) &&
      inRange(sma20Pct, -10, -1)
    ) {
      return 'downtrend_reversal';
    }

    return 'unknown';
  },

  /**
   * Classify tier based on ownership and risk metrics
   *
   * Tiers:
   * - buy: Beta < 1.5, Short Ratio < 5, Insider Trans >= 0%
   * - watch: Beta < 2.0, Short Ratio < 7, Insider Trans >= -5%
   * - skip: Fails above criteria
   */
  classifyTier(input: ClassificationInput): TierType {
    const { beta, shortRatio, insiderTransPct } = input;

    // BUY tier: Strict criteria
    const isBuyBeta = beta !== null && beta < 1.5;
    const isBuyShortRatio = shortRatio !== null && shortRatio < 5;
    const isBuyInsiderTrans = insiderTransPct === null || insiderTransPct >= 0;

    if (isBuyBeta && isBuyShortRatio && isBuyInsiderTrans) {
      return 'buy';
    }

    // WATCH tier: Relaxed criteria
    const isWatchBeta = beta === null || beta < 2.0;
    const isWatchShortRatio = shortRatio === null || shortRatio < 7;
    const isWatchInsiderTrans = insiderTransPct === null || insiderTransPct >= -5;

    if (isWatchBeta && isWatchShortRatio && isWatchInsiderTrans) {
      return 'watch';
    }

    return 'skip';
  },

  /**
   * Analyze news headlines for red flags
   */
  classifyNews(headlines: NewsItem[], ticker: string): NewsClassificationResult {
    if (headlines.length === 0) {
      return { status: 'pending', notes: 'No news available', earningsDate: null };
    }

    const redFlags: string[] = [];
    let earningsDate: Date | null = null;

    for (const item of headlines) {
      const headline = item.headline.toLowerCase();

      // Check for red flag keywords
      for (const keyword of RED_FLAG_KEYWORDS) {
        if (headline.includes(keyword)) {
          redFlags.push(`"${item.headline}" (${item.source})`);
          break;
        }
      }

      // Check for earnings proximity
      for (const keyword of EARNINGS_KEYWORDS) {
        if (headline.includes(keyword)) {
          // Try to extract date from headline or use news date
          const newsDate = this.parseNewsDate(item.date);
          if (newsDate && this.isWithinDays(newsDate, 5)) {
            redFlags.push(`Earnings proximity: "${item.headline}"`);
            earningsDate = newsDate;
          }
          break;
        }
      }
    }

    if (redFlags.length > 0) {
      return {
        status: 'red_flag',
        notes: redFlags.slice(0, 3).join('; '), // Limit to 3 flags
        earningsDate,
      };
    }

    return { status: 'clean', notes: null, earningsDate };
  },

  /**
   * Parse date from news item
   */
  parseNewsDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Handle "Today" or relative dates
    if (dateStr.toLowerCase() === 'today') {
      return new Date();
    }

    // Try parsing as date
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  },

  /**
   * Check if date is within N days from now
   */
  isWithinDays(date: Date, days: number): boolean {
    const now = new Date();
    const diff = Math.abs(date.getTime() - now.getTime());
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff <= days;
  },
};
