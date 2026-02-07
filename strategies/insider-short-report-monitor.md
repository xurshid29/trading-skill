# Insider Selling & Short-Seller Report Monitor

## Strategy Type

| Parameter | Value |
|-----------|-------|
| **Purpose** | Risk detection and safety screening |
| **When to Use** | As supplement to swing/momentum screener, or standalone via `insider check TICKER` |
| **Trigger** | insider_trans < -3%, short_float > 10%, or suspicious news |
| **Output** | Risk score (LOW / MODERATE / HIGH / CRITICAL) + action recommendation |

---

## Strategy Workflow Overview

Two-phase approach: Quick Screen runs automatically during screening, Deep Dive runs manually for flagged stocks.

```
┌─────────────────────────────────────────────────────────────────┐
│              INSIDER & SHORT REPORT MONITOR                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: Quick Screen (runs during screener Step 4.5)          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 1: Ownership Data Check (insider_trans_pct)         │   │
│  │    ↓ If insider_trans < -3% OR short_float > 10%         │   │
│  │ Step 2: SEC Filings Check (Form 4, Form 144, S-3)       │   │
│  │    ↓                                                    │   │
│  │ Step 3: News Scan (short-seller keywords)                │   │
│  │    ↓                                                    │   │
│  │ Step 4: Risk Score Assignment → tier adjustment          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                     │
│  PHASE 2: Deep Dive (manual, for flagged stocks only)           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Step 5: Form 4 Analysis (WHO, HOW MUCH, PATTERN)        │   │
│  │    ↓                                                    │   │
│  │ Step 6: Dilution Pipeline Check (S-3, revenue ratio)     │   │
│  │    ↓                                                    │   │
│  │ Step 7: Short-Seller Report Credibility Assessment       │   │
│  │    ↓                                                    │   │
│  │ Step 8: Final Risk Verdict + Compound Risk Check         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Principle:** Most stocks will pass Phase 1 with no flags. Phase 2 is only for stocks that trigger concern. This avoids adding latency to every screening run.

---

## Phase 1: Quick Screen

### Step 1: Ownership Data Check

Already fetched during the screener's ownership step (v=131). Check these fields:

| Field | Trigger Threshold | Action |
|-------|-------------------|--------|
| `insider_trans_pct` | < -3% | Proceed to Step 2 |
| `short_float_pct` | > 10% | Proceed to Step 3 |
| Both clean | insider_trans >= -3%, short_float <= 10% | PASS - skip remaining steps |

### Step 2: SEC Filings Check

```bash
source .env

# Fetch SEC filings for flagged tickers
for ticker in FLAGGED_TICK1 FLAGGED_TICK2; do
  echo "=== $ticker SEC Filings ===" && \
  curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export/latest-filings?t=$ticker&o=-filingDate&auth=$FINVIZ_API_TOKEN" | head -15
  sleep 1
