# SMC Single Stock Analysis Template

Use this template when you have a specific ticker and want to evaluate it for a swing trade entry using **Smart Money Concepts (SMC)**.

This strategy combines our fundamental/technical criteria with institutional order flow analysis for higher-probability entries.

**Core Principle:** Enter AFTER Smart Money has swept liquidity, not before becoming the liquidity.

---

## Phase 1: Standard Criteria Check

*These criteria filter for quality stocks. All must pass before SMC analysis.*

| Criteria | Target | Status |
|----------|--------|--------|
| Institutional Ownership | > 50% | |
| Institutional Transactions | Positive | |
| Insider Transactions | Positive or neutral | |
| Average Volume | > 500K | |
| Market Cap | Mid cap+ | |
| Beta | < 1.5 | |
| Short Float | < 10% | |
| Short Ratio | < 5 days | |
| Profit Margin | > 0% | |
| P/E Ratio | < 50 | |
| Debt/Equity | < 2 | |
| Breaking News | None negative | |
| Earnings | Not within 3 days | |

---

## Phase 2: SMC Market Structure Analysis

### Step 1: Daily Chart - Establish Bias

**Identify the Trend:**
- [ ] **Bullish:** Higher Highs (HH) + Higher Lows (HL)
- [ ] **Bearish:** Lower Lows (LL) + Lower Highs (LH)
- [ ] **Ranging:** Equal Highs and Equal Lows

**Identify the Draw on Liquidity (Target):**
| Liquidity Type | Location | Description |
|----------------|----------|-------------|
| Buy-Side Liquidity (BSL) | Above swing highs | Stop losses of shorts + breakout buy orders |
| Sell-Side Liquidity (SSL) | Below swing lows | Stop losses of longs + breakout sell orders |
| Equal Highs (EQH) | Double/triple tops | High-probability target for longs |
| Equal Lows (EQL) | Double/triple bottoms | High-probability target for shorts |

**Record:**
- Daily Bias: [Bullish / Bearish / Ranging]
- Draw on Liquidity: $_____ (target level)
- Key Swing High: $_____
- Key Swing Low: $_____

---

### Step 2: 4-Hour Chart - Identify Entry Zone (Point of Interest)

**Locate Order Blocks:**

*Bullish Order Block (for long entries):*
- The LAST RED (bearish) candle before a strong move up that breaks structure
- Must have caused a Break of Structure (BOS) or Change of Character (CHoCH)
- Stronger if followed by a Fair Value Gap

*Bearish Order Block (for short entries):*
- The LAST GREEN (bullish) candle before a strong move down that breaks structure

**Order Block Validation Checklist:**
- [ ] Did it cause a BOS/CHoCH?
- [ ] Is there a Fair Value Gap after it?
- [ ] Did it sweep liquidity before forming?

**Locate Fair Value Gaps (FVG):**

*3-Candle Pattern:*
1. Candle 1: Setup candle
2. Candle 2: Large expansion candle
3. Candle 3: Continuation candle

*FVG exists when:* Candle 1's wick doesn't overlap with Candle 3's wick

**Record:**
- 4H Order Block Zone: $_____ to $_____
- 4H Fair Value Gap: $_____ to $_____
- Consequent Encroachment (50% of FVG): $_____

---

### Step 3: 1H/15M Chart - Entry Confirmation

**Wait for price to reach the 4H Point of Interest, then confirm:**

**The SMC Entry Trigger Sequence:**

1. **SWEEP** - Did price sweep a short-term low/high?
   - [ ] Price wicked below a recent swing low (for longs)
   - [ ] This triggered retail stop losses (liquidity grab)

2. **SHIFT** - Did market structure shift?
   - [ ] Price broke above the last swing high (CHoCH for longs)
   - [ ] This is the first sign of reversal

3. **DISPLACEMENT** - Was the break aggressive?
   - [ ] Large-bodied candle on the break
   - [ ] Above-average volume on the break
   - [ ] Fair Value Gap left behind

4. **RETURN** - Entry zone identified
   - [ ] 15M Fair Value Gap created
   - [ ] Or new 15M Order Block formed

