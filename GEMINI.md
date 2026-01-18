# GEMINI.md

This file provides guidance for the Gemini agent when working with the code in this repository.

## Project Overview

This is a stock analysis tool that utilizes the Finviz Elite API for tasks like screening stocks, analyzing quotes, fetching news, and informing trading decisions. The project contains documentation, analysis instructions, and trading strategies in Markdown format. It may be extended with scripting languages like Node.js or Python for automation in the future.

## Structure

- `SKILL.md`: Defines the core capabilities and example API calls.
- `GEMINI.md`: This file. Guidance for the Gemini agent.
- `docs/finviz-api.md`: Detailed Finviz API documentation.
- `resources/finviz/`: Saved HTML references from Finviz Elite.
- `strategies/`: Markdown files containing specific trading strategies.

## Environment Setup

To interact with the Finviz API, the `FINVIZ_API_TOKEN` environment variable must be set.

```bash
export FINVIZ_API_TOKEN="your-token-here"
```

This should be added to a shell configuration file like `~/.zshrc` or `~/.bashrc` for persistence.

## Core Commands

The primary method of interaction with the Finviz API is through `curl` commands executed via the `run_shell_command` tool. The `SKILL.md` file contains useful examples.

### Example: Screen Stocks
```bash
curl -s "https://elite.finviz.com/export.ashx?v=111&f=sec_technology,cap_largeover&auth=$FINVIZ_API_TOKEN"
```

### Example: Get Price History
```bash
curl -s "https://elite.finviz.com/quote_export.ashx?t=AAPL&p=d&auth=$FINVIZ_API_TOKEN"
```
