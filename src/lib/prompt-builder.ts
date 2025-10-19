import { MarketPayload } from './market-fetcher';

export function buildAnalysisPrompt(marketData: MarketPayload, marketUrl: string): string {
  const question = marketData.market_facts.question;
  const currentPrice = marketData.market_state_now?.[0]?.mid || 0.5;
  const volume = marketData.market_facts.volume || 0;
  const liquidity = marketData.market_facts.liquidity || 0;
  const closeTime = marketData.market_facts.close_time;
  const resolutionSource = marketData.market_facts.resolution_source;

  // Generate price history summary
  let priceHistory = '';
  if (marketData.history && marketData.history.length > 0) {
    const firstToken = marketData.history[0];
    const recentPoints = firstToken.points.slice(-30); // Last 30 data points

    priceHistory = `\nPrice History (Last 30 Points):\n${recentPoints
      .map(p => {
        const date = new Date(p.t * 1000).toISOString().split('T')[0];
        return `- ${date}: ${(p.p * 100).toFixed(1)}%`;
      })
      .join('\n')}`;
  }

  // Generate the comprehensive prompt
  return `# Prediction Market Analysis Task

You are an expert forecaster analyzing a prediction market. Your goal is to provide a rigorous, evidence-based probabilistic forecast.

## Market Information

**Question:** ${question}

**Current Market Price:** ${(currentPrice * 100).toFixed(1)}% (${currentPrice.toFixed(3)} probability)

**Market Metrics:**
- Trading Volume: $${volume.toLocaleString()}
- Liquidity: $${liquidity.toLocaleString()}
- Close Time: ${closeTime ? new Date(typeof closeTime === 'number' ? closeTime * 1000 : closeTime).toISOString() : 'Not specified'}
- Resolution Source: ${resolutionSource || 'Not specified'}

**Market URL:** ${marketUrl}
${priceHistory}

---

## Your Analysis Framework

### Phase 1: Strategic Planning (Research Design)

Break down this forecasting question into:

1. **Causal Pathways** (3-8 mechanisms that could lead to the outcome)
   - Focus on WHAT COULD CAUSE the outcome, not just the final state
   - Example: For "Will X happen?", identify mechanisms like "Economic crisis forces X", "Policy change enables X", etc.

2. **Key Variables** (5-15 leading indicators to monitor)
   - Observable metrics that would change BEFORE the outcome occurs
   - Health indicators, political signals, economic metrics, institutional changes, etc.

3. **Search Strategy** (Design 15-20 specific search queries)
   - Target primary sources (official documents, press releases, regulatory filings)
   - Target high-quality secondary sources (Reuters, Bloomberg, WSJ, expert analysis)
   - Include temporal constraints (prefer 2024-2025 sources)
   - Avoid generic searches - be specific to entities/contexts in the question

4. **Decision Criteria** (3-8 clear criteria for evidence evaluation)
   - What would constitute strong evidence for/against?
   - How to weight different types of evidence?

### Phase 2: Evidence Research (Bilateral Investigation)

**Research both sides systematically:**

**FOR (Supporting Evidence):**
- Use your search capabilities to find evidence supporting the outcome
- Classify each piece of evidence by quality:
  - **Type A** (Primary Sources): Official documents, press releases, regulatory filings, direct quotes from officials
  - **Type B** (High-Quality Secondary): Reuters, Bloomberg, WSJ, FT, AP, expert analysis with clear methodology
  - **Type C** (Standard Secondary): Reputable news with citations, industry publications
  - **Type D** (Weak/Speculative): Social media, unverified claims, rumors

**AGAINST (Contradicting Evidence):**
- Same process, but focus on evidence contradicting the outcome
- Ensure balanced coverage - don't cherry-pick only one side

**For each piece of evidence, note:**
- Claim/finding (specific and factual)
- Source URL and publication date
- Evidence type (A/B/C/D)
- Verifiability (0-1): Can you independently verify this?
- Independent corroborations (count)
- Logical consistency (0-1): Internal coherence

**Recency Priority:**
- Strongly prefer sources from the last 30 days
- Include 2024 sources when necessary
- Avoid pre-2024 sources unless critical

### Phase 3: Critical Analysis (Gap Identification)

Review your evidence collection and identify:

1. **Missing Evidence Areas**
   - What perspectives are underrepresented?
   - What failure modes haven't been considered?
   - What disconfirming evidence might exist but wasn't found?

2. **Duplication Concerns**
   - Are multiple pieces of evidence from the same original source?
   - Syndicated content that appears independent but isn't?

3. **Data Quality Issues**
   - Selection bias in sources?
   - Measurement concerns?
   - Outdated information?

4. **Correlation Adjustments**
   - Which evidence items are likely correlated (same source/topic)?
   - How should this affect their combined weight?

### Phase 4: Bayesian Probability Aggregation

**Starting Point:**
- Prior probability (p0): ${(currentPrice * 100).toFixed(1)}% (from current market price)

**Evidence Weighting:**

For each piece of evidence, calculate its influence:

1. **Base Log-Likelihood Ratio (LLR):**
   - Type A evidence: up to ±2.0
   - Type B evidence: up to ±1.6
   - Type C evidence: up to ±0.8
   - Type D evidence: up to ±0.3

2. **Quality Adjustments:**
   - Multiply by verifiability score (0-1)
   - Boost for recency (last 30 days: +35%, 31-180 days: +20%, older: -15%)
   - Reduce for low consistency

3. **Correlation Handling:**
   - Group evidence by source/topic into clusters
   - For each cluster, calculate effective sample size: m_eff = m / (1 + (m-1) * ρ)
   - Where m = cluster size, ρ = correlation (0.6-0.9 for same source)

4. **Probability Update:**
   - For each evidence item: Apply Bayesian update
   - pₙₑw = pₒₗd × exp(LLR) / (pₒₗd × exp(LLR) + (1-pₒₗd))
   - Track cumulative updates

**Final Probabilities:**
- **p_neutral**: Pure evidence-based probability (ignoring market)
- **p_aware**: Blend with market (90% p_neutral + 10% market price)

### Phase 5: Comprehensive Report

Generate a structured forecast report with:

## Prediction: [YES/NO] (XX.X%)

### Executive Summary
- Core thesis in 2-3 sentences
- Key drivers (3-5 main factors)
- Confidence level and reasoning

### Evidence Analysis

For each major piece of evidence (top 10-15 by influence):
- **Evidence ID & Source**: [ID] - [Source domain], [Date]
- **Type & Quality**: Type [A/B/C/D], Verifiability: X.XX
- **Claim**: [Specific factual claim]
- **Influence**: ΔPP = +/-X.XX percentage points, LLR = X.XX
- **Correlation**: [Cluster info if applicable]
- **Assessment**: Why this evidence matters and how it affects the probability

### Probability Breakdown

| Metric | Value | Explanation |
|--------|-------|-------------|
| Prior (p0) | ${(currentPrice * 100).toFixed(1)}% | Current market price |
| Evidence-Based (p_neutral) | XX.X% | Pure Bayesian aggregation |
| Market-Aware (p_aware) | XX.X% | 90% evidence + 10% market |

### What Would Change This Forecast

List 3-5 specific events/developments that would materially shift the probability:
- Event 1: [Description] → Would move probability to ~XX%
- Event 2: [Description] → Would move probability to ~XX%
- etc.

### Caveats & Limitations

- Potential biases in evidence collection
- Correlation assumptions
- Data quality concerns
- Sources of uncertainty
- Factors not captured

### Key Takeaways

- Main conclusion
- Risk factors
- Confidence assessment
- Recommended monitoring points

---

## Special Instructions

1. **Use your native search/browsing capabilities** - Don't limit yourself to what's readily available. Search for:
   - Recent news (2024-2025)
   - Official sources and primary documents
   - Expert analysis and forecasts
   - Relevant academic research
   - Market data and trends

2. **Be thorough but efficient** - Aim for 15-30 high-quality evidence items, not hundreds of weak ones

3. **Show your work** - Make the Bayesian reasoning transparent so I can understand and verify it

4. **Be honest about uncertainty** - If evidence is limited or conflicting, say so

5. **Focus on mechanisms, not just outcomes** - Explain WHY things might happen, not just WHETHER

---

## Output Format

Please structure your response with clear markdown headings matching the report structure above. Include:
- ✅ Explicit probability estimates with reasoning
- ✅ Evidence catalog with IDs for reference
- ✅ Bayesian calculations shown
- ✅ Uncertainty quantification
- ✅ Actionable insights

**请使用中文完成报告。**

Begin your analysis now.`;
}