done
```

**What to look for in filings output:**

| Filing Type | What It Means | Concern Level |
|-------------|---------------|---------------|
| **Form 4** | Insider ownership change (buy or sell) | Check count in last 90 days |
| **Form 144** | Intent to sell restricted shares | HIGH if C-suite filed |
| **S-3 / S-3A** | Shelf registration to raise capital | Check amount vs revenue |
| **S-3ASR** | Automatic shelf (large companies) | MODERATE |
| **424B** | Prospectus supplement (active offering) | HIGH - dilution in progress |
| **8-K** | Material events | Read description for context |

**Quick decision:**

| Finding | Action |
|---------|--------|
| No Form 4s in 90 days, no Form 144, no S-3 | PASS |
| 1-2 Form 4s from directors, small amounts | Note in newsNotes, continue |
| 3+ Form 4s in 30 days | Flag for Phase 2 Deep Dive |
| Form 144 from CEO/CFO | Flag for Phase 2 |
| S-3 filed in last 6 months | Flag for Phase 2 |

### Step 3: News Scan for Short-Seller Reports

Already fetched during the screener's news check. Scan headlines for these keywords:

**Short-seller firm names:**
- hindenburg, muddy waters, citron, jcapital, grizzly research
- kerrisdale, scorpion capital, blue orca, spruce point, wolfpack

**Short-seller report keywords:**
- "short seller", "short report", "activist short"
- "cash incinerator", "house of cards", "ponzi", "overvalued"
- "forensic analysis", "accounting irregularit"

**Dilution keywords:**
- "shelf registration", "stock offering", "secondary offering"
- "share issuance", "equity raise", "dilution"

**If any match found:** Flag for Phase 2 Deep Dive.

### Step 4: Risk Score Assignment

Based on Quick Screen findings, assign initial risk:

| Finding | Initial Risk | Tier Action |
|---------|-------------|-------------|
| All clean | LOW (0-3) | No change |
| Minor director selling, no clusters | MODERATE (4-6) | Downgrade to WATCH, add watchReason |
| Clustered Form 4s or S-3 or short report detected | HIGH (7+) | Downgrade to SKIP |

---

## Phase 2: Deep Dive

Run this for stocks flagged in Phase 1, or when manually running `insider check TICKER`.

### Step 5: Form 4 Analysis

#### 5a: Fetch Detailed Insider Data

```bash
source .env

# SEC Filings from Finviz
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export/latest-filings?t=TICKER&o=-filingDate&auth=$FINVIZ_API_TOKEN"

# Ownership data
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=131&t=TICKER&auth=$FINVIZ_API_TOKEN"

# News (for context)
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/news_export.ashx?v=3&t=TICKER&auth=$FINVIZ_API_TOKEN"
```

For deeper Form 4 details (who sold, how much, holdings remaining), use these sources via WebFetch:

```
# OpenInsider - summary of all insider transactions
https://openinsider.com/screener?s=TICKER

# SecForm4 - detailed Form 4 filings
https://www.secform4.com/insider-trading/TICKER.htm

# MarketBeat - insider trades summary
https://www.marketbeat.com/stocks/NASDAQ/TICKER/insider-trades/
```

#### 5b: Insider Selling Severity Scoring

Score each insider transaction, then sum for overall risk.

**Who is selling:**

| Role | Points | Reasoning |
|------|--------|-----------|
| CEO / President / Chairman | +4 | Highest signal -- knows most about company |
| CFO / Treasurer | +3 | Financial officer selling is alarming |
| COO / CTO / CSO | +2 | Operational knowledge |
| Director / Board Member | +1 | Governance role, less daily insight |
| VP / SVP | +1 | Mid-level executive |

**How much (% of direct holdings sold):**

| % of Holdings | Points | Reasoning |
|---------------|--------|-----------|
| > 50% | +4 | Liquidating position (APLD CFO sold 53%) |
| 20-50% | +3 | Significant reduction |
| 10-20% | +2 | Moderate sale |
| < 10% | +1 | Routine diversification |

**Selling pattern:**

| Pattern | Points | Reasoning |
|---------|--------|-----------|
| Sell-then-resign (sold + resigned within 60 days) | +4 | Strongest red flag (ONDS Ron Stern) |
| Clustered (3+ insiders within 30 days) | +3 | Coordinated exit (APLD Oct wave) |
| Selling into 52W high / after big rally | +2 | Taking profits before expected decline |
| Single isolated sale | +0 | Normal |

**Sale type:**

| Type | Points | Reasoning |
|------|--------|-----------|
| Discretionary open-market sale | +2 | Voluntary choice |
| Not on 10b5-1 plan | +1 | Not pre-scheduled |
| On 10b5-1 plan | +0 | Pre-scheduled, less alarming |
| Tax obligation / option exercise cover | -1 | Required, not predictive |

**Finviz insider_trans_pct (overall metric):**

| Range | Points |
|-------|--------|
| < -20% | +3 |
| -10% to -20% | +2 |
| -3% to -10% | +1 |
| >= -3% | +0 |

#### 5c: Score Interpretation

| Total Score | Risk Level | Action |
|-------------|------------|--------|
| 0-3 | **LOW** | Proceed normally, no tier change |
| 4-6 | **MODERATE** | Downgrade to WATCH, add watchReason |
| 7-10 | **HIGH** | Downgrade to SKIP unless strong counterarguments |
| 11+ | **CRITICAL** | Immediate SKIP |

#### 5d: Example Scoring

**ONDS - Ron Stern:**
- Director selling (+1) + sold 53% of options (+4) + sell-then-resign (+4) + discretionary (+2) + not 10b5-1 (+1) + insider_trans < -20% (+3) = **15 points → CRITICAL**

**APLD - CEO Wes Cummins:**
- CEO selling (+4) + sold <5% of total holdings (+1) + selling into strength (+2) + discretionary (+2) + insider_trans < -10% (+2) = **11 points → CRITICAL**
- BUT: retains 22M+ shares, received 1.5M RSUs → mitigating factor (see Green Flags)

**APLD - Director small sale under 10b5-1:**
- Director (+1) + <10% holdings (+1) + single sale (+0) + 10b5-1 (+0) + insider_trans > -3% (+0) = **2 points → LOW**

#### 5e: Analysis Table Template

```markdown
### Insider Transaction Summary

