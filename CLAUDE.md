# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A stock market analysis and trading tool with:
- **Finviz Elite API** integration for screening, quotes, news, SEC filings
- **PostgreSQL database** to store screening results and trade setups
- **Express API** backend (TypeScript + Kysely + JWT auth)
- **React frontend** (TypeScript + Vite + Ant Design)

**Requirements:** Node.js 25+, Docker (for PostgreSQL)

## Project Structure

```
trading/
├── apps/
│   ├── api/                    # Express + TypeScript backend (port 3001)
│   │   └── src/
│   │       ├── db/             # Database connection (Kysely) & types
│   │       ├── middleware/     # Auth middleware (JWT)
│   │       ├── routes/         # API route handlers
│   │       ├── services/       # Business logic (screening, auth, finviz, classifier)
│   │       └── index.ts        # Entry point
│   └── web/                    # React + TypeScript frontend (port 5173)
│       └── src/
│           ├── api/            # API client & types
│           ├── components/     # Reusable UI components
│           ├── context/        # React contexts (Auth)
│           ├── hooks/          # Custom hooks (useScreenings, etc.)
│           ├── pages/          # Page components
│           ├── routes/         # Router configuration
│           └── theme/          # Ant Design theme config
├── db/
│   └── migrations/             # SQL migrations (dbmate)
├── docs/
│   └── finviz-api.md           # Finviz API documentation
├── strategies/                 # Trading strategy templates
│   ├── swing-trade-screener.md # Includes database integration
│   ├── single-stock-analysis.md
│   └── smc-single-stock-analysis.md
├── docker-compose.yml          # PostgreSQL database
├── package.json                # npm workspaces root
├── .nvmrc                      # Node.js version (25)
└── .env                        # Environment variables (not in git)
```

## Development Commands

```bash
# Database
docker compose up -d          # Start PostgreSQL (port 5438)
docker compose down           # Stop PostgreSQL
dbmate up                     # Run migrations
dbmate down                   # Rollback migrations
dbmate status                 # Check migration status

# Development
npm run dev:api               # Start API server (http://localhost:3001)
npm run dev:web               # Start React dev server (http://localhost:5173)
npm run dev                   # Start both (parallel)
```

## Environment Variables

Required in `.env` (copy from `.env.example`):

```bash
DATABASE_URL=postgres://app:app@localhost:5438/app?sslmode=disable
FINVIZ_API_TOKEN=your-token-here
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Database Schema

**Tables:**
- `users` - User accounts
- `screenings` - Screening sessions (filters, price range, status)
- `screening_results` - Individual stock results with all metrics
- `trade_setups` - Planned trades with SMC analysis data
- `trade_executions` - Actual trade fills

**Key fields in `screening_results`:**
- Price & volume: price, change_pct, volume, avg_volume, market_cap
- Technical: rsi, sma20/50/200_pct, high/low_52w_pct, beta, atr
- Ownership: inst_own_pct, inst_trans_pct, insider_own_pct, insider_trans_pct
- Short interest: short_float_pct, short_ratio
- Fundamentals: profit_margin_pct, pe_ratio, debt_equity, dividend_yield
- Classification: pattern (enum), tier (enum), news_status (enum)
- News: news_notes (summary text), raw_data (JSON with news headlines and recommendations)

**Recommendation Structure in `raw_data`:**
```json
{
  "news": ["headline1", "headline2", ...],
  "recommendation": {
    "entry": { "min": 35.00, "max": 35.90 },
    "stopLoss": 33.90,
    "target1": 38.50,
    "target2": 41.00,
    "riskReward": "2.1:1",
    "thesis": "Investment thesis text...",
    "catalysts": ["Catalyst 1", "Catalyst 2"],
    "risks": ["Risk 1", "Risk 2"],
    "watchReason": "Why WATCH not BUY (only for WATCH tier)",
    "sector": "Utilities",
    "industry": "Renewable",
    "company": "Company Name",
    "marketCap": 7230.79,
    "pe": 15.33
  }
}

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate and get JWT token |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Screenings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/screenings` | List all screenings |
| POST | `/api/screenings` | Create new screening session |
| GET | `/api/screenings/:id` | Get screening with results |
| POST | `/api/screenings/:id/results` | Add results (single or array) |
| POST | `/api/screenings/:id/complete` | Mark screening complete |
| GET | `/api/screenings/:id/results` | Get results with filters |
| GET | `/api/screenings/ticker/:ticker` | Get results by ticker (with screening info) |
| PATCH | `/api/screenings/results/:id` | Update result (tier, newsStatus, newsNotes, rawData) |
| DELETE | `/api/screenings/:id` | Delete screening |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with DB status |
| GET | `/api/dashboard/stats` | Dashboard statistics |

## Finviz API Quick Reference

**Important:** Add `-A "Mozilla/5.0"` to curl commands to avoid blocks.

```bash
# Screen stocks (v=111 overview, v=171 technical, v=131 ownership, v=161 financial)
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o20,sh_price_u30,cap_midover&auth=$FINVIZ_API_TOKEN"

