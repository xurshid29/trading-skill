# Momentum Screener Strategy

## Trading Style

| Parameter | Value |
|-----------|-------|
| **Position** | Long only |
| **Hold Time** | 1-2 days (exit before momentum fades) |
| **Timeframe** | 15M - 4H for entry, Daily for trend |
| **Final Output** | 5-8 high-conviction picks |

---

## Strategy Workflow Overview

This screener finds **fast-moving stocks** with active catalysts. Higher risk, higher reward than swing trading.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOMENTUM WORKFLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCREENING PHASE                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 1: Run Momentum Screen (high change + volume)      │   │
│  │    ↓                                                    │   │
│  │ Step 2: Filter by Technical Setup (RSI, SMA position)   │   │
│  │    ↓                                                    │   │
│  │ Step 3: Categorize by Pattern (breakout, gap-up, etc)   │   │
│  │    ↓                                                    │   │
│  │ Step 4: News/Catalyst Check (find the "why")            │   │
│  │    ↓                                                    │   │
│  │ Step 5: Final Selection (5-8 picks)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** We want stocks that are ALREADY moving, not waiting for movement.

---

## Screening Criteria

### Price & Volume (Momentum Signals)
- **Price Range**: $10-50 (liquid, moves well)
- **Daily Change**: 3%+ (showing momentum)
- **Relative Volume**: High (above average)
- **Average Volume**: > 1M (easy entry/exit)
- **Market Cap**: $2B+ (institutional interest)

### Technical Setup
- **RSI**: 50-75 (strong momentum, not exhausted)
- **vs SMA20**: +1% to +15% (above and trending)
- **vs SMA50**: Above or crossing above
- **52W High**: Within 15% (room to run but near strength)
- **Beta**: 1.0-2.5 (will move, but not crazy)

### Catalyst Requirements
- Positive news in last 1-3 days
- Earnings beat, analyst upgrade, contract win, product launch
- Sector momentum (peers also moving)

### Avoid
- Earnings in next 2 days (binary risk)
- Heavily shorted (>20% short float) unless squeeze play
- RSI > 80 (exhausted, likely to pull back)
- Gap ups > 15% (often fade)

---

## Pattern Categories

### 1. Breakout (Best for momentum)
- Price breaking above resistance/consolidation
- Volume surge (2x+ average)
- RSI 55-70
- Entry: On breakout confirmation or first pullback

### 2. Gap-Up Continuation
- Gapped up 3-8% on news
- Holding gains, not fading
- Volume confirms (high relative volume)
- Entry: After first 30min if holding above VWAP

### 3. Momentum Continuation
- Already in uptrend (above all SMAs)
- Pulling back slightly on low volume
- RSI pulled back from overbought
- Entry: On bounce from SMA20 or support

---

## Finviz API Filters

### Primary Momentum Screen
```bash
# Momentum screen: up 3%+, high volume, mid-cap+, above SMA20
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o10,sh_price_u50,ta_change_u3,sh_avgvol_o1000,cap_midover,ta_sma20_pa,ta_rsi_nos&auth=$FINVIZ_API_TOKEN"
```

**Filters:**
- Price: $10-50
- Change: Up 3%+
- Avg Volume: >1M
- Market Cap: Mid+
- SMA20: Price above
- RSI: Not overbought (<70)

### Alternative: Strong Momentum (5%+ movers)
```bash
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o10,sh_price_u50,ta_change_u5,sh_avgvol_o500,cap_midover,ta_sma20_pa&auth=$FINVIZ_API_TOKEN"
```

### Get Ownership Data for Candidates
```bash
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=131&t=TICK1,TICK2,...&auth=$FINVIZ_API_TOKEN"
```

---

## Analysis Workflow

### Step 1: Run Primary Screen
Get stocks up 3%+ with volume, above SMA20.

### Step 2: Filter by Setup Quality

**TIER 1 - Best setups (Primary picks):**
- RSI: 55-70
- vs SMA20: +2% to +10%
- vs 52W High: Within 10%
- Beta: 1.2-2.0
- Clear catalyst in news

**TIER 2 - Good setups (Secondary picks):**
- RSI: 50-75
- vs SMA20: +1% to +15%
- vs 52W High: Within 20%
- Beta: 1.0-2.5
- News present but less clear

### Step 3: Categorize by Pattern

| Pattern | RSI | vs SMA20 | Volume | Look For |
|---------|-----|----------|--------|----------|
| Breakout | 55-70 | +3% to +10% | 2x+ avg | Breaking resistance |
| Gap-Up Continuation | 55-75 | +5% to +15% | High | Holding above gap |
| Momentum Pullback | 50-60 | +1% to +5% | Normal | Bounce from SMA20 |

