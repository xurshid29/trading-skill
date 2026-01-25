# Swing Trade Screener Strategy

## Trading Style

| Parameter | Value |
|-----------|-------|
| **Position** | Long only |
| **Hold Time** | 2-3 days |
| **Timeframe** | 4H - 1D |
| **Final Output** | Minimum 9 picks by pattern |

---

## Strategy Workflow Overview

This screener finds **WHAT** to buy. For **WHEN** to enter, use SMC analysis on your top picks.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SWING TRADE WORKFLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SCREENING PHASE (This Strategy)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 1: Run Screener (50+ stocks)                       │   │
│  │    ↓                                                    │   │
│  │ Step 2: Apply Original Criteria (20-30 stocks)          │   │
│  │    ↓                                                    │   │
│  │ Step 3: Categorize by Pattern (15-18 candidates)        │   │
│  │    ↓                                                    │   │
│  │ Step 4: News Check (removes red flags)                  │   │
│  │    ↓                                                    │   │
│  │ Step 5: Final Selection (9-12 picks)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  ENTRY PHASE (SMC Strategy - Optional)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 6: SMC Analysis on Top 3-5 Picks                   │   │
│  │    • Identify liquidity levels                          │   │
│  │    • Wait for sweep + CHoCH confirmation                │   │
│  │    • Time precise entry                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** Don't apply SMC to all screener results. Use this strategy to find quality stocks, then apply SMC only to your top picks when ready to enter.

### Output Categories (Minimum 3 each)
| Category | Description | RSI Range | SMA Position |
|----------|-------------|-----------|--------------|
| **Starting Uptrend** | Early breakout, crossing above MAs | 50-65 | Above SMA20, near SMA50 |
| **Consolidation** | Building base, low volatility | 45-55 | Within ±3% of SMA20 & SMA50 |
| **Downtrend Reversal** | Oversold bounce potential | 35-50 | Below SMA20, showing support |

## Screening Criteria

### Price & Volume
- **Price Range**: Configurable (e.g., $10-20, $20-30, $30-40, $40-50)
- **Daily Change**: 3-5% (showing momentum)
- **Average Volume**: > 500K (liquidity)
- **Market Cap**: Mid cap or higher

### Institutional & Insider Support
- **Institutional Ownership**: > 50%
- **Institutional Transactions**: Positive (institutions buying)
- **Insider Transactions**: Not heavily negative

### Short Interest
- **Short Float**: < 10% (avoid heavily shorted)
- **Short Ratio**: < 5 days to cover

### Fundamentals (Light Check)
- **Profit Margin**: > 0% (company is profitable)
- **P/E Ratio**: < 50 (not extremely overvalued)
- **Debt/Equity**: < 2 (not overleveraged)

### Technical Setup (IMPORTANT)
Looking for stocks that are:
- ❌ NOT in strong uptrend (avoid chasing)
- ✅ In consolidation (building base)
- ✅ In downtrend (potential reversal)
- ✅ Just starting uptrend (early entry)

### Safety Checks
- ✅ No breaking news that could invalidate technicals
- ✅ No earnings within 2-3 days
- ✅ No pending SEC investigations
- ✅ Low to moderate beta (< 1.5 preferred)

---

## Tiered Criteria (Strict vs Relaxed)

If not enough results with strict criteria, gradually relax to find minimum 9 picks.

| Criteria | Strict (BUY) | Relaxed (WATCH) |
|----------|--------------|-----------------|
| RSI | 40-60 | 35-70 |
| vs SMA20 | ±5% | ±10% |
| vs SMA50 | ±5% | ±10% |
| Beta | < 1.5 | < 2.0 |
| Short Float | < 10% | < 15% |
| Short Ratio | < 5 days | < 7 days |
| Insider Trans | Not negative | < -5% (minor selling OK) |

**Priority:** Fill each pattern category with strict criteria first, then relax as needed.

---

## Finviz API Filters

### Primary Screen (Relaxed for More Results)
```bash
# Relaxed filters to get more candidates, then filter manually by pattern
# Uses beta <2.0 and short float <15% to capture more stocks
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u2,sh_short_u15,fa_netmargin_pos,fa_pe_u50,fa_debteq_u2&auth=$FINVIZ_API_TOKEN"
```

