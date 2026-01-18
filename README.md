# Trading Skill

A [Claude Code](https://claude.ai/code) skill for stock market analysis and trading decisions.

## Supported APIs

| API | Features | Status |
|-----|----------|--------|
| [Finviz Elite](https://finviz.com/elite.ashx) | Screening, quotes, SEC filings, news | ✅ Ready |
| *More coming soon* | | |

## Installation

### Personal (recommended)

```bash
git clone git@github.com:xurshid29/trading-skill.git ~/.claude/skills/trading
```

### Project-level

```bash
git clone git@github.com:xurshid29/trading-skill.git .claude/skills/trading
```

## Setup

Set API tokens as environment variables (add to `~/.zshrc` or `~/.bashrc`):

```bash
# Finviz Elite
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

| File | Description |
|------|-------------|
| [SKILL.md](SKILL.md) | Skill definition (required by Claude Code) |
| [docs/finviz-api.md](docs/finviz-api.md) | Finviz API reference |

## Structure

```
├── SKILL.md              # Claude Code skill definition
├── CLAUDE.md             # Project guidance for Claude
├── docs/
│   └── finviz-api.md     # Finviz API documentation
└── resources/
    └── finviz/           # Saved HTML references
```

## License

MIT
