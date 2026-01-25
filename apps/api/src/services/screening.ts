import {getDb, type NewsStatusType, type PatternType, type TierType} from '../db';

export interface CreateScreeningInput {
  userId?: string;
  name?: string;
  priceMin?: number;
  priceMax?: number;
  filters?: Record<string, unknown>;
}

export interface ScreeningResultInput {
  screeningId: string;
  ticker: string;
  price?: number;
  changePct?: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  rsi?: number;
  sma20Pct?: number;
  sma50Pct?: number;
  sma200Pct?: number;
  high52wPct?: number;
  low52wPct?: number;
  beta?: number;
  atr?: number;
  instOwnPct?: number;
  instTransPct?: number;
  insiderOwnPct?: number;
  insiderTransPct?: number;
  shortFloatPct?: number;
  shortRatio?: number;
  profitMarginPct?: number;
  peRatio?: number;
  debtEquity?: number;
  dividendYield?: number;
  pattern?: PatternType;
  tier?: TierType;
  newsStatus?: NewsStatusType;
  newsNotes?: string;
  earningsDate?: Date;
  rawData?: Record<string, unknown>;
}

export const screeningService = {
  // Create a new screening session
  async create(input: CreateScreeningInput) {
      return getDb()
        .insertInto('screenings')
        .values({
            user_id: input.userId ?? null,
            name: input.name ?? null,
            price_min: input.priceMin ?? null,
            price_max: input.priceMax ?? null,
            filters: input.filters ?? {},
            status: 'running',
        })
        .returning(['id', 'created_at'])
        .executeTakeFirstOrThrow();
  },

  // Mark screening as completed
  async complete(id: string, totalResults: number) {
    await getDb()
      .updateTable('screenings')
      .set({
        status: 'completed',
        total_results: totalResults,
        completed_at: new Date(),
      })
      .where('id', '=', id)
      .execute();
  },

  // Mark screening as failed
  async fail(id: string) {
    await getDb()
      .updateTable('screenings')
      .set({ status: 'failed' })
      .where('id', '=', id)
      .execute();
  },

  // Add a result to a screening
  async addResult(input: ScreeningResultInput) {
      return getDb()
        .insertInto('screening_results')
        .values({
            screening_id: input.screeningId,
            ticker: input.ticker,
            price: input.price ?? null,
            change_pct: input.changePct ?? null,
            volume: input.volume ?? null,
            avg_volume: input.avgVolume ?? null,
            market_cap: input.marketCap ?? null,
            rsi: input.rsi ?? null,
            sma20_pct: input.sma20Pct ?? null,
            sma50_pct: input.sma50Pct ?? null,
            sma200_pct: input.sma200Pct ?? null,
            high_52w_pct: input.high52wPct ?? null,
            low_52w_pct: input.low52wPct ?? null,
            beta: input.beta ?? null,
            atr: input.atr ?? null,
            inst_own_pct: input.instOwnPct ?? null,
            inst_trans_pct: input.instTransPct ?? null,
            insider_own_pct: input.insiderOwnPct ?? null,
            insider_trans_pct: input.insiderTransPct ?? null,
            short_float_pct: input.shortFloatPct ?? null,
            short_ratio: input.shortRatio ?? null,
            profit_margin_pct: input.profitMarginPct ?? null,
            pe_ratio: input.peRatio ?? null,
            debt_equity: input.debtEquity ?? null,
            dividend_yield: input.dividendYield ?? null,
            pattern: input.pattern ?? 'unknown',
            tier: input.tier ?? 'watch',
            news_status: input.newsStatus ?? 'pending',
            news_notes: input.newsNotes ?? null,
            earnings_date: input.earningsDate ?? null,
            raw_data: input.rawData ?? null,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();
  },

  // Add multiple results at once
  async addResults(results: ScreeningResultInput[]) {
    if (results.length === 0) return [];

    const values = results.map((input) => ({
      screening_id: input.screeningId,
      ticker: input.ticker,
      price: input.price ?? null,
      change_pct: input.changePct ?? null,
      volume: input.volume ?? null,
      avg_volume: input.avgVolume ?? null,
      market_cap: input.marketCap ?? null,
      rsi: input.rsi ?? null,
      sma20_pct: input.sma20Pct ?? null,
      sma50_pct: input.sma50Pct ?? null,
      sma200_pct: input.sma200Pct ?? null,
      high_52w_pct: input.high52wPct ?? null,
      low_52w_pct: input.low52wPct ?? null,
      beta: input.beta ?? null,
      atr: input.atr ?? null,
      inst_own_pct: input.instOwnPct ?? null,
      inst_trans_pct: input.instTransPct ?? null,
      insider_own_pct: input.insiderOwnPct ?? null,
      insider_trans_pct: input.insiderTransPct ?? null,
      short_float_pct: input.shortFloatPct ?? null,
      short_ratio: input.shortRatio ?? null,
      profit_margin_pct: input.profitMarginPct ?? null,
      pe_ratio: input.peRatio ?? null,
      debt_equity: input.debtEquity ?? null,
      dividend_yield: input.dividendYield ?? null,
      pattern: input.pattern ?? 'unknown',
      tier: input.tier ?? 'watch',
      news_status: input.newsStatus ?? 'pending',
      news_notes: input.newsNotes ?? null,
      earnings_date: input.earningsDate ?? null,
      raw_data: input.rawData ?? null,
    }));

    return getDb()
        .insertInto('screening_results')
        .values(values)
        .returning(['id', 'ticker'])
        .execute();
  },

  // Get all screenings (paginated)
  async list(limit = 20, offset = 0) {
      return getDb()
        .selectFrom('screenings')
        .selectAll()
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .execute();
  },

  // Get a single screening with its results
  async getById(id: string) {
    const screening = await getDb()
      .selectFrom('screenings')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!screening) return null;

    const results = await getDb()
      .selectFrom('screening_results')
      .selectAll()
      .where('screening_id', '=', id)
      .orderBy('tier', 'asc') // buy first, then watch, then skip
      .orderBy('pattern', 'asc')
      .execute();

    return { ...screening, results };
  },

  // Get results filtered by tier or pattern
  async getResultsByFilter(screeningId: string, filters: { tier?: TierType; pattern?: PatternType }) {
    let query = getDb()
      .selectFrom('screening_results')
      .selectAll()
      .where('screening_id', '=', screeningId);

    if (filters.tier) {
      query = query.where('tier', '=', filters.tier);
    }
    if (filters.pattern) {
      query = query.where('pattern', '=', filters.pattern);
    }

    return query.execute();
  },

  // Update a result's tier, news status, or raw data
  async updateResult(
    id: string,
    updates: {
      tier?: TierType;
      newsStatus?: NewsStatusType;
      newsNotes?: string;
      rawData?: Record<string, unknown>;
    }
  ) {
    const setValues: Record<string, unknown> = {};
    if (updates.tier !== undefined) setValues.tier = updates.tier;
    if (updates.newsStatus !== undefined) setValues.news_status = updates.newsStatus;
    if (updates.newsNotes !== undefined) setValues.news_notes = updates.newsNotes;
    if (updates.rawData !== undefined) setValues.raw_data = updates.rawData;

    if (Object.keys(setValues).length === 0) return;

    await getDb()
      .updateTable('screening_results')
      .set(setValues)
      .where('id', '=', id)
      .execute();
  },

  // Delete a screening and all its results
  async delete(id: string) {
    await getDb().deleteFrom('screenings').where('id', '=', id).execute();
  },

  // Get results by ticker (latest first)
  async getResultsByTicker(ticker: string) {
    return getDb()
      .selectFrom('screening_results')
      .selectAll()
      .where('ticker', '=', ticker.toUpperCase())
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();
  },
};