**Filters applied automatically (relaxed):**
- Price: $30-40 (configurable)
- Inst Ownership: >50%
- Inst Transactions: Positive
- Avg Volume: >500K
- Market Cap: Mid+
- Beta: <2.0 (relaxed from 1.5)
- Short Float: <15% (relaxed from 10%)
- Profit Margin: >0%
- P/E: <50
- Debt/Equity: <2

**Filter manually by pattern:**

| Pattern | RSI | vs SMA20 | vs SMA50 | Look For |
|---------|-----|----------|----------|----------|
| Starting Uptrend | 50-65 | +1% to +10% | -3% to +5% | Breaking above MAs |
| Consolidation | 45-55 | -3% to +3% | -3% to +3% | Tight range, low ATR |
| Downtrend Reversal | 35-50 | -10% to -1% | -10% to +1% | Oversold bounce |

### Alternative Price Ranges
```bash
# $10-20 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o10,sh_price_u20,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u2,sh_short_u15,fa_netmargin_pos,fa_pe_u50,fa_debteq_u2&auth=$FINVIZ_API_TOKEN"

# $20-30 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o20,sh_price_u30,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u2,sh_short_u15,fa_netmargin_pos,fa_pe_u50,fa_debteq_u2&auth=$FINVIZ_API_TOKEN"

# $40-50 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o40,sh_price_u50,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u2,sh_short_u15,fa_netmargin_pos,fa_pe_u50,fa_debteq_u2&auth=$FINVIZ_API_TOKEN"
```

---

## Analysis Workflow

### Step 1: Run Screener
```bash
# Get technical data with relaxed filters for more results
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u2,sh_short_u15,fa_netmargin_pos,fa_pe_u50,fa_debteq_u2&auth=$FINVIZ_API_TOKEN"
```

### Step 2: Categorize by Pattern
Sort results into three categories based on technicals:

**Starting Uptrend (3-4 picks):**
- RSI: 50-65
- vs SMA20: +1% to +10%
- vs SMA50: -3% to +5%
- Look for: Price crossing above SMA20

**Consolidation (3-4 picks):**
- RSI: 45-55
- vs SMA20: -3% to +3%
- vs SMA50: -3% to +3%
- Look for: Tight price range, decreasing volume

**Downtrend Reversal (3-4 picks):**
- RSI: 35-50
- vs SMA20: -10% to -1%
- vs SMA50: -10% to +1%
- Look for: Oversold bounce, hammer candles

### Step 3: Get Ownership Data for Candidates
```bash
# Replace TICKERS with comma-separated list from Step 2
curl -s "https://elite.finviz.com/export.ashx?v=131&t=TICKER1,TICKER2,...&auth=$FINVIZ_API_TOKEN"
```

Apply tiered criteria:
| Tier | Short Ratio | Insider Trans | Beta |
|------|-------------|---------------|------|
| BUY | <5 days | Not negative | <1.5 |
| WATCH | <7 days | <-5% | <2.0 |

### Step 4: News Check (CRITICAL)

**Important: Select ~15-18 candidates (5-6 per category) before news check to have buffer for replacements.**

```bash
# Check news in small batches (3-5 tickers at a time) to avoid rate limiting
# Batch 1
for ticker in TICK1 TICK2 TICK3 TICK4 TICK5; do
  echo "=== $ticker ===" && curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=$ticker&auth=$FINVIZ_API_TOKEN" | head -10
  sleep 1
done

# Batch 2 (wait a few seconds, then continue)
for ticker in TICK6 TICK7 TICK8 TICK9 TICK10; do
  echo "=== $ticker ===" && curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=$ticker&auth=$FINVIZ_API_TOKEN" | head -10
  sleep 1
done

# Batch 3 (remaining candidates)
for ticker in TICK11 TICK12 TICK13 TICK14 TICK15; do
  echo "=== $ticker ===" && curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=$ticker&auth=$FINVIZ_API_TOKEN" | head -10
  sleep 1
done
```

