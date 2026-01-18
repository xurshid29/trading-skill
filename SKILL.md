---
name: finviz-trading
description: Scan and analyze stocks using Finviz Elite API. Use when screening stocks, checking quotes, getting price history, analyzing SEC filings, or reviewing market news for trading decisions.
allowed-tools: Read, Bash(curl:*)
---

# Finviz Trading Assistant

A skill for scanning and analyzing stocks using the Finviz Elite API.

## Setup

Set your API token as an environment variable:

```bash
export FINVIZ_API_TOKEN="your-token-here"
```

## Capabilities

1. **Screen Stocks** - Filter by sector, fundamentals, technicals, ownership
2. **Get Price History** - Historical OHLCV data for any ticker
3. **SEC Filings** - Latest 10-K, 10-Q, 8-K filings
4. **Market News** - Latest news from major financial sources

## API Endpoints

| API | Endpoint |
|-----|----------|
| Screener | `export.ashx?v={view}&f={filters}` |
| Quote History | `quote_export.ashx?t={ticker}&p=d` |
| SEC Filings | `export/latest-filings?t={ticker}&o=-filingDate` |
| News | `news_export.ashx?v=1` |

Base URL: `https://elite.finviz.com/`

All endpoints require `&auth=$FINVIZ_API_TOKEN`

## Full Documentation

See [docs/finviz-api.md](docs/finviz-api.md) for complete API reference with all filter codes.
