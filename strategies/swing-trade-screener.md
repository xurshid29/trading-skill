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
- **Price Range**: $30 - $40
- **Daily Change**: 3-5% (showing momentum)
- **Average Volume**: > 500K (liquidity)
- **Market Cap**: Mid cap or higher

### Institutional Support
- **Institutional Ownership**: > 50%
- **Institutional Transactions**: Positive (institutions buying)

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

### Primary Screen
```bash
# Stocks $30-40, 50%+ inst ownership, positive inst transactions, good volume
curl -s "https://elite.finviz.com/export.ashx?v=111&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover&auth=$FINVIZ_API_TOKEN"
```

### With Daily Change Filter (3-5%)
```bash
# Add ta_change_u5 (under 5%) and ta_change_o3 (over 3%) if available
# Or filter results manually for 3-5% change
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover&auth=$FINVIZ_API_TOKEN"
```

### Consolidation/Early Uptrend (NOT extended)
```bash
# Price near SMA20/50 but not too far above (< 5% above)
# RSI between 40-60 (neutral zone)
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover,ta_rsi_nob60&auth=$FINVIZ_API_TOKEN"
```

---

## Analysis Workflow

### Step 1: Run Screener
```bash
# Get overview data
curl -s "https://elite.finviz.com/export.ashx?v=111&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover&auth=$FINVIZ_API_TOKEN"

# Get technical data for filtering
curl -s "https://elite.finviz.com/export.ashx?v=171&f=sh_price_o30,sh_price_u40,sh_instown_o50,sh_insttrans_pos,sh_avgvol_o500,cap_midover&auth=$FINVIZ_API_TOKEN"
```

### Step 2: Filter Results
From the results, select stocks where:
- Daily Change: 3-5%
- RSI: 40-60 (not overbought)
- vs SMA20: -5% to +5% (near moving average, not extended)
- Beta: < 1.5 (manageable volatility)

### Step 3: Get Detailed Data for Top 10
```bash
# Replace TICKERS with comma-separated list
curl -s "https://elite.finviz.com/export.ashx?v=161&t=TICKER1,TICKER2,...&auth=$FINVIZ_API_TOKEN"  # Financials
curl -s "https://elite.finviz.com/export.ashx?v=131&t=TICKER1,TICKER2,...&auth=$FINVIZ_API_TOKEN"  # Ownership
```

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
| Price | $30-40 | Affordable, liquid |
| Daily Change | 3-5% | Shows momentum, not overextended |
| RSI | 40-60 | Room to run, not overbought |
| vs SMA20 | -5% to +5% | Near support/resistance |
| Beta | < 1.5 | Manageable risk |
| Inst. Own | > 50% | Smart money backing |
| Inst. Trans | Positive | Currently accumulating |
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
| Stop Loss | 2-3% below entry |
| Take Profit | 5-8% above entry |
| Risk/Reward | Minimum 2:1 |
| Position Size | Max 10% of portfolio per trade |
| Max Positions | 3-4 concurrent |

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
- Beta: X.XX
- Pattern: [Consolidation/Pullback/Reversal]

### Institutional
- Ownership: XX%
- Transactions: +X.XX%

### Financials
- P/E: XX.XX
- ROE: XX%
- Profit Margin: XX%
- Dividend: X.XX%

### News Check
- [ ] No negative breaking news
- [ ] No earnings in next 3 days
- [ ] No analyst downgrades
- [ ] No legal/SEC issues

### Verdict
[BUY / WATCH / SKIP]

Entry: $XX.XX
Stop: $XX.XX (-X%)
Target: $XX.XX (+X%)
```
