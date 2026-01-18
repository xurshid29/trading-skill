# Single Stock Analysis Template

Use this template when you have a specific ticker and want to evaluate it for a swing trade entry.

**Note:** When analyzing a specific stock, the price is already accepted by the user. Focus on technical setup, institutional support, and news - not price range.

## Quick Criteria Check

| Criteria | Target | Status |
|----------|--------|--------|
| Daily Change | 3-5% (momentum, not overextended) | |
| Institutional Ownership | > 50% | |
| Institutional Transactions | Positive | |
| Average Volume | > 500K | |
| Market Cap | Mid cap+ | |
| RSI | 40-60 (not overbought) | |
| vs SMA20 | -5% to +5% (not extended) | |
| Beta | < 1.5 (manageable risk) | |
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
curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN" | head -20
```

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
- [ ] Beta < 1.5 (manageable volatility)
- [ ] Pattern: Consolidation, pullback, or early reversal (NOT extended uptrend)

### Institutional Support
- [ ] Institutional ownership > 50%
- [ ] Institutional transactions positive (accumulating)

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
- Negative breaking news
- Earnings within 3 days
- Beta > 2.0

---

## Trade Setup

If decision is **BUY**:

| Parameter | Value |
|-----------|-------|
| Entry | Current price or limit near support |
| Stop Loss | 2-3% below entry |
| Target 1 | 5% above entry |
| Target 2 | 8% above entry |
| Hold Time | 2-3 days max |
| Position Size | Max 10% of portfolio |

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
| RSI | XX.XX | 40-60 | ✅/❌ |
| vs SMA20 | +X.XX% | ±5% | ✅/❌ |
| Beta | X.XX | <1.5 | ✅/❌ |

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
- Stop: $XX.XX (-X%)
- Target: $XX.XX (+X%)
- R/R: X.X:1
```