**Fallback: Benzinga** (if Finviz rate limited)
```
https://www.benzinga.com/quote/TICKER/news
```
Use WebFetch tool to retrieve and analyze news headlines from Benzinga (one ticker at a time).

**After news check:** Remove candidates with red flags, select best 9-12 from remaining clean candidates.

**Red Flags to Avoid:**
- Analyst downgrades
- SEC investigations / Law firm notices
- Earnings within 2-3 days
- Major management changes
- Guidance cuts
- Product recalls / Legal issues

**Green Flags:**
- Analyst upgrades
- Positive earnings surprise (recent)
- Acquisitions / Expansion news
- Insider buying
- Industry tailwinds

### Step 5: Final Selection (Minimum 9 Picks)

**Output Format - 3 Categories:**

| Category | Min Picks | Tier Mix |
|----------|-----------|----------|
| Starting Uptrend | 3-4 | 2 BUY + 1-2 WATCH |
| Consolidation | 3-4 | 2 BUY + 1-2 WATCH |
| Downtrend Reversal | 3-4 | 1-2 BUY + 2 WATCH |

**BUY Criteria (strict):**
- Beta <1.5, Short Ratio <5, Short Float <10%
- Insider Trans not negative
- News clear, no earnings within 3 days

**WATCH Criteria (relaxed):**
- Beta <2.0, Short Ratio <7, Short Float <15%
- Insider Trans <-5% (minor selling OK)
- Minor flags acceptable with smaller position

### Step 6: SMC Entry Timing (Optional)

**When to use:** Apply SMC analysis to your top 3-5 picks when you're ready to enter.

**Command:** `SMC analyze [TICKER]`

**What SMC adds:**
| Without SMC | With SMC |
|-------------|----------|
| Enter at current price | Wait for liquidity sweep |
| Stop at arbitrary % | Stop below swept low |
| Target at +5-8% | Target at liquidity pools |
| ~50% win rate | Better entry, same win rate |

**SMC is worth it when:**
- You have time to monitor 15M charts
- Stock is near a key level (support/resistance)
- You want optimal entry on a high-conviction pick

**Skip SMC when:**
- Quick portfolio building (enter multiple stocks)
- Stock already confirmed breakout
- Limited trading time

**Typical workflow:**
1. Screener gives you 9-12 picks (this strategy)
2. Pick top 3-5 you're most interested in
3. Run `SMC analyze [TICKER]` on each
4. Enter the 1-2 with best SMC setup

---

## Ideal Stock Profile

| Criteria | Ideal Range | Why |
|----------|-------------|-----|
| Price | User-defined range | Configurable per scan |
| Daily Change | 3-5% | Shows momentum, not overextended |
| RSI | 40-60 | Room to run, not overbought |
| vs SMA20 | -5% to +5% | Near support/resistance |
| vs SMA50 | -5% to +5% | Trend alignment confirmed |
| 52W High | > 5% below | Not extended/chasing |
| Beta | < 1.5 | Manageable risk |
| Inst. Own | > 50% | Smart money backing |
| Inst. Trans | Positive | Currently accumulating |
| Insider Trans | Not negative | No insider selling |
| Short Float | < 10% | Not heavily shorted |
| Short Ratio | < 5 days | Low squeeze risk |
| Profit Margin | > 0% | Company is profitable |
| P/E Ratio | < 50 | Not extremely overvalued |
| Debt/Equity | < 2 | Not overleveraged |
| Volume | > 500K avg | Easy entry/exit |
| News | Clean | No surprises |

---

## Technical Patterns to Look For

### Consolidation (Preferred)
- Price moving sideways
- Decreasing volume (coiling)
- RSI near 50
- Price between SMA20 and SMA50

### Pullback in Uptrend
- Price pulled back to SMA20 or SMA50
- RSI dropped from overbought
- Volume decreasing on pullback
- Higher lows maintained

### Early Reversal
- Price breaking above recent resistance
- RSI crossing above 50
- Volume increasing
- First close above SMA20

---

## Risk Management

