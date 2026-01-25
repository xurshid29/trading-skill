import { finvizService, type TechnicalData, type OwnershipData } from './finviz.js';
import { classifierService } from './classifier.js';
import { screeningService, type ScreeningResultInput } from './screening.js';

export interface ScreeningOptions {
  screeningId: string;
  priceMin?: number;
  priceMax?: number;
}

interface CombinedStockData {
  technical: TechnicalData;
  ownership?: OwnershipData;
}

const { sleep, RATE_LIMITS } = finvizService;

export const screeningRunner = {
  /**
   * Run the full screening process
   */
  async run(options: ScreeningOptions): Promise<void> {
    const { screeningId, priceMin = 20, priceMax = 50 } = options;
    console.log(`Starting screening ${screeningId} (price: $${priceMin}-$${priceMax})`);

    try {
      // Step 1: Fetch technical data
      console.log('Step 1: Fetching technical data...');
      const filters = finvizService.buildFilterString({ priceMin, priceMax });
      const technicalData = await finvizService.fetchTechnicalScreen(filters);
      console.log(`Found ${technicalData.length} initial candidates`);

      if (technicalData.length === 0) {
        console.log('No candidates found, completing screening');
        await screeningService.complete(screeningId, 0);
        return;
      }

      // Step 2: Classify patterns and filter to known patterns
      console.log('Step 2: Classifying patterns...');
      const classifiedStocks = technicalData
        .map((stock) => ({
          stock,
          pattern: classifierService.classifyPattern({
            rsi: stock.rsi,
            sma20Pct: stock.sma20,
            sma50Pct: stock.sma50,
            beta: null,
            shortRatio: null,
            shortFloatPct: null,
            insiderTransPct: null,
          }),
        }))
        .filter((item) => item.pattern !== 'unknown');

      console.log(`${classifiedStocks.length} stocks match known patterns`);

      // Select top candidates per pattern (max 6 each)
      const selectedByPattern = this.selectByPattern(classifiedStocks);
      const selectedTickers = selectedByPattern.map((s) => s.stock.ticker);
      console.log(`Selected ${selectedTickers.length} candidates for ownership analysis`);

      if (selectedTickers.length === 0) {
        console.log('No pattern matches, completing screening');
        await screeningService.complete(screeningId, 0);
        return;
      }

      // Step 3: Fetch ownership data
      console.log('Step 3: Fetching ownership data...');
      const ownershipData = await finvizService.fetchOwnershipData(selectedTickers);
      const ownershipMap = new Map(ownershipData.map((o) => [o.ticker, o]));

      // Combine data
      const combinedData: CombinedStockData[] = selectedByPattern.map((item) => ({
        technical: item.stock,
        ownership: ownershipMap.get(item.stock.ticker),
      }));

      // Step 4: Classify tiers
      console.log('Step 4: Classifying tiers...');
      const tieredStocks = combinedData.map((item) => {
        const ownership = item.ownership;
        const tier = classifierService.classifyTier({
          rsi: item.technical.rsi,
          sma20Pct: item.technical.sma20,
          sma50Pct: item.technical.sma50,
          beta: item.technical.beta,
          shortRatio: ownership?.shortRatio ?? null,
          shortFloatPct: ownership?.shortFloat ?? null,
          insiderTransPct: ownership?.insiderTrans ?? null,
        });
        return { ...item, tier };
      });

      // Step 5: Check news (rate limited)
      console.log('Step 5: Checking news (rate limited)...');
      const newsResults = await this.checkNewsBatched(
        tieredStocks.map((s) => s.technical.ticker)
      );

      // Step 6: Build final results
      console.log('Step 6: Building final results...');
      const results: ScreeningResultInput[] = tieredStocks.map((item) => {
        const news = newsResults.get(item.technical.ticker);
        const pattern = classifierService.classifyPattern({
          rsi: item.technical.rsi,
          sma20Pct: item.technical.sma20,
          sma50Pct: item.technical.sma50,
          beta: item.technical.beta,
          shortRatio: item.ownership?.shortRatio ?? null,
          shortFloatPct: item.ownership?.shortFloat ?? null,
          insiderTransPct: item.ownership?.insiderTrans ?? null,
        });

        // Downgrade tier if news has red flags
        let finalTier = item.tier;
        if (news?.status === 'red_flag' && finalTier !== 'skip') {
          finalTier = 'skip';
        }

        return {
          screeningId,
          ticker: item.technical.ticker,
          price: item.technical.price ?? undefined,
          changePct: item.technical.change ?? undefined,
          volume: item.technical.volume ?? undefined,
          avgVolume: item.technical.avgVolume ?? undefined,
          marketCap: item.technical.marketCap ?? undefined,
          rsi: item.technical.rsi ?? undefined,
          sma20Pct: item.technical.sma20 ?? undefined,
          sma50Pct: item.technical.sma50 ?? undefined,
          sma200Pct: item.technical.sma200 ?? undefined,
          high52wPct: item.technical.high52w ?? undefined,
          low52wPct: item.technical.low52w ?? undefined,
          beta: item.technical.beta ?? undefined,
          atr: item.technical.atr ?? undefined,
          instOwnPct: item.ownership?.instOwn ?? undefined,
          instTransPct: item.ownership?.instTrans ?? undefined,
          insiderOwnPct: item.ownership?.insiderOwn ?? undefined,
          insiderTransPct: item.ownership?.insiderTrans ?? undefined,
          shortFloatPct: item.ownership?.shortFloat ?? undefined,
          shortRatio: item.ownership?.shortRatio ?? undefined,
          profitMarginPct: item.ownership?.profitMargin ?? undefined,
          peRatio: item.technical.pe ?? undefined,
          debtEquity: item.ownership?.debtEquity ?? undefined,
          dividendYield: item.ownership?.dividendYield ?? undefined,
          pattern,
          tier: finalTier,
          newsStatus: news?.status ?? 'pending',
          newsNotes: news?.notes ?? undefined,
          earningsDate: news?.earningsDate ?? undefined,
        };
      });

      // Step 7: Store results and complete
      console.log(`Step 7: Storing ${results.length} results...`);
      await screeningService.addResults(results);
      await screeningService.complete(screeningId, results.length);

      console.log(`Screening ${screeningId} completed with ${results.length} results`);
    } catch (error) {
      console.error(`Screening ${screeningId} failed:`, error);
      await screeningService.fail(screeningId);
      throw error;
    }
  },

  /**
   * Select top candidates by pattern (max 6 per pattern)
   */
  selectByPattern(
    stocks: Array<{ stock: TechnicalData; pattern: string }>
  ): Array<{ stock: TechnicalData; pattern: string }> {
    const byPattern: Record<string, typeof stocks> = {};

    for (const item of stocks) {
      if (!byPattern[item.pattern]) {
        byPattern[item.pattern] = [];
      }
      byPattern[item.pattern].push(item);
    }

    const selected: typeof stocks = [];

    for (const [pattern, items] of Object.entries(byPattern)) {
      // Sort by RSI (prefer middle range) and take top 6
      const sorted = items.sort((a, b) => {
        const aScore = Math.abs((a.stock.rsi ?? 50) - 55);
        const bScore = Math.abs((b.stock.rsi ?? 50) - 55);
        return aScore - bScore;
      });
      selected.push(...sorted.slice(0, 6));
      console.log(`Pattern ${pattern}: ${Math.min(items.length, 6)} selected`);
    }

    return selected;
  },

  /**
   * Check news for multiple tickers with rate limiting
   */
  async checkNewsBatched(
    tickers: string[],
    batchSize = 5,
    delayMs = RATE_LIMITS.NEWS_BATCH_DELAY_MS
  ): Promise<Map<string, { status: 'pending' | 'clean' | 'red_flag'; notes: string | null; earningsDate: Date | null }>> {
    const results = new Map<string, { status: 'pending' | 'clean' | 'red_flag'; notes: string | null; earningsDate: Date | null }>();

    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      console.log(`Checking news batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`);

      for (const ticker of batch) {
        try {
          const news = await finvizService.fetchNews(ticker);
          const classification = classifierService.classifyNews(news, ticker);
          results.set(ticker, classification);
        } catch (error) {
          console.warn(`News check failed for ${ticker}:`, error);
          results.set(ticker, { status: 'pending', notes: 'News check failed', earningsDate: null });
        }

        // Delay between requests within batch
        await sleep(RATE_LIMITS.NEWS_REQUEST_DELAY_MS);
      }

      // Delay between batches
      if (i + batchSize < tickers.length) {
        console.log(`Waiting ${delayMs}ms before next batch...`);
        await sleep(delayMs);
      }
    }

    return results;
  },
};