| Insider | Title | Type | Shares | Value | % Holdings | Date | 10b5-1 | Score |
|---------|-------|------|--------|-------|------------|------|--------|-------|
| Name | CEO | Sale | 100K | $2.5M | 15% | Jan 15 | No | +9 |
| Name | Dir | Sale | 10K | $250K | 3% | Jan 20 | Yes | +2 |

**Overall insider risk score:** X → RISK_LEVEL
**Key patterns detected:** [list flags]
```

### Step 5 Flags Reference

**Red Flags (HIGH/CRITICAL):**
- CEO or CFO sold > 20% of holdings in discretionary sale
- 3+ insiders sold within same 30-day window
- Insider resigned within 60 days of large sale
- Form 144 filed for large amount by C-suite
- insider_trans_pct < -10% AND no 10b5-1 plan disclosed
- Selling into price strength while short interest rising
- Zero insider purchases in 12+ months during stock rally (APLD pattern)

**Yellow Flags (MODERATE):**
- Director sold small percentage (< 10% of holdings)
- 10b5-1 pre-scheduled sales executing
- Tax obligation sales after option exercise
- insider_trans_pct between -3% and -10%
- Single insider sale without cluster pattern

**Green Flags (reduce score by 1-2 points):**
- Any insider BUYING on open market (strongest bullish signal)
- Insiders holding after vesting (chose not to sell)
- Institutional transactions increasing while insiders sell modestly
- CEO/CFO retains > 80% of holdings after sale
- insider_trans_pct > 0%

---

### Step 6: Dilution Pipeline Check

#### 6a: S-3 Shelf Registration Detection

In SEC filings output, look for these form types:

| Filing Type | What It Means | Risk Level |
|-------------|---------------|------------|
| S-3 (initial) | Filed shelf registration, may raise capital | MODERATE |
| S-3/A (amendment) | Updating terms, offering may be imminent | HIGH |
| S-3ASR (automatic shelf) | Large company, can issue immediately | LOW-MODERATE |
| 424B (prospectus supplement) | Active offering in progress | HIGH |

#### 6b: Revenue vs. Capital Raised Ratio

This detects the "ONDS pattern" -- companies that raise far more capital than they earn.

```bash
# Get financial data for revenue
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=161&t=TICKER&auth=$FINVIZ_API_TOKEN"
```

| Ratio (Capital Raised : Annual Revenue) | Interpretation |
|-----------------------------------------|----------------|
| < 1:1 | Normal -- raising less than revenue |
| 1:1 to 3:1 | Caution -- growth stage or large project |
| 3:1 to 10:1 | Warning -- may be burning cash faster than earning |
| > 10:1 | **CRITICAL** -- ONDS pattern ($829M raised vs $7.2M revenue = 115:1) |

**How to calculate:**
1. Find S-3 shelf amount from filing or news
2. Get annual revenue from Finviz financial data (v=161) or recent earnings
3. Divide: Capital / Revenue = ratio
4. Flag if > 10:1

#### 6c: Share Count Monitoring

Compare "Outstanding" and "Float" from ownership data (v=131) across screening dates.

| Signal | Risk |
|--------|------|
| Outstanding shares up > 10% in 6 months | HIGH |
| Float increasing faster than outstanding | MODERATE (lockup expiry) |
| Outstanding flat or decreasing (buybacks) | GREEN FLAG |

---

### Step 7: Short-Seller Report Credibility Assessment

#### 7a: Known Activist Short-Seller Firms

| Firm | Track Record | Common Targets | Typical Impact |
|------|-------------|----------------|----------------|
| **Hindenburg Research** | High-profile hits (Adani, Nikola, Super Micro) | Fraud, governance | -20% to -60% |
| **Muddy Waters** (Carson Block) | Chinese fraud pioneers | Accounting fraud | -15% to -40% |
| **Citron Research** (Andrew Left) | Prolific, mixed record | Overvalued stocks | -10% to -25% |
| **JCapital Research** | Asia-focused | Revenue fraud, cash burn | -15% to -30% |
| **Grizzly Research** | Tech/China | Fake metrics, governance | -10% to -25% |
| **Kerrisdale Capital** | Quant-focused | Overvaluation | -5% to -15% |
| **Scorpion Capital** | Biotech/tech | Clinical trial fraud | -20% to -50% |
| **Blue Orca Capital** | Asia-Pacific | Accounting irregularities | -10% to -25% |
| **Spruce Point Capital** | Forensic accounting | Hidden liabilities | -10% to -20% |
| **Wolfpack Research** | Mid-cap companies | Revenue manipulation | -10% to -25% |

#### 7b: Credibility Scoring

When a short report is detected, assess before acting:

| Factor | Points | Description |
|--------|--------|-------------|
| Firm has successful track record | +3 | Hindenburg, Muddy Waters proven |
| Report includes primary source evidence (SEC filings, whistleblowers) | +2 | Verifiable claims |
| Claims independently verifiable from public data | +2 | Financials don't add up |
| Company has no credible rebuttal within 48 hours | +2 | Silence or weak denial |
| Multiple short firms or analysts piling on | +2 | Confirmation |
| Firm is unknown / no track record | -2 | Could be manipulation |
| Report relies on opinion, not data | -2 | Weak analysis |
| Company issues detailed point-by-point rebuttal | -2 | Credible defense |
| Stock has very low float (easy to manipulate) | -1 | Could be short-and-distort |
| Independent analysts defend company with data | -1 | Counterbalance |

| Credibility Score | Risk Level | Action |
|-------------------|------------|--------|
| 7+ | **CRITICAL** | Treat as genuine risk, SKIP |
| 4-6 | **HIGH** | Downgrade to SKIP, monitor for rebuttal |
| 1-3 | **MODERATE** | Downgrade to WATCH, add watchReason |
| 0 or below | **LOW** | Likely manipulation, note but don't downgrade |

---

### Step 8: Compound Risk Assessment

When insider selling coincides with short reports or dilution, damage compounds exponentially. This is the ONDS pattern.

| Scenario | Risk Level | Historical Impact |
|----------|------------|-------------------|
| Short report alone (no insider selling) | MODERATE | Stock recovers in weeks if baseless |
| Insider selling alone (no short report) | MODERATE | Slow trust erosion, 3-11% drops per disclosure |
| **Short report + active insider selling** | **CRITICAL** | Trust collapse, -20% to -50% in days |
| **Short report + insider selling + S-3 dilution** | **EXTREME** | Full exodus (ONDS: -32% in 10 days) |
| Insider selling + S-3 dilution (no short report) | HIGH | Market may front-run the short thesis |

**Compound Risk Formula:**
```
If (insider risk score >= 4) AND (short report credibility >= 4):
    → CRITICAL: Immediate SKIP