| Rule | Value |
|------|-------|
| Stop Loss | 1.5-2× ATR below entry (or 2-3% if ATR unavailable) |
| Take Profit | 5-8% above entry |
| Risk/Reward | Minimum 2:1 |
| Position Size | Max 10% of portfolio per trade |
| Max Positions | 3-4 concurrent |

**ATR-Based Stop Loss:**
Using ATR adapts your stop to the stock's actual volatility.
- Example: ATR = $0.50, Entry = $25.00 → Stop = $24.25 (1.5× ATR)

---

## Example Analysis Template

```markdown
## [TICKER] Analysis - [DATE]

### Overview
- Price: $XX.XX
- Change: +X.XX%
- Volume: X.XM (vs avg X.XM)
- Market Cap: $X.XXB
- Sector: [Sector]

### Technical Setup
- RSI (14): XX.XX
- vs SMA20: +X.XX%
- vs SMA50: +X.XX%
- 52W High: -X.XX%
- Beta: X.XX
- ATR: $X.XX
- Pattern: [Consolidation/Pullback/Reversal]

### Institutional & Insider
- Inst. Ownership: XX%
- Inst. Transactions: +X.XX%
- Insider Transactions: +X.XX%

### Short Interest
- Short Float: X.XX%
- Short Ratio: X.X days

### Fundamentals
- Profit Margin: X.XX%
- P/E Ratio: XX.XX
- Debt/Equity: X.XX

### News Check
- [ ] No negative breaking news
- [ ] No earnings in next 3 days
- [ ] No analyst downgrades
- [ ] No legal/SEC issues

### Verdict
[BUY / WATCH / SKIP]

Entry: $XX.XX
Stop: $XX.XX (1.5× ATR or -X%)
Target: $XX.XX (+X%)
R/R: X.X:1

### Next Step
[ ] Ready to enter → Run `SMC analyze [TICKER]` for optimal timing
[ ] Add to watchlist → Monitor for better setup
```

---

## When to Use Each Strategy

| Scenario | Strategy | Command |
|----------|----------|---------|
| Find stocks to trade | This screener | "run swing screener" |
| Analyze single stock (basic) | Single Stock Analysis | "analyze AAPL" |
| Time entry on top pick | SMC Analysis | "SMC analyze AAPL" |
| Manage existing position | SMC Analysis | "SMC analyze AAPL" |

**Remember:** This screener finds quality stocks. SMC times the entry. Use both together for best results.

---

## Database Integration

After completing the screening, store results in the database for tracking and UI access.

### Step 1: Create Screening Session
```bash
curl -s -X POST http://localhost:3001/api/screenings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swing Trade Scan - [DATE]",
    "priceMin": [MIN_PRICE],
    "priceMax": [MAX_PRICE]
  }'
```

Save the returned `id` for the next step.

### Step 2: Store Results
For each stock in your final selection, add to database:

```bash
# Add single result
curl -s -X POST http://localhost:3001/api/screenings/[SCREENING_ID]/results \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "price": 175.50,
    "changePct": 2.5,
    "rsi": 52.3,
    "sma20Pct": 1.5,
    "sma50Pct": -2.1,
    "sma200Pct": 5.2,
    "beta": 1.2,
    "instOwnPct": 62.5,
    "instTransPct": 1.2,
    "insiderTransPct": -0.5,
    "shortFloatPct": 0.8,
    "shortRatio": 1.5,
    "pattern": "starting_uptrend",
    "tier": "buy",
    "newsStatus": "clean"
  }'

# Or add multiple results at once
curl -s -X POST http://localhost:3001/api/screenings/[SCREENING_ID]/results \
  -H "Content-Type: application/json" \
  -d '[
    { "ticker": "AAPL", "price": 175.50, "pattern": "starting_uptrend", "tier": "buy", "newsStatus": "clean", ... },
    { "ticker": "MSFT", "price": 380.25, "pattern": "consolidation", "tier": "watch", "newsStatus": "clean", ... }
  ]'
```

