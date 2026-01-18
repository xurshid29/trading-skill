# Swing Trade Screener Strategy

## Trading Style

| Parameter | Value |
|-----------|-------|
| **Position** | Long only |
| **Hold Time** | 2-3 days |
| **Timeframe** | 4H - 1D |
| **Final Output** | Minimum 9 picks by pattern |

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
```bash
# Check each ticker for breaking news (Finviz)
curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN" | head -15
```

**Fallback: Benzinga** (if Finviz rate limited)
```
https://www.benzinga.com/quote/TICKER/news
```
Use WebFetch tool to retrieve and analyze news headlines from Benzinga.

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
```