If (insider risk score >= 4) AND (S-3 capital:revenue > 10:1):
    → HIGH: Downgrade to SKIP

If (short report detected) AND (S-3 capital:revenue > 10:1):
    → CRITICAL: Immediate SKIP
```

### "Powder Keg" Detection (Pre-Attack Profile)

Some stocks haven't been hit by a short report yet but have the exact profile that attracts one. Identifying these early can save you from being caught in the blast.

**A stock is a "Powder Keg" when 3+ of these conditions are true:**

| Condition | What It Signals |
|-----------|----------------|
| Short float > 20% | Shorts already building large positions |
| Insider selling by all/most insiders | Universal lack of insider confidence |
| Zero insider purchases in 12+ months | No insider willing to buy at any price |
| P/S ratio > 30x or P/E negative | Easy overvaluation narrative for short report |
| Revenue < operating expenses | "Cash burn" attack angle |
| Recent S-3 or large equity raise | Dilution ammunition |
| Stock near or recently at 52W high | Maximum damage potential from peak |

**When you identify a Powder Keg:**
- Do NOT assign BUY tier regardless of other technicals
- Assign WATCH at best, with watchReason noting the powder keg profile
- Monitor weekly for short-seller firm mentions in news
- If any short report surfaces → immediately SKIP

---

## Real-World Case Studies

### Case Study 1: ONDS (Ondas Holdings) - The "Short & Distort" Full Pattern

**Timeline:**
```
Nov 26: Ron Stern sells 850K shares ($6.7M)         → Stock -4%
Dec 12: Ron Stern resigns from board                  → Stock -12%
Dec 19: Stern files to sell remaining 750K shares
Dec 22: 4 more insiders sell (directors + CFO)        → Stock -5%
Dec 31: CEO Brock sells 475K shares ($4.6M)
Jan 28: S-3 shelf registration for $1B announced
Feb 3:  Asia-Pacific defense contract + Rotron Aero acquisition announced (positive news)
Feb 4:  JCapital short report drops INTO the good news → Stock -15%
Feb 5:  Continued selling, 79M volume               → Stock -11%
         10-day total:                                → Stock -33%