### Step 4: News/Catalyst Check
```bash
# Check news for each candidate
for ticker in TICK1 TICK2 TICK3; do
  echo "=== $ticker ===" && curl -s -A "Mozilla/5.0" "https://elite.finviz.com/news_export.ashx?v=3&t=$ticker&auth=$FINVIZ_API_TOKEN" | head -8
  sleep 1
done
```

**Strong Catalysts:**
- Earnings beat + raised guidance
- Analyst upgrade with price target increase
- Major contract/partnership announcement
- FDA approval, product launch
- Insider buying disclosed

**Weak Catalysts (still tradeable):**
- Sector rotation/momentum
- Technical breakout only
- General market strength

### Step 5: Final Selection (5-8 picks)

| Category | Picks | Risk Level |
|----------|-------|------------|
| Breakout | 2-3 | Medium |
| Gap-Up Continuation | 1-2 | Higher |
| Momentum Pullback | 2-3 | Lower |

---

## Chart Setup & Indicators

### Platform Setup (TradingView + IBKR Desktop)

Use a **dual-chart layout** for analysis and execution.

#### TradingView — Left Chart: 15min (Entry Timing)

Primary decision-making timeframe.

| Indicator | Settings | Purpose |
|-----------|----------|---------|
| **VWAP** | Standard (session reset) | Intraday support/resistance |
| **VWAP Bands** | 1st & 2nd std deviation | Profit targets & oversold zones |
| **EMA 9** | Length: 9 | Short-term trend |
| **EMA 21** | Length: 21 | Momentum direction |
| **RSI** | Period: 14 | Overbought/oversold |
| **Volume** | Default | Confirm conviction |

**TradingView setup steps:**
1. Add VWAP: Indicators → search "VWAP" → select built-in
2. Enable bands: Click VWAP settings gear → check "1st Standard Deviation" and "2nd Standard Deviation"
3. Add EMA: Indicators → "EMA" → set Length to 9
4. Duplicate EMA: Add another "EMA" → set Length to 21
5. Add RSI: Indicators → "RSI" → default 14

#### TradingView — Right Chart: 1H or 4H (Trend Confirmation)

Confirms overall direction before entering on 15min.

| Indicator | Settings | Purpose |
|-----------|----------|---------|
| **SMA 20** | Length: 20 | Trend direction |
| **SMA 50** | Length: 50 | Key support/resistance |
| **RSI** | Period: 14 | Trend strength |
| **Anchored VWAP** | Anchor to breakout day | Multi-day support level |

**Anchored VWAP setup:**
1. Right-click on the breakout candle → "Add Anchored VWAP"
2. This shows the average price since the move started

#### IBKR Desktop — 15min (Execution & Management)

| Indicator | Settings | Purpose |
|-----------|----------|---------|
| **VWAP** | Studies → Add → VWAP | Entry/exit reference |
| **VWAP Bands** | Studies → Add → "VWAP with Standard Deviation" | Targets |
| **Volume** | Show below chart | Confirm moves |

**IBKR setup steps:**
1. Open chart → right-click → **Studies** → **Add Study**
2. Search "VWAP" → Add
3. For bands: Search "VWAP with Standard Deviation" → Add

---

### Which Timeframe When

| Phase | Timeframe | Platform | Action |
|-------|-----------|----------|--------|
| Pre-market scan | Daily | TradingView | Identify candidates from screener |
| Trend check | 1H / 4H | TradingView | Confirm direction, check SMA20/50 |
| Entry timing | **15min** | TradingView | Wait for VWAP setup |
| Execution | 5min | IBKR | Precise order fills |
| During trade | 15min | IBKR | Monitor stops & targets |

---

### VWAP Trading Rules

**VWAP is the key indicator for momentum entries.**

```
                    ╱ ← Break higher (Target 1: Upper Band +1 SD)
         ╱╲       ╱
        ╱  ╲     ╱
       ╱    ╲   ╱ ← Bounce off VWAP (ENTER HERE)
══════════════╲╱════════════ VWAP LINE
                ↑
           Never buy below this on momentum trades
```

| Rule | Description |
|------|-------------|
| **Never buy below VWAP** | On momentum trades, price below VWAP = momentum lost |
| **Best entry** | Pullback to VWAP that holds (bounces off) on 15min |
| **Exit signal** | Close below VWAP with volume |
| **Target 1** | Upper VWAP band (+1 std dev) |
| **Target 2** | Upper VWAP band (+2 std dev) |

#### VWAP Entry by Pattern Type

