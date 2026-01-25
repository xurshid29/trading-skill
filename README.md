# Trading

A stock market analysis and trading tool using Finviz Elite API.

## Features

- Stock screening with customizable filters
- Technical and fundamental analysis
- Store screening results in database
- Trading strategies (Swing Trade, SMC)
- Web UI for managing screenings (in progress)

## Quick Start

### Prerequisites

- Node.js 25+
- Docker (for PostgreSQL)
- dbmate (`brew install dbmate`)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd trading
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your FINVIZ_API_TOKEN

# 3. Start database
docker compose up -d

# 4. Run migrations
dbmate up

# 5. Start development servers
npm run dev:api   # API on http://localhost:3001
npm run dev:web   # Web on http://localhost:5173
```

## Project Structure

```
trading/
├── apps/
│   ├── api/           # Express + TypeScript backend
│   └── web/           # React + TypeScript frontend
├── db/migrations/     # SQL migrations (dbmate)
├── docs/              # API documentation
└── strategies/        # Trading strategy templates
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/screenings` | List screenings |
| POST | `/api/screenings` | Create screening |
| GET | `/api/screenings/:id` | Get screening with results |
| POST | `/api/screenings/:id/results` | Add results |

## Commands

```bash
# Development
npm run dev:api        # Start API
npm run dev:web        # Start frontend
npm run dev            # Start both

# Database
docker compose up -d   # Start PostgreSQL
dbmate up              # Run migrations
dbmate status          # Check status
```

## Environment Variables

```bash
DATABASE_URL=postgres://app:app@localhost:5438/app?sslmode=disable
FINVIZ_API_TOKEN=your-token-here
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Full project documentation for Claude Code
- [docs/finviz-api.md](docs/finviz-api.md) - Finviz API reference
- [strategies/](strategies/) - Trading strategy templates

## License

MIT