# Price history
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/quote_export.ashx?t=AAPL&p=d&auth=$FINVIZ_API_TOKEN" | tail -30

# News
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/news_export.ashx?v=3&t=AAPL&auth=$FINVIZ_API_TOKEN" | head -10
```

### Finviz API - Reliable Fetch Patterns

**Problem:** News and quote exports sometimes return empty on first call (timing/caching issue).

**Solution:** For reliable fetches, use these patterns:

```bash
# Source env first
source /path/to/trading/.env

# NEWS - Full fetch (don't pipe, let it complete fully)
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN"

# QUOTES - Save to file then read (most reliable for large data)
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/quote_export.ashx?t=TICKER&p=d&auth=$FINVIZ_API_TOKEN" > /tmp/ticker_price.csv && tail -60 /tmp/ticker_price.csv

# MULTIPLE TICKERS - Technical data
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=171&t=AAPL,MSFT,GOOGL&auth=$FINVIZ_API_TOKEN"

# MULTIPLE TICKERS - Ownership data
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=131&t=AAPL,MSFT,GOOGL&auth=$FINVIZ_API_TOKEN"
```

**View Types for Screening:**
| View | Code | Data Returned |
|------|------|---------------|
| Overview | v=111 | Ticker, company, sector, market cap, P/E, price, change, volume |
| Technical | v=171 | Beta, ATR, SMA 20/50/200, 52W High/Low, RSI, price, change, volume |
| Ownership | v=131 | Market cap, shares, insider/inst ownership & transactions, short float/ratio |
| Financial | v=161 | P/E, EPS, profit margin, ROE, debt/equity, dividend yield |

**If fetch returns empty:** Retry without piping to head/tail first, then pipe after confirming data returns.

---

## Single Stock Analysis Template

When analyzing a single stock for demand/support zones and trade setups, follow this template:

### 1. Current Stats Table
```markdown
| Metric | Value |
|--------|-------|
| **Price** | $XX.XX (+/-X.XX%) |
| **Market Cap** | $X.XB |
| **RSI** | XX.XX (oversold <30 / neutral 30-70 / overbought >70) |
| **Beta** | X.XX (volatility vs market) |
| **vs 52W High** | -XX.XX% |
| **vs 52W Low** | +XX.XX% |
| **Short Float** | XX.XX% (>20% = high risk, <5% = low risk) |
| **Inst Trans** | +/-XX.XX% (positive = buying, negative = selling) |
| **Insider Trans** | +/-XX.XX% (positive = buying, negative = selling) |
```

### 2. Technical Position Table
```markdown
| SMA | vs Price | Trend |
|-----|----------|-------|
| 20 SMA | +/-X.XX% | Bullish/Bearish |
| 50 SMA | +/-X.XX% | Bullish/Bearish |
| 200 SMA | +/-X.XX% | Bullish/Bearish |
```

### 3. Price Structure (ASCII Chart)
Show key levels with current price position:
```
$XX.XX ─── 52W High / Resistance
$XX.XX ─── Resistance level
$XX.XX ─── Current price ◀ CURRENT
$XX.XX ─── Support level
$XX.XX ─── Demand zone
$XX.XX ─── 52W Low
```

### 4. Key Support & Demand Zones

**Support Zones** (price levels where buying pressure historically appears):
| Zone | Strength | Note |
|------|----------|------|
| $XX.XX-XX.XX | Strong/Medium/Weak | Description (e.g., "Jan 30 low") |

**Demand Zones** (areas of significant accumulation, typically after consolidation):
| Zone | Strength | Note |
|------|----------|------|
| $XX.XX-XX.XX | Strong/Medium/Weak | Description (e.g., "Nov base before rally") |

**How to Identify Zones from Price History:**
- **Support:** Look for lows that were tested multiple times and held
- **Demand:** Look for consolidation areas before significant rallies (accumulation)
- **Strength:** More tests + longer consolidation = stronger zone

### 5. Key Price Action Table
```markdown
| Date | Low | High | Close | Note |
|------|-----|------|-------|------|
| Date | $XX.XX | $XX.XX | $XX.XX | Description |
```

### 6. Catalysts Section
```markdown
| Catalyst | Detail |
|----------|--------|
| **Catalyst Name** | Brief description |
```

### 7. Concerns & Positives
```markdown
### Concerns
| Issue | Detail |
|-------|--------|
| Issue name | Description |

