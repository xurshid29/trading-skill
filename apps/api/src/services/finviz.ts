const FINVIZ_BASE_URL = 'https://elite.finviz.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

const RATE_LIMITS = {
  NEWS_REQUEST_DELAY_MS: 1000,
  NEWS_BATCH_DELAY_MS: 3000,
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY_MS: 2000,
};

function getToken(): string {
  const token = process.env.FINVIZ_API_TOKEN;
  if (!token) {
    throw new Error('FINVIZ_API_TOKEN environment variable is not set');
  }
  return token;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TechnicalData {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  country: string;
  marketCap: number | null;
  pe: number | null;
  price: number | null;
  change: number | null;
  volume: number | null;
  rsi: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  high52w: number | null;
  low52w: number | null;
  beta: number | null;
  atr: number | null;
  avgVolume: number | null;
}

export interface OwnershipData {
  ticker: string;
  instOwn: number | null;
  instTrans: number | null;
  insiderOwn: number | null;
  insiderTrans: number | null;
  shortFloat: number | null;
  shortRatio: number | null;
  profitMargin: number | null;
  debtEquity: number | null;
  dividendYield: number | null;
}

export interface NewsItem {
  date: string;
  time: string;
  headline: string;
  source: string;
  url: string;
}

function parseNumber(value: string | undefined): number | null {
  if (!value || value === '-' || value === '') return null;
  // Remove % sign and commas
  const cleaned = value.replace(/%/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseMarketCap(value: string | undefined): number | null {
  if (!value || value === '-' || value === '') return null;
  const cleaned = value.trim();
  const multipliers: Record<string, number> = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    T: 1e12,
  };
  const match = cleaned.match(/^([\d.]+)([KMBT])?$/i);
  if (!match) return parseNumber(cleaned);
  const num = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();
  return suffix ? num * (multipliers[suffix] || 1) : num;
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function fetchWithRetry(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= RATE_LIMITS.MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
        console.warn(`Rate limited, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, lastError.message);
      if (attempt < RATE_LIMITS.MAX_RETRIES) {
        await sleep(RATE_LIMITS.RETRY_BASE_DELAY_MS * attempt);
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

export const finvizService = {
  async fetchTechnicalScreen(filters: string): Promise<TechnicalData[]> {
    const url = `${FINVIZ_BASE_URL}/export.ashx?v=171&f=${filters}&auth=${getToken()}`;
    console.log(`Fetching technical data with filters: ${filters}`);

    const csv = await fetchWithRetry(url);
    const rows = parseCsv(csv);

    return rows.map((row) => ({
      ticker: row['Ticker'] || '',
      company: row['Company'] || '',
      sector: row['Sector'] || '',
      industry: row['Industry'] || '',
      country: row['Country'] || '',
      marketCap: parseMarketCap(row['Market Cap']),
      pe: parseNumber(row['P/E']),
      price: parseNumber(row['Price']),
      change: parseNumber(row['Change']),
      volume: parseNumber(row['Volume']),
      rsi: parseNumber(row['RSI']),
      sma20: parseNumber(row['SMA20']),
      sma50: parseNumber(row['SMA50']),
      sma200: parseNumber(row['SMA200']),
      high52w: parseNumber(row['52W High']),
      low52w: parseNumber(row['52W Low']),
      beta: parseNumber(row['Beta']),
      atr: parseNumber(row['ATR']),
      avgVolume: parseNumber(row['Avg Volume']),
    }));
  },

  async fetchOwnershipData(tickers: string[]): Promise<OwnershipData[]> {
    if (tickers.length === 0) return [];

    const tickerList = tickers.join(',');
    const url = `${FINVIZ_BASE_URL}/export.ashx?v=131&t=${tickerList}&auth=${getToken()}`;
    console.log(`Fetching ownership data for ${tickers.length} tickers`);

    const csv = await fetchWithRetry(url);
    const rows = parseCsv(csv);

    return rows.map((row) => ({
      ticker: row['Ticker'] || '',
      instOwn: parseNumber(row['Inst Own']),
      instTrans: parseNumber(row['Inst Trans']),
      insiderOwn: parseNumber(row['Insider Own']),
      insiderTrans: parseNumber(row['Insider Trans']),
      shortFloat: parseNumber(row['Short Float']),
      shortRatio: parseNumber(row['Short Ratio']),
      profitMargin: parseNumber(row['Profit Margin']),
      debtEquity: parseNumber(row['Debt/Eq']),
      dividendYield: parseNumber(row['Dividend']),
    }));
  },

  async fetchNews(ticker: string): Promise<NewsItem[]> {
    const url = `${FINVIZ_BASE_URL}/news_export.ashx?v=3&t=${ticker}&auth=${getToken()}`;

    try {
      const csv = await fetchWithRetry(url);
      const rows = parseCsv(csv);

      return rows.slice(0, 10).map((row) => ({
        date: row['Date'] || '',
        time: row['Time'] || '',
        headline: row['Title'] || row['Headline'] || '',
        source: row['Source'] || '',
        url: row['Link'] || row['URL'] || '',
      }));
    } catch (error) {
      console.warn(`Failed to fetch news for ${ticker}:`, error);
      return [];
    }
  },

  buildFilterString(options: { priceMin?: number; priceMax?: number }): string {
    const filters: string[] = [];

    // Price range
    if (options.priceMin) {
      filters.push(`sh_price_o${options.priceMin}`);
    }
    if (options.priceMax) {
      filters.push(`sh_price_u${options.priceMax}`);
    }

    // Default quality filters from strategy
    filters.push(
      'sh_instown_o50',      // Institutional ownership > 50%
      'sh_avgvol_o500',      // Average volume > 500K
      'ta_beta_u2',          // Beta < 2.0
      'sh_short_u15',        // Short float < 15%
      'fa_netmargin_pos',    // Positive profit margin
      'fa_pe_u50',           // P/E < 50
      'fa_debteq_u2'         // Debt/Equity < 2
    );

    return filters.join(',');
  },

  RATE_LIMITS,
  sleep,
};