### Step 3: Mark Complete
```bash
curl -s -X POST http://localhost:3001/api/screenings/[SCREENING_ID]/complete \
  -H "Content-Type: application/json" \
  -d '{"totalResults": [NUMBER_OF_RESULTS]}'
```

### Pattern & Tier Values
| Pattern | Value |
|---------|-------|
| Starting Uptrend | `starting_uptrend` |
| Consolidation | `consolidation` |
| Downtrend Reversal | `downtrend_reversal` |
| Unknown | `unknown` |

| Tier | Value | Criteria | Recommendation |
|------|-------|----------|----------------|
| BUY | `buy` | Strict criteria met | Full recommendation |
| WATCH | `watch` | Relaxed criteria met | Full recommendation + `watchReason` |
| SKIP | `skip` | Failed criteria or red flag news | No recommendation |

**WATCH tier watchReason examples:**
- "Minor insider selling (-1.4%). Wait for insider activity to stabilize."
- "Higher beta (1.31). Wait for market volatility to decrease."
- "Earnings in 3 days. Wait for post-earnings clarity."
- "Short ratio elevated (6.5 days). Monitor for squeeze risk."

| News Status | Value |
|-------------|-------|
| Not checked | `pending` |
| No issues | `clean` |
| Red flags found | `red_flag` |

### Result Fields Reference
```json
{
  "ticker": "string (required)",
  "price": "number",
  "changePct": "number",
  "volume": "number",
  "avgVolume": "number",
  "marketCap": "number",
  "rsi": "number",
  "sma20Pct": "number",
  "sma50Pct": "number",
  "sma200Pct": "number",
  "high52wPct": "number",
  "low52wPct": "number",
  "beta": "number",
  "atr": "number",
  "instOwnPct": "number",
  "instTransPct": "number",
  "insiderOwnPct": "number",
  "insiderTransPct": "number",
  "shortFloatPct": "number",
  "shortRatio": "number",
  "profitMarginPct": "number",
  "peRatio": "number",
  "debtEquity": "number",
  "dividendYield": "number",
  "pattern": "starting_uptrend | consolidation | downtrend_reversal | unknown",
  "tier": "buy | watch | skip",
  "newsStatus": "pending | clean | red_flag",
  "newsNotes": "string (optional, notes about news findings)"
}
```

### Automated Workflow
When running the screener, Claude should:
1. Execute Steps 1-5 of the screening workflow
2. Create a screening session via API or direct SQL
3. Store all results with pattern, tier, and news status
4. **Generate recommendations for ALL tiers** (both BUY and WATCH):
   - Entry range, stop loss, target1, target2, riskReward
   - Thesis, catalysts, risks
   - **watchReason** (WATCH tier only) - explains why it's not a BUY
5. Mark screening as complete
6. Results will be visible in the UI at http://localhost:5173/screenings

### Direct Database Access (Preferred)
Instead of HTTP requests, use psql directly for faster updates:

```bash
source .env

# Create screening
psql "$DATABASE_URL" -c "INSERT INTO screenings (name, price_min, price_max, status) VALUES ('Swing Trade Scan - 2026-01-25', 20, 50, 'running') RETURNING id;"

# Add recommendation to a result
psql "$DATABASE_URL" << 'EOF'
UPDATE screening_results SET raw_data = jsonb_set(
  raw_data,
  '{recommendation}',
  '{
    "entry": {"min": 35.00, "max": 35.90},
    "stopLoss": 33.90,
    "target1": 38.50,
    "target2": 41.00,
    "riskReward": "2.1:1",
    "thesis": "Investment thesis...",
    "catalysts": ["Catalyst 1", "Catalyst 2"],
    "risks": ["Risk 1", "Risk 2"],
    "watchReason": "Why WATCH not BUY (only for WATCH tier)",
    "sector": "Utilities",
    "industry": "Gas Utilities",
    "company": "Company Name",
    "marketCap": 7230.79
  }'::jsonb
) WHERE id = 'result-uuid-here';
EOF

# Verify recommendations exist
psql "$DATABASE_URL" -c "SELECT ticker, tier, raw_data->'recommendation'->>'riskReward' as rr FROM screening_results WHERE screening_id = 'xxx';"
```
