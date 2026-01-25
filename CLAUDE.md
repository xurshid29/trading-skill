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
| GET | `/api/screenings/ticker/:ticker` | Get results by ticker |
| PATCH | `/api/screenings/results/:id` | Update result tier/news |
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

## Trading Strategies

| Strategy | When to Use | Command |
|----------|-------------|---------|
| [Swing Trade Screener](strategies/swing-trade-screener.md) | Find candidates across price ranges | "run swing screener" |
| [Single Stock Analysis](strategies/single-stock-analysis.md) | Evaluate specific stock | "analyze AAPL" |
| [SMC Analysis](strategies/smc-single-stock-analysis.md) | Precise entry timing | "SMC analyze AAPL" |

### Screening Workflow with Database

When running the swing screener, Claude will:
1. Execute the screening workflow (Finviz API calls, pattern/tier classification, news check)
2. Create a screening session via `POST /api/screenings`
3. Store all results via `POST /api/screenings/:id/results`
4. Mark complete via `POST /api/screenings/:id/complete`
5. Results are then visible in the UI at http://localhost:5173/screenings

See the "Database Integration" section in [swing-trade-screener.md](strategies/swing-trade-screener.md) for API details.

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
- [x] Results table with tier/pattern badges
- [x] Analysis page for individual tickers
- [x] Strategy integration with database storage

### Next Steps
- [ ] Trade setup form (entry/stop/target)
- [ ] SMC analysis integration
- [ ] Dockerfile for the full application

### Future Ideas
- Real-time price updates via WebSocket
- Portfolio tracking
- P&L reporting
- Alerts/notifications
- Chart integration (TradingView widget?)

---

## Code Conventions

- **API:** Express routes return `{ data: ... }` or `{ error: ... }`
- **Database:** Use `getDb()` for lazy initialization (ensures env vars loaded)
- **Validation:** Zod schemas in route handlers
- **Types:** Database types in `apps/api/src/db/types.ts`
- **Naming:** camelCase in TypeScript, snake_case in database
