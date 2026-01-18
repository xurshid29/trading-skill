# Single Stock Analysis Template

Use this template when you have a specific ticker and want to evaluate it for a swing trade entry.

**Note:** When analyzing a specific stock, the price is already accepted by the user. Focus on technical setup, institutional support, and news - not price range.

## Quick Criteria Check

| Criteria | Target | Status |
|----------|--------|--------|
| Daily Change | 3-5% (momentum, not overextended) | |
| Institutional Ownership | > 50% | |
| Institutional Transactions | Positive | |
| Insider Transactions | Positive or neutral (not selling) | |
| Average Volume | > 500K | |
| Market Cap | Mid cap+ | |
| RSI | 40-60 (not overbought) | |
| vs SMA20 | -5% to +5% (not extended) | |
| vs SMA50 | -5% to +5% (trend aligned) | |
| 52W High | > -5% from high = extended, avoid | |
| Beta | < 1.5 (manageable risk) | |
| Short Float | < 10% (avoid heavily shorted) | |
| Short Ratio | < 5 days (avoid squeeze risk) | |
| ATR | Note for stop loss sizing | |
| Profit Margin | > 0% (profitable) | |
| P/E Ratio | < 50 (not overvalued) | |
| Debt/Equity | < 2 (not overleveraged) | |
| Breaking News | None negative | |
| Earnings | Not within 3 days | |

---

## Analysis Commands

### Step 1: Get Overview & Technical Data
```bash
# Replace TICKER with your stock symbol
# Overview (v=111)
curl -s "https://elite.finviz.com/export.ashx?v=111&t=TICKER&auth=$FINVIZ_API_TOKEN"

# Technical (v=171)
curl -s "https://elite.finviz.com/export.ashx?v=171&t=TICKER&auth=$FINVIZ_API_TOKEN"
```

### Step 2: Get Ownership Data
```bash
curl -s "https://elite.finviz.com/export.ashx?v=131&t=TICKER&auth=$FINVIZ_API_TOKEN"
```

### Step 3: Get Financial Data
```bash
curl -s "https://elite.finviz.com/export.ashx?v=161&t=TICKER&auth=$FINVIZ_API_TOKEN"
```

### Step 4: Check Price History (for chart analysis)
```bash
# Daily candles
curl -s "https://elite.finviz.com/quote_export.ashx?t=TICKER&p=d&auth=$FINVIZ_API_TOKEN" | tail -20
```

### Step 5: News Check (CRITICAL)
```bash
# Primary: Finviz
curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN" | head -20
```

**Fallback: Benzinga** (if Finviz rate limited)
```
https://www.benzinga.com/quote/TICKER/news
```
Use WebFetch tool to retrieve and analyze news from Benzinga.

### Step 6: SEC Filings (Optional)
```bash
curl -s "https://elite.finviz.com/export/latest-filings?t=TICKER&o=-filingDate&auth=$FINVIZ_API_TOKEN" | head -10
```

---

## Evaluation Checklist

### Volume & Liquidity
- [ ] Daily change 3-5% (momentum without overextension)
- [ ] Volume above 500K average (liquidity)
- [ ] Mid cap or higher (stability)

### Technical Setup
- [ ] RSI between 40-60 (not overbought)
- [ ] Price within 5% of SMA20 (not extended)
- [ ] Price within 5% of SMA50 (trend aligned)
- [ ] Not within 5% of 52W high (avoid extended)
- [ ] Beta < 1.5 (manageable volatility)
- [ ] Pattern: Consolidation, pullback, or early reversal (NOT extended uptrend)

### Institutional & Insider Support
- [ ] Institutional ownership > 50%
- [ ] Institutional transactions positive (accumulating)
- [ ] Insider transactions positive or neutral (no heavy selling)

### Short Interest
- [ ] Short float < 10% (avoid heavily shorted stocks)
- [ ] Short ratio < 5 days to cover (avoid squeeze risk)

### Fundamentals (Light Check)
- [ ] Profit Margin > 0% (company is profitable)
- [ ] P/E Ratio < 50 (not extremely overvalued)
- [ ] Debt/Equity < 2 (not overleveraged)

### News & Events
- [ ] No analyst downgrades in past week
- [ ] No SEC investigations or law firm notices
- [ ] No earnings announcement within 3 days
- [ ] No major management changes
- [ ] No product recalls or legal issues
- [ ] No guidance cuts