```

**Scores:**
- Insider risk: 15+ (CRITICAL) - sell-then-resign, clustered, CEO selling
- Short report credibility: 7+ (CRITICAL) - JCapital has track record, verifiable dilution claims
- Dilution: CRITICAL - $829M raised vs $7.2M revenue (115:1 ratio)
- Compound risk: EXTREME

**The Short & Distort Tactic (how JCapital executed):**

Short sellers often employ a calculated tactical strike:

1. **Wait for Peak Hype** — ONDS had rallied ~400% and just announced defense contracts. Sentiment was high, providing liquidity to short into.
2. **Time the Release** — Report dropped the day after good news, flipping the narrative from "Growth Company" to "Dilution Machine."
3. **Weaponize Insider Selling** — JCapital used CEO's $4.6M Dec 31 sale as "proof" that management doesn't believe in the stock. The prior insider selling (Stern's $13.5M + resignation) had already eroded trust.
4. **Highlight Verifiable Red Flags** — The $829M raised vs $7.2M revenue (115:1 ratio) is factual, not fabrication. The best short reports use real data.

**What typically happens after a short report:**

| Phase | Timeframe | What to Watch |
|-------|-----------|---------------|
| Impact | Day 1-3 | Sharp drop 15-30%, high volume |
| Rebuttal window | Day 2-5 | Does company issue detailed point-by-point response? |
| Battleground | Day 3-10 | Stock volatile as bulls vs. shorts fight |
| Resolution | Week 2-4 | Either recovery (if rebuttal credible) or continued decline |

**Key indicators for resolution:**
- Company issues strong rebuttal with data → credibility score drops, potential bounce
- Insider BUYING appears after the dip → strongest recovery signal
- Company stays silent or gives weak denial → confirms thesis, more downside
- Additional short firms pile on → accelerates decline

**Lesson:** Each event amplified the next. Insider selling eroded trust → short report landed on fertile ground → dilution fears prevented recovery. The timing into positive news was deliberate — short sellers use liquidity from buyers to establish positions, then release the report to crash the price and cover cheaper.

### Case Study 2: APLD (Applied Digital) - The "Powder Keg" Pattern

A stock with all the preconditions for a short attack but no report has dropped yet. This is what a pre-attack profile looks like.

**Insider Selling Timeline:**
```
May 2025: Directors sell at $6.50-7.00 ($288K)
Aug 2025: 5 insiders sell ($2.4M) at $12-15
Sep 2025: CEO + CFO + director sell ($7.2M) at $15
Oct 2025: 6 insiders sell ($12.9M) at $33-35 - CFO sells 53% of holdings
Nov 2025: 3 directors sell ($415K) at $23-27
Jan 2026: CEO sells $6M, 3 directors sell ($3M) near 52W high
Jan 29:  Director Hastings sells at $38.57 (day after 52W high of $42.27)
         Zero insider purchases in 12 months
         Total: ~$31M across 23+ transactions