**Confirmation Checklist:**
- [ ] Liquidity swept (stop hunt completed)
- [ ] CHoCH/MSS printed on 15M
- [ ] Displacement candle with volume
- [ ] Entry zone (FVG/OB) identified

---

## Phase 3: Trade Execution

### Entry Methods

**Method 1: Limit Order at FVG (Aggressive)**
- Entry: 50% level of the 15M FVG (Consequent Encroachment)
- Pro: Better price
- Con: May not fill if momentum is strong

**Method 2: Limit Order at Order Block (Conservative)**
- Entry: Top of the Order Block (proximal line)
- Pro: Higher probability of fill
- Con: Slightly worse price

**Method 3: Market Order on CHoCH (Confirmation)**
- Entry: Immediately after CHoCH candle closes
- Pro: Confirmed reversal
- Con: May miss some of the move

### Stop Loss Placement

**Structural Stop (SMC Method):**
- Place stop below the **swept low** (Strong Low)
- This is the low that caused the CHoCH
- If price breaks this, the setup is invalid

**Formula:**
```
Stop Loss = Swept Low - (1 × ATR)
```

**Example:**
- Swept Low: $24.50
- ATR (14): $0.40
- Stop Loss: $24.50 - $0.40 = $24.10

### Take Profit Targets (Liquidity-Based)

**Target 1: Internal Liquidity (50% position)**
- First trouble area: 4H FVG, previous day high, minor resistance
- Move stop to breakeven after T1 hit

**Target 2: External Liquidity (50% position)**
- The "Draw on Liquidity" identified in Step 1
- Equal Highs, Daily FVG, major swing high

| Target | Location | Action |
|--------|----------|--------|
| T1 | Internal liquidity (4H level) | Sell 50%, move stop to BE |
| T2 | External liquidity (Daily level) | Sell remaining 50% |

---

## Phase 4: SMC Pattern Recognition

### High-Probability Long Setups

**1. Liquidity Sweep + CHoCH (Best)**
```
Pattern:
1. Price in uptrend (Daily HH/HL)
2. Pullback sweeps a swing low (grabs liquidity)
3. 15M prints CHoCH with displacement
4. Entry at 15M FVG/OB
5. Target: Previous high or equal highs
```

**2. Order Block Retest**
```
Pattern:
1. Strong move up creates BOS
2. Identifies bullish Order Block (last red candle)
3. Price retraces to Order Block
4. 15M shows rejection/CHoCH at OB
5. Entry at OB with stop below
```

**3. Fair Value Gap Fill**
```
Pattern:
1. Aggressive move up leaves FVG
2. Price retraces into FVG
3. Reaction at 50% (CE) or full fill
4. 15M confirmation
5. Entry at FVG with stop below
```

### Setups to AVOID

**1. No Liquidity Sweep**
- Price hasn't swept a recent low
- You may become the liquidity

**2. Chasing Displacement**
- Entering after a large move without retracement
- No Order Block or FVG to reference

**3. Trading Against HTF Bias**
- 15M shows bullish but Daily is bearish
- Always align with higher timeframe

**4. Equal Lows as Support (for longs)**
- Equal lows are liquidity targets, not support
- Price will likely sweep them before reversing

---

## Analysis Commands

