# Finviz Trading Skill

A [Claude Code](https://claude.ai/code) skill for scanning and analyzing stocks using the [Finviz Elite](https://finviz.com/elite.ashx) API.

## Features

- **Screen Stocks** - Filter by sector, fundamentals, technicals, ownership
- **Price History** - Historical OHLCV data for any ticker
- **SEC Filings** - Latest 10-K, 10-Q, 8-K filings
- **Market News** - Latest news from major financial sources

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- Finviz Elite subscription with API access

## Installation

### As a Skill (recommended)

```bash
# Clone to your personal skills directory
git clone https://github.com/YOUR_USERNAME/finviz-trading-skill.git ~/.claude/skills/finviz-trading

# Or symlink if you have a local copy
ln -s /path/to/trading ~/.claude/skills/finviz-trading
```

### Project-level

```bash
git clone https://github.com/YOUR_USERNAME/finviz-trading-skill.git .claude/skills/finviz-trading
```

## Setup

Set your Finviz API token as an environment variable:

```bash
# Add to ~/.zshrc or ~/.bashrc
export FINVIZ_API_TOKEN="your-token-here"
```

## Usage

Once installed, Claude will automatically use this skill when you ask:

- "Screen for tech stocks with high dividends"
- "Get price history for AAPL"
- "Show SEC filings for MSFT"
- "What's the latest market news?"
- "Find oversold stocks in the S&P 500"

## Documentation

- [SKILL.md](SKILL.md) - Skill definition (required by Claude Code)
- [docs/finviz-api.md](docs/finviz-api.md) - Complete API reference

## Structure

```
├── SKILL.md              # Claude Code skill definition
├── CLAUDE.md             # Project guidance for Claude
├── docs/
│   └── finviz-api.md     # Full API documentation
└── resources/
    └── finviz/           # Saved HTML references
```

## License

MIT
