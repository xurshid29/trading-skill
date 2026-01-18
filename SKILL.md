---
name: trading
description: Stock market analysis and trading assistant. Use when screening stocks, checking quotes, analyzing fundamentals/technicals, reviewing SEC filings, getting market news, or making trading decisions.
allowed-tools: Read, Bash(curl:*)
---

# Trading Skill

A comprehensive skill for stock market analysis and trading decisions.

## Available APIs

### Finviz Elite
Stock screening, quotes, SEC filings, and news.
- **Docs**: [docs/finviz-api.md](docs/finviz-api.md)
- **Token**: `export FINVIZ_API_TOKEN="your-token"`

## Strategies

| Strategy | Trigger Phrases |
|----------|-----------------|
| [Swing Trade Screener](strategies/swing-trade-screener.md) | "run swing screener", "find swing trade candidates", "screen for swing trades" |
| [Single Stock Analysis](strategies/single-stock-analysis.md) | "analyze AAPL", "evaluate MSFT for entry", "should I buy NVDA?" |

## Capabilities

### Finviz
- **Screen Stocks** - Filter by sector, fundamentals, technicals, ownership
- **Price History** - Historical OHLCV data for any ticker
- **SEC Filings** - Latest 10-K, 10-Q, 8-K filings
- **Market News** - Latest news from major financial sources

## Quick Reference

### Screen Stocks (Finviz)
```bash
curl -s "https://elite.finviz.com/export.ashx?v=111&f=sec_technology,cap_largeover&auth=$FINVIZ_API_TOKEN"
```

### Price History (Finviz)
```bash
curl -s "https://elite.finviz.com/quote_export.ashx?t=AAPL&p=d&auth=$FINVIZ_API_TOKEN"
```

### SEC Filings (Finviz)
```bash
curl -s "https://elite.finviz.com/export/latest-filings?t=AAPL&o=-filingDate&auth=$FINVIZ_API_TOKEN"
```

### News (Finviz)
```bash
curl -s "https://elite.finviz.com/news_export.ashx?v=1&auth=$FINVIZ_API_TOKEN"
```