```

**Why APLD is a short-seller target (Powder Keg Profile):**

| Factor | APLD Value | Target Threshold |
|--------|-----------|-----------------|
| Short float | 27-31% | >25% = shorts already positioned |
| P/S ratio | 72.5x | Extreme overvaluation narrative |
| Profitable? | No (-$0.11 EPS) | Easy to attack fundamentals |
| Insider selling | $31M, all insiders, zero buying | "If insiders don't believe, why should you?" |
| Revenue growth | +250% YoY | Counter-narrative for bulls |
| Analyst sentiment | 10/12 Strong Buy, $48.82 target | Creates tension with short thesis |

**Scores:**
- Insider risk: 11+ (CRITICAL) - all insiders selling, CFO 53% liquidation, clustered waves
- Short report: None yet - but profile matches typical targets
- Short interest: 27-31% float (VERY HIGH - most shorted tech stock in Dec 2025)
- Dilution: None detected (no S-3 filed)
- Impact so far: 5-11% drops on each Form 4 disclosure cluster

**Feb 2026 price action:**
- Peaked at $42.27 on Jan 28 (52W high)
- Director Hastings sells at $38.57 on Jan 29 → stock -11%
- Qualcomm weak outlook + AI spending fears → sector drag
- Down to ~$28.91 by Feb 5 → worst day in a year
- Down 12.8% since last earnings report

**The squeeze vs. report dynamic:**

Unlike ONDS, APLD has a two-sided risk profile:

| Scenario | Trigger | Expected Impact |
|----------|---------|-----------------|
| **Bear: Short report drops** | Credible firm publishes on valuation + insider selling | -20% to -40% (ONDS pattern) |
| **Bull: Short squeeze** | Revenue beats + new contracts → shorts forced to cover 80M shares | +30% to +50% rally |
| **Neutral: Slow bleed** | No catalyst, continued insider selling, each Form 4 = -5% | Gradual decline to $20-25 |

**Lesson:** APLD shows that a stock can have CRITICAL insider risk without a short report and still suffer "death by a thousand cuts." But the 27-31% short float creates explosive potential in both directions. Monitor for: (1) any short-seller firm mentioning APLD, (2) any insider purchases (strongest reversal signal), (3) next earnings report as catalyst for squeeze or breakdown.

### Case Study Comparison: ONDS vs APLD

| Factor | ONDS (attacked) | APLD (vulnerable) |
|--------|-----------------|-------------------|
| Short report | JCapital (published Feb 4) | None yet |
| Insider selling total | $19M in 5 weeks | $31M over 9 months |
| Sell-then-resign | Yes (Ron Stern) | No |
| Revenue vs capital raised | 115:1 (CRITICAL) | N/A (no S-3 filed) |
| Revenue growth | Minimal ($7.2M) | +250% YoY ($126.6M) |
| Analyst sentiment | Mixed | 10/12 Strong Buy |
| Short float | Lower | 27-31% (much higher) |
| P/S ratio | High | 72.5x (extreme) |
| Profitable | No | No |
| Post-event outcome | -33% in 10 days | -30% from peak (ongoing) |
| **Key differentiator** | Dilution killed it | Revenue growth may save it |

---

## Integration with Existing Strategies

### Use with Swing Trade Screener

This runs as **Step 4.5** in the swing screener workflow (between News Check and Final Selection).

**Trigger:** Only for tickers where `insider_trans_pct < -3%` OR `short_float_pct > 10%` from ownership data.

**If no tickers are flagged:** Skip Step 4.5 entirely.

See [swing-trade-screener.md](swing-trade-screener.md) Step 4.5 for the integrated workflow.

### Use with Single Stock Analysis

This runs as an expanded **Step 6** (SEC Filings & Insider Activity) in the single stock analysis.

See [single-stock-analysis.md](single-stock-analysis.md) Step 6 for the integrated workflow.

### Standalone Use

Run directly with: `insider check TICKER`

This runs the full Phase 1 + Phase 2 analysis for a single stock and produces the complete risk assessment.

### Tier Escalation Rules

| Current Tier | Finding | New Tier |
|-------------|---------|----------|
| BUY | Insider risk score 4-6 | WATCH |
| BUY | Insider risk score 7+ | SKIP |
| BUY | Short report credibility 4+ | SKIP |
| BUY | Compound risk (insider + short) | SKIP |
| WATCH | Insider risk score 7+ | SKIP |
| WATCH | Short report credibility 4+ | SKIP |
| WATCH | Compound risk (any combination) | SKIP |
| Any | Insider risk 0-3, no short report | No change |

### Updated watchReason Templates

```
"Insider selling: [NAME] ([TITLE]) sold [SHARES] shares ($[VALUE], [X]% of holdings) on [DATE]. Risk score: [N]/[LEVEL]. Monitor for additional Form 4 filings."

