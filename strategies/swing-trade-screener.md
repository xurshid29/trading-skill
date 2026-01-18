# Swing Trade Screener Strategy

## Trading Style

| Parameter | Value |
|-----------|-------|
| **Position** | Long only |
| **Hold Time** | 2-3 days |
| **Timeframe** | 4H - 1D |
| **Target Stocks** | ~10 candidates |

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

## Finviz API Filters

### Primary Screen (Recommended)
```bash
# Core filters: price, inst ownership, inst transactions, volume, beta, short float
# Adjust price range as needed (e.g., sh_price_o20,sh_price_u30 for $20-30)
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u1.5,sh_short_u10&auth=$FINVIZ_API_TOKEN"
```

**Filters applied automatically:**
- Price: $30-40 (configurable)
- Inst Ownership: >50%
- Inst Transactions: Positive
- Avg Volume: >500K
- Market Cap: Mid+
- Beta: <1.5 ✅ (hard filter)
- Short Float: <10% ✅ (hard filter)

**Filter manually from results:**
- RSI: 40-60 (note 60-70 as WATCH)
- vs SMA20/50: ±5%
- 52W High: >5% below (note breakouts)
- Insider Trans: Not negative

### Alternative Price Ranges
```bash
# $10-20 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o10,sh_price_u20,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u1.5,sh_short_u10&auth=$FINVIZ_API_TOKEN"

# $20-30 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o20,sh_price_u30,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u1.5,sh_short_u10&auth=$FINVIZ_API_TOKEN"

# $40-50 range
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o40,sh_price_u50,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u1.5,sh_short_u10&auth=$FINVIZ_API_TOKEN"
```

---

## Analysis Workflow

### Step 1: Run Screener
```bash
# Get technical data with hard filters (beta <1.5, short float <10%)
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_beta_u1.5,sh_short_u10&auth=$FINVIZ_API_TOKEN"
```

### Step 2: Filter Results (Manual)
From results, select stocks where:
- RSI: 40-60 ✅ (note 60-70 as WATCH)
- vs SMA20: ±5% ✅
- vs SMA50: ±5% ✅
- 52W High: >5% below ✅ (note breakouts)
- Daily Change: 3-5% (momentum)

*Beta and Short Float already filtered by API*

### Step 3: Get Ownership Data for Candidates
```bash
# Replace TICKERS with comma-separated list from Step 2
curl -s "https://elite.finviz.com/export.ashx?v=131&t=TICKER1,TICKER2,...&auth=$FINVIZ_API_TOKEN"
```

Check from ownership data:
- Short Ratio: <5 days ✅
- Insider Trans: Not negative ✅

### Step 4: News Check (CRITICAL)
```bash
# Check each ticker for breaking news
curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN" | head -15
```

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

### Step 5: Final Selection
Narrow down to 3-4 stocks with:
- Best risk/reward setup
- Cleanest charts (consolidation or early reversal)
- No negative news catalysts
- Highest institutional conviction

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