### Positives
| Factor | Detail |
|--------|--------|
| Factor name | Description |
```

### 8. Trade Setup Table
```markdown
| Scenario | Entry | Stop | Target | R/R |
|----------|-------|------|--------|-----|
| **Aggressive** | $XX.XX-XX.XX | $XX.XX (-X%) | $XX.XX (+X%) | X:1 |
| **Moderate** | $XX.XX-XX.XX | $XX.XX | $XX.XX (+X%) | X:1 |
| **Conservative** | $XX.XX-XX.XX | $XX.XX | $XX.XX (+X%) | X:1 |
```

### 9. Verdict
Summarize:
- Overall bias (bullish/bearish/neutral)
- Best entry zone
- Key risks
- Recommendation (BUY/WATCH/SKIP)

---

## Key Metrics Interpretation

### RSI (Relative Strength Index)
| RSI Range | Interpretation |
|-----------|----------------|
| < 30 | Oversold - potential bounce |
| 30-50 | Neutral-bearish |
| 50-70 | Neutral-bullish |
| > 70 | Overbought - potential pullback |

### Short Float Risk Levels
| Short Float | Risk Level | Note |
|-------------|------------|------|
| < 5% | Low | Minimal short pressure |
| 5-15% | Medium | Normal range |
| 15-25% | High | Significant short interest |
| > 25% | Very High | Squeeze potential but also high downside risk |

### Institutional/Insider Activity
| Activity | Interpretation |
|----------|----------------|
| Inst Trans > +5% | Institutions accumulating (bullish) |
| Inst Trans < -5% | Institutions distributing (bearish) |
| Insider Trans > 0 | Insiders buying (very bullish) |
| Insider Trans -3% to 0 | Minimal selling, not alarming |
| Insider Trans -3% to -10% | Moderate selling -- run `insider check TICKER` |
| Insider Trans < -10% | Heavy insider selling (red flag -- run full insider analysis) |

**When Insider Trans < -3%:** Run `insider check TICKER` for Form 4 analysis, severity scoring, and short-seller report scan. See [Insider & Short Monitor](strategies/insider-short-report-monitor.md).

### Beta Interpretation
| Beta | Volatility |
|------|------------|
| < 1.0 | Less volatile than market |
| 1.0-2.0 | Normal volatility |
| 2.0-4.0 | High volatility |
| > 4.0 | Extreme volatility (risky) |

## Trading Strategies

| Strategy | When to Use | Command |
|----------|-------------|---------|
| [Swing Trade Screener](strategies/swing-trade-screener.md) | Find candidates across price ranges | "run swing screener" |
| [Single Stock Analysis](strategies/single-stock-analysis.md) | Evaluate specific stock | "analyze AAPL" |
| [SMC Analysis](strategies/smc-single-stock-analysis.md) | Precise entry timing | "SMC analyze AAPL" |
| [Insider & Short Monitor](strategies/insider-short-report-monitor.md) | Check insider selling & short-seller risk | "insider check AAPL" |

### Screening Workflow with Database

When running the swing screener, Claude will:
1. Execute the screening workflow (Finviz API calls, pattern/tier classification, news check)
2. Create a screening session via `POST /api/screenings`
3. Store all results via `POST /api/screenings/:id/results`
4. Mark complete via `POST /api/screenings/:id/complete`
5. Results are then visible in the UI at http://localhost:5173/screenings

See the "Database Integration" section in [swing-trade-screener.md](strategies/swing-trade-screener.md) for API details.

## UI Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | User authentication |
| Dashboard | `/` | Overview with stats and recent screenings |
| Screenings | `/screenings` | List all screening sessions |
| Screening Detail | `/screenings/:id` | View results with filters, tier/pattern badges |
| Analysis | `/analysis/:ticker` | Detailed ticker view with recommendations |

### Analysis Page Features
The analysis page (`/analysis/TICKER`) displays a **timeline/history view** when a ticker has multiple screening results:

**Layout:**
- **Latest Result** (always expanded at top): Shows full analysis with "Latest" tag, screening name, and date
- **Previous Analyses** (collapsible cards below): Click to expand any historical result

**Each result card displays:**
- **Price & Stats**: Current price, change, RSI, market cap
- **Technical Indicators**: SMA 20/50/200, 52W High/Low, Beta, ATR
- **Ownership**: Institutional/insider ownership and transactions
- **Short Interest**: Short float %, short ratio
- **Fundamentals**: P/E, profit margin, debt/equity, dividend yield
- **Classification**: Tier badge, pattern badge, news status
- **Trade Setup** (for both BUY and WATCH tiers): Entry range, stop loss, targets, R/R ratio
- **Investment Thesis**: Why this stock is a pick
- **Catalysts**: Upcoming events that could move the stock
- **Risks**: What could go wrong
- **Watch Reason**: Why it's WATCH not BUY (for WATCH tier only)
- **News Headlines**: Recent news with summary

---

## Development Progress

### Completed
- [x] PostgreSQL setup with docker-compose (port 5438)
- [x] Database migrations with dbmate
- [x] Database schema (users, screenings, screening_results, trade_setups, trade_executions)
- [x] Express API with TypeScript + Kysely
- [x] JWT authentication (login/register/me endpoints)
- [x] Screening service (CRUD operations)
- [x] Dashboard stats endpoint
- [x] React + Vite + Ant Design frontend
- [x] Login/Register pages with JWT auth
- [x] Dashboard with stats and recent screenings
- [x] Screenings list and detail pages
- [x] Results table with tier/pattern/news badges
- [x] News tooltip showing headlines on hover
- [x] Analysis page with detailed recommendations display
- [x] Trade setup card (entry, stop, targets, R/R)
- [x] Investment thesis, catalysts, risks sections
- [x] Watch reason alerts for WATCH tier stocks
- [x] Strategy integration with database storage
- [x] Structured recommendation storage in raw_data
- [x] Finviz API client with rate limiting
- [x] Pattern/tier classifier service
- [x] **Analysis page timeline/history view** - shows all screening results for a ticker with latest expanded and older results collapsible
- [x] **Recommendations for both BUY and WATCH tiers** - all picks get entry/stop/target, WATCH tier includes watchReason
- [x] **API returns screening info with ticker results** - screening_name and screening_date included for context

### Next Steps
- [ ] Trade setup form (create trade_setups from screening results)
- [ ] SMC analysis integration with database
- [ ] Price history charts (TradingView widget or custom)
- [ ] Dockerfile for the full application

### Future Ideas
- Real-time price updates via WebSocket
- Portfolio tracking with P&L calculations
- Alerts/notifications (price targets, stop loss hits)
- Watchlist management
- Historical performance tracking
- Export to CSV/Excel

---

## Direct Database Access

For quick queries and updates, use psql directly instead of HTTP requests:

```bash
# Source .env to get DATABASE_URL
source .env

# Query examples
psql "$DATABASE_URL" -c "SELECT ticker, tier, price FROM screening_results WHERE screening_id = 'xxx';"

# Update raw_data with recommendation
psql "$DATABASE_URL" -c "UPDATE screening_results SET raw_data = jsonb_set(raw_data, '{recommendation}', '{...}'::jsonb) WHERE id = 'xxx';"

# Check which results have recommendations
psql "$DATABASE_URL" -c "SELECT ticker, tier, raw_data->'recommendation' IS NOT NULL as has_rec FROM screening_results WHERE screening_id = 'xxx';"
```

---

## Code Conventions

- **API:** Express routes return `{ data: ... }` or `{ error: ... }`
- **Database:** Use `getDb()` for lazy initialization (ensures env vars loaded)
- **Database (direct):** Use `source .env && psql "$DATABASE_URL"` for quick queries
- **Validation:** Zod schemas in route handlers
- **Types:** Database types in `apps/api/src/db/types.ts`
- **Naming:** camelCase in TypeScript, snake_case in database