"Short-seller report from [FIRM] ([DATE]). Claims: [SUMMARY]. Credibility: [N]/[LEVEL]. Wait for company response and price stabilization."

"Dilution risk: S-3 shelf registration for $[AMOUNT] filed [DATE]. Capital:revenue ratio [X]:1. Monitor for 424B prospectus supplement."

"Compound risk: Insider selling (score [N]) + short report from [FIRM] (credibility [N]). ONDS-pattern warning. Avoid until clarity."

"Form 144 filed: [NAME] ([TITLE]) intends to sell [SHARES] shares. Combined with insider_trans of [X]%, elevated risk."
```

---

## Monitoring Existing Positions

For stocks already in your portfolio or watchlist, set up periodic checks:

### Weekly Monitoring Checklist

```bash
source .env

# Check SEC filings for your positions (replace with your tickers)
for ticker in TICK1 TICK2 TICK3; do
  echo "=== $ticker SEC Filings ===" && \
  curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export/latest-filings?t=$ticker&o=-filingDate&auth=$FINVIZ_API_TOKEN" | head -10
  sleep 1
done

# Check ownership data for insider trans changes
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export.ashx?v=131&t=TICK1,TICK2,TICK3&auth=$FINVIZ_API_TOKEN"

# Check news for short-seller mentions
for ticker in TICK1 TICK2 TICK3; do
  echo "=== $ticker News ===" && \
  curl -s -A "Mozilla/5.0" "https://elite.finviz.com/news_export.ashx?v=3&t=$ticker&auth=$FINVIZ_API_TOKEN" | head -10
  sleep 1