| Pattern | VWAP Entry Rule |
|---------|----------------|
| **Breakout** | Enter when price breaks resistance AND stays above VWAP |
| **Gap-Up** | Wait 15-30min; enter only if price holds above VWAP |
| **Pullback** | Enter on 15min candle that bounces off VWAP with green close |

#### VWAP + EMA Confluence

The strongest entries happen when VWAP and EMAs align:

| Signal | Meaning | Action |
|--------|---------|--------|
| Price above VWAP + EMA9 > EMA21 | Strong momentum | Full position entry |
| Price above VWAP, EMA9 crossing EMA21 | Momentum starting | Half position, add on confirm |
| Price below VWAP | Momentum lost | Do not enter / exit |
| Price bounces off VWAP + EMA21 | Support confluence | Best entry point |

---

### Morning Routine Checklist

```
1. TradingView (4H)   → Confirm picks still trending up (above SMA20)
2. TradingView (15min) → Watch for VWAP entry setup
3. IBKR (15min)        → Execute trade when signal triggers
4. IBKR (15min)        → Manage position: VWAP = stop reference
```

---

## Entry & Exit Rules

### Entry
- **Breakout:** Enter on break above resistance with volume, or first pullback to VWAP/breakout level
- **Gap-Up:** Enter after first 15-30min if holding above VWAP
- **Pullback:** Enter on bounce from VWAP or EMA21 with increasing volume

### Position Sizing
- Max 5-8% of portfolio per trade (higher risk = smaller size)
- Scale in: 50% initial, 50% on confirmation

### Stop Loss
- **Breakout:** Below breakout level or -3-4%
- **Gap-Up:** Below gap fill level or VWAP
- **Pullback:** Below SMA20 or -3-4%

### Take Profit
- **Target 1:** +5-7% (take 50% off)
- **Target 2:** +10-12% (take remaining)
- **Trail stop:** Move stop to breakeven after +5%

### Time Stop
- If no movement in 1-2 days, exit at market
- Momentum trades should work quickly or not at all

---

## Risk Management

| Rule | Value |
|------|-------|
| Stop Loss | 3-4% (tight) |
| Take Profit | 8-15% |
| Risk/Reward | Minimum 2:1 |
| Position Size | 5-8% of portfolio |
| Max Positions | 3-5 concurrent |
| Max Daily Loss | 2% of portfolio |

**Key Rule:** Cut losers fast, let winners run. If a momentum trade doesn't work in 1-2 days, it's not working.

---

## Example Analysis Template

```markdown
## [TICKER] Momentum Analysis - [DATE]

### Setup Type
[Breakout / Gap-Up / Pullback]

### Price Action
- Price: $XX.XX
- Change: +X.XX%
- Volume: X.XM (XXX% of avg)
- Gap: X.XX% (if applicable)

### Technical
- RSI (14): XX.XX
- vs SMA20: +X.XX%
- vs SMA50: +X.XX%
- vs 52W High: -X.XX%
- Beta: X.XX

### Catalyst
[Description of news/catalyst driving the move]

### Trade Plan
- Entry: $XX.XX (on [condition])
- Stop: $XX.XX (-X.XX%)
- Target 1: $XX.XX (+X%)
- Target 2: $XX.XX (+X%)
- R/R: X.X:1

### Conviction
[HIGH / MEDIUM] - [reason]
```

---

## Momentum vs Swing: When to Use Each

| Scenario | Strategy |
|----------|----------|
| Market trending up strongly | Momentum |
| Market choppy/sideways | Swing |
| High VIX (>25) | Swing (or cash) |
| Earnings season | Momentum (post-earnings plays) |
| Want quick gains | Momentum |
| Want safer, steadier gains | Swing |

---

## Database Integration

Same as swing screener - store results in database for tracking.

### Pattern & Tier Values
| Pattern | Value |
|---------|-------|
| Breakout | `breakout` |
| Gap-Up Continuation | `gap_up` |
| Momentum Pullback | `momentum_pullback` |

| Tier | Value | Criteria |
|------|-------|----------|
| BUY | `buy` | Tier 1 setup + strong catalyst |
| WATCH | `watch` | Tier 2 setup or weaker catalyst |
| SKIP | `skip` | Poor setup or red flags |

---

## Common Mistakes to Avoid

1. **Chasing** - Don't buy stocks up 10%+ without pullback
2. **No catalyst** - Momentum without news often fades
3. **Oversized positions** - These are riskier, size accordingly
4. **Holding too long** - Take profits, don't let winners become losers
5. **Fighting the trend** - If market is down, momentum longs struggle
6. **Ignoring volume** - No volume = no conviction = avoid