### Green Flags (Bonus)
- [ ] Recent analyst upgrades
- [ ] Positive earnings surprise
- [ ] Insider buying
- [ ] Industry tailwinds
- [ ] Acquisition/expansion news

---

## Technical Pattern Identification

### Consolidation (Best)
- Price moving sideways in tight range
- Decreasing volume (coiling)
- RSI near 50
- Price between SMA20 and SMA50

### Pullback in Uptrend (Good)
- Price pulled back to SMA20 or SMA50
- RSI dropped from overbought (now 40-60)
- Volume decreasing on pullback
- Higher lows maintained

### Early Reversal (Good)
- Price breaking above recent resistance
- RSI crossing above 50
- Volume increasing on breakout
- First close above SMA20

### Extended Uptrend (AVOID)
- Price > 10% above SMA20
- RSI > 70 (overbought)
- Multiple green days in a row
- Volume decreasing on rally

---

## Decision Framework

### BUY Signal
All criteria met:
- Volume, market cap ✅
- Institutional support ✅
- Technical setup (consolidation/pullback/early reversal) ✅
- News clear ✅
- No upcoming earnings ✅

### WATCH Signal
Most criteria met but:
- RSI slightly high (60-70)
- OR price slightly extended (5-10% above SMA20)
- OR minor news concern (needs monitoring)

### SKIP Signal
Any of these:
- Institutional ownership < 50%
- RSI > 70 (overbought)
- Extended uptrend (> 10% above SMA20)
- Within 5% of 52W high (extended)
- Short float > 10% (heavily shorted)
- Short ratio > 5 days (squeeze risk)
- Insider transactions heavily negative
- Negative breaking news
- Earnings within 3 days
- Beta > 2.0
- Profit Margin negative (unprofitable)
- P/E > 100 (extremely overvalued)
- Debt/Equity > 3 (heavily indebted)

---

## Trade Setup

If decision is **BUY**:

| Parameter | Value |
|-----------|-------|
| Entry | Current price or limit near support |
| Stop Loss | 1.5-2× ATR below entry (or 2-3% if ATR unavailable) |
| Target 1 | 5% above entry |
| Target 2 | 8% above entry |
| Hold Time | 2-3 days max |
| Position Size | Max 10% of portfolio |

**ATR-Based Stop Loss Example:**
- If ATR = $0.50 and entry = $25.00
- Stop = $25.00 - (1.5 × $0.50) = $24.25
- This adapts to the stock's actual volatility

---

## Analysis Report Template

```markdown
## [TICKER] Analysis - [DATE]

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Price | $XX.XX | - | - |
| Change | +X.XX% | 3-5% | ✅/❌ |
| Volume | X.XM | >500K | ✅/❌ |
| Inst Own | XX% | >50% | ✅/❌ |
| Inst Trans | +X.XX% | Positive | ✅/❌ |
| Insider Trans | +X.XX% | Not negative | ✅/❌ |
| RSI | XX.XX | 40-60 | ✅/❌ |
| vs SMA20 | +X.XX% | ±5% | ✅/❌ |
| vs SMA50 | +X.XX% | ±5% | ✅/❌ |
| 52W High | -X.XX% | >5% below | ✅/❌ |
| Beta | X.XX | <1.5 | ✅/❌ |
| Short Float | X.XX% | <10% | ✅/❌ |
| Short Ratio | X.X days | <5 days | ✅/❌ |
| Profit Margin | X.XX% | >0% | ✅/❌ |
| P/E Ratio | XX.XX | <50 | ✅/❌ |
| Debt/Equity | X.XX | <2 | ✅/❌ |
| ATR | $X.XX | (for stop calc) | - |

### Technical Pattern
[Consolidation / Pullback / Early Reversal / Extended - AVOID]

### News Check
- [✅/❌] No negative breaking news
- [✅/❌] No earnings within 3 days
- [✅/❌] No analyst downgrades
- [✅/❌] No legal/SEC issues

### Verdict: [BUY / WATCH / SKIP]

### Trade Setup (if BUY)
- Entry: $XX.XX
- Stop: $XX.XX (1.5× ATR or -X%)
- Target: $XX.XX (+X%)
- R/R: X.X:1
```