### Step 1: Get Overview & Technical Data
```bash
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

### Step 4: Get Price History (for structure analysis)
```bash
# Daily candles - last 30 days
curl -s "https://elite.finviz.com/quote_export.ashx?t=TICKER&p=d&auth=$FINVIZ_API_TOKEN" | tail -30
```

### Step 5: News Check
```bash
curl -s "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN" | head -20
```

---

## Decision Framework

### SMC BUY Signal
All conditions met:
- [ ] Phase 1 criteria pass (fundamentals/ownership)
- [ ] Daily bias is bullish (HH/HL)
- [ ] Price at 4H Point of Interest (OB/FVG)
- [ ] Liquidity swept on lower timeframe
- [ ] 15M CHoCH with displacement
- [ ] Entry zone identified (FVG/OB)
- [ ] News clear

### SMC WATCH Signal
Most conditions met but:
- [ ] No liquidity sweep yet (wait for sweep)
- [ ] OR no 15M CHoCH yet (wait for confirmation)
- [ ] OR price not at POI yet (wait for retracement)

### SMC SKIP Signal
Any of these:
- [ ] Phase 1 criteria fail
- [ ] Daily bias unclear or against trade
- [ ] At equal lows (will likely be swept)
- [ ] Extended from Order Block (chasing)
- [ ] No clear liquidity target

---

## Risk Management

### Position Sizing (1% Rule)
```
Max Risk = Account Size × 1%
Shares = Max Risk ÷ (Entry - Stop)
```

**Example:**
- Account: $25,000
- Max Risk: $250
- Entry: $25.00
- Stop: $24.10 (below swept low)
- Risk per share: $0.90
- Shares: $250 ÷ $0.90 = 277 shares
- Position Size: $6,925 (27.7% of account)

### Correlation Risk
- Don't take multiple positions in same sector
- If correlated, split the 1% risk across them

---

## SMC Analysis Report Template

```markdown
## [TICKER] SMC Analysis - [DATE]

### Phase 1: Criteria Check
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Inst Own | XX% | >50% | ✅/❌ |
| Inst Trans | +X.XX% | Positive | ✅/❌ |
| Short Float | X.XX% | <10% | ✅/❌ |
| Beta | X.XX | <1.5 | ✅/❌ |
| Profit Margin | X.XX% | >0% | ✅/❌ |
| News | Clear | No negative | ✅/❌ |

### Phase 2: SMC Structure

**Daily Bias:** [Bullish / Bearish]
**Draw on Liquidity:** $XX.XX (Equal Highs / FVG / Swing High)

**4H Point of Interest:**
- Order Block: $XX.XX - $XX.XX
- Fair Value Gap: $XX.XX - $XX.XX

### Phase 3: Entry Confirmation (15M)

| Trigger | Status |
|---------|--------|
| Liquidity Swept | ✅/❌ (swept $XX.XX low) |
| CHoCH Printed | ✅/❌ (broke $XX.XX high) |
| Displacement | ✅/❌ (volume spike) |
| Entry Zone | ✅/❌ (FVG at $XX.XX) |

### Verdict: [SMC BUY / WATCH / SKIP]

### Trade Setup (if SMC BUY)
| Parameter | Value |
|-----------|-------|
| Entry | $XX.XX (at 15M FVG/OB) |
| Stop | $XX.XX (below swept low - ATR) |
| Target 1 | $XX.XX (internal liquidity) |
| Target 2 | $XX.XX (external liquidity) |
| Risk | $XXX (1% of account) |
| Shares | XXX |
| R:R | X.X:1 |
```

---

## SMC Glossary

| Term | Definition |
|------|------------|
| **BOS** | Break of Structure - candle body closes beyond swing point in trend direction |
| **CHoCH** | Change of Character - first BOS against the trend (reversal signal) |
| **MSS** | Market Structure Shift - same as CHoCH |
| **OB** | Order Block - last opposite candle before displacement |
| **FVG** | Fair Value Gap - price imbalance (3-candle pattern with no overlap) |
| **CE** | Consequent Encroachment - 50% level of FVG |
| **BSL** | Buy-Side Liquidity - stops above highs |
| **SSL** | Sell-Side Liquidity - stops below lows |
| **EQH/EQL** | Equal Highs/Lows - liquidity pools (targets, not support/resistance) |
| **POI** | Point of Interest - zone where we expect price to react |
| **Displacement** | Aggressive move with large candles and gaps |
| **Mitigation** | Price returning to OB to fill remaining orders |
| **Sweep** | Price moves through a level to grab liquidity then reverses |
| **HTF** | Higher Timeframe (Daily, Weekly) |
| **LTF** | Lower Timeframe (1H, 15M) |

---

## Timeframe Alignment

| Function | Timeframe | What to Look For |
|----------|-----------|------------------|
| **Narrative** | Daily | Trend direction, Draw on Liquidity |
| **Setup** | 4-Hour | Order Blocks, Fair Value Gaps |
| **Entry** | 15-Minute | Liquidity sweep, CHoCH, Displacement |

**Rule:** Never trade against the Daily bias. Use 4H for setup, 15M for precision.