done
```

### Exit Signals (for existing positions)

| Signal | Action |
|--------|--------|
| CEO/CFO files Form 4 for large sale | Tighten stop loss to -3% |
| 3+ insiders sell in same week | Consider exiting 50% position |
| Short-seller report from credible firm | Exit immediately, reassess later |
| Form 144 filed by C-suite | Tighten stop, prepare to exit |
| S-3 filed with high capital:revenue ratio | Exit on next bounce |
| Insider resigns after selling | Exit immediately |

---

## Predictive Indicators: When to Expect Future Insider Selling

Based on patterns from ONDS and APLD:

| Indicator | What Happens | Lead Time |
|-----------|-------------|-----------|
| **RSU/option vesting dates** | Insiders sell to cover taxes | Check proxy (DEF 14A) for schedules |
| **Post-earnings windows** | Trading window opens ~2 days after earnings | Predictable quarterly |
| **Price milestone triggers** | Options vest when stock hits price targets | Watch price vs. option strikes |
| **Lock-up expiry** | Post-IPO/SPAC restricted shares unlock | 90-180 days after IPO |
| **Year-end** | Tax-related selling | December |
| **Form 144 filing** | Intent to sell within 90 days | 1-90 days advance warning |
| **New equity grants** | Insiders may sell existing shares after receiving new grants | Days to weeks after 8-K |
| **Board member resignation announced** | Often sells remaining shares | Days to weeks |

### How to Find Vesting Schedules

```bash
# Check proxy statement (DEF 14A) for compensation details
curl -s -A "Mozilla/5.0" "https://elite.finviz.com/export/latest-filings?t=TICKER&o=-filingDate&auth=$FINVIZ_API_TOKEN" | grep -i "DEF 14A\|proxy"
```

Then use WebFetch on the SEC filing link to extract vesting schedules, grant dates, and equity compensation tables.

---

## Database Storage (raw_data Extension)

Store insider/short analysis in the existing `raw_data` JSONB field on `screening_results`. No schema changes needed.

```json
{
  "news": ["headline1", "headline2"],
  "recommendation": { "...existing fields..." },
  "insiderAnalysis": {
    "riskScore": 7,
    "riskLevel": "HIGH",
    "transactions": [
      {
        "insider": "Ron Stern",
        "title": "Director",
        "type": "Sale",
        "shares": 850000,
        "value": 6700000,
        "pctHoldings": 53,
        "date": "2025-11-26",
        "is10b5_1": false
      }
    ],
    "flags": ["Clustered selling (3 insiders in 30 days)", "Sell-then-resign pattern"],
    "form144": [
      { "insider": "Ron Stern", "shares": 750000, "date": "2025-12-19" }
    ]
  },
  "shortSellerAnalysis": {
    "detected": true,
    "credibilityScore": 7,
    "reports": [
      {
        "firm": "JCapital Research",
        "date": "2026-02-04",
        "headline": "JCapital accuses company of incinerating cash",
        "keyClaims": ["Revenue vs capital disparity", "CEO sold before S-3 announcement"]
      }
    ]
  },
  "dilutionAnalysis": {
    "s3Filed": true,
    "shelfAmount": 829000000,
    "annualRevenue": 7200000,
    "capitalRevenueRatio": 115,
    "riskLevel": "CRITICAL"
  },
  "compoundRisk": {
    "insiderPlusShort": true,
    "insiderPlusDilution": true,
    "overallRiskLevel": "EXTREME"
  }
}
```

This preserves backward compatibility -- existing code reads `raw_data.news` and `raw_data.recommendation`, and new fields are purely additive.
