# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A stock analyzing tool using Finviz Elite API for scanning, analyzing stocks, quotes, news, and making trade entry decisions. Contains documentation, analysis instructions, and trading strategies in markdown format. May include Node.js code for automation in the future.

## Structure

- `SKILL.md` - Claude Code skill definition
- `docs/finviz-api.md` - Complete API documentation
- `resources/finviz/` - Saved HTML references from Finviz Elite
- Future Node.js code for automation/logic

## Using as a Skill

This repo is a Claude Code skill. To use it globally:

```bash
ln -s /Users/khurshidyalgashev/workspace/trading ~/.claude/skills/finviz-trading
```

## Environment Setup

Export your Finviz API token:

```bash
export FINVIZ_API_TOKEN="your-token-here"
```

Add to `~/.zshrc` or `~/.bashrc` for persistence.

## Commands (when Node.js is added)

```bash
npm install    # Install dependencies
npm start      # Run the application
npm test       # Run tests
```
