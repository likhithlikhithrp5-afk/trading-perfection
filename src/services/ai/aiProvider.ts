export interface AISetupAnalysis {
  score: number; // 0-100
  reasoning: string;
  warnings: string[];
  rulesPassed: number;
  rulesFailed: number;
  historicalSimilarTrades: number;
  historicalWinRate: number;
  dataUsed: string[];
}

export interface AIProvider {
  analyzeSetup(
    setupDetails: Record<string, unknown>,
    historicalData: Record<string, unknown>
  ): Promise<AISetupAnalysis>;
  
  answerQuestion(
    question: string,
    context: Record<string, unknown>
  ): Promise<string>;
}

/**
 * Fallback rule-based AI provider
 * Works with no API key, uses only local analysis
 */
export class FallbackAIProvider implements AIProvider {
  async analyzeSetup(
    setupDetails: Record<string, unknown>,
    historicalData: Record<string, unknown>
  ): Promise<AISetupAnalysis> {
    const ruleScores = this.scoreRules(setupDetails);
    const historicalScore = this.scoreHistoricalData(historicalData);
    const finalScore = Math.round((ruleScores.score + historicalScore.score) / 2);

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      reasoning: this.generateReasoning(ruleScores, historicalScore, setupDetails),
      warnings: this.generateWarnings(setupDetails, historicalData),
      rulesPassed: ruleScores.passed,
      rulesFailed: ruleScores.failed,
      historicalSimilarTrades: Number(historicalData.similarTradesCount || 0),
      historicalWinRate: Number(historicalData.similarTradesWinRate || 0),
      dataUsed: [
        'Trading Rules Checklist',
        'Historical Similar Trades',
        'Strategy Performance',
        'Risk/Reward Analysis',
      ],
    };
  }

  async answerQuestion(question: string, context: Record<string, unknown>): Promise<string> {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('win rate') || lowerQuestion.includes('winning percentage')) {
      return `Your overall win rate is ${(Number(context.winRate || 0)).toFixed(2)}%. You have taken ${Number(context.totalTrades || 0)} trades with ${Number(context.winningTrades || 0)} winners and ${Number(context.losingTrades || 0)} losers.`;
    }

    if (lowerQuestion.includes('best day') || lowerQuestion.includes('most profitable')) {
      if (context.bestDay) {
        return `Your best trading day was on ${(context.bestDay as { date: string; pnl: number }).date} with a net P&L of ₹${(context.bestDay as { date: string; pnl: number }).pnl.toFixed(2)}.`;
      }
      return 'You don\'t have any trading data yet.';
    }

    if (lowerQuestion.includes('worst day') || lowerQuestion.includes('biggest loss')) {
      if (context.worstDay) {
        return `Your worst trading day was on ${(context.worstDay as { date: string; pnl: number }).date} with a net P&L of ₹${(context.worstDay as { date: string; pnl: number }).pnl.toFixed(2)}.`;
      }
      return 'You don\'t have any trading data yet.';
    }

    if (lowerQuestion.includes('strategy') && context.strategyName) {
      return `Your ${String(context.strategyName)} strategy has a ${Number(context.strategyWinRate || 0)}% win rate across ${Number(context.strategyTrades || 0)} trades.`;
    }

    if (lowerQuestion.includes('capital') || lowerQuestion.includes('return')) {
      const returnPct = Number(context.capitalReturnPercentage || 0);
      return `Your capital has ${returnPct > 0 ? 'increased' : 'decreased'} by ${Math.abs(returnPct).toFixed(2)}%. Your current capital is ₹${(Number(context.currentCapital || 0)).toFixed(2)}.`;
    }

    return `Based on your trading journal data: You have ${Number(context.tradingDays || 0)} trading days, with ${Number(context.profitableDays || 0)} profitable days. Your net P&L is ₹${(Number(context.totalNetPnL || 0)).toFixed(2)}.`;
  }

  private scoreRules(setupDetails: Record<string, unknown>): { score: number; passed: number; failed: number } {
    let passed = 0;
    let failed = 0;
    let score = 0;

    if (setupDetails.trendingOrRanging) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.continuationOrReversal) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.volatility) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.cleanOrChoppy) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.liquidityLocation) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.invalidation) {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    if (setupDetails.riskReward) {
      const rrValue = typeof setupDetails.riskReward === 'string'
        ? parseFloat(String(setupDetails.riskReward).split(':')[1] || '0')
        : Number(setupDetails.riskReward);
      
      if (rrValue >= 2) {
        passed++;
        score += 12.5;
      } else {
        failed++;
      }
    } else {
      failed++;
    }

    if (setupDetails.followingStrategy === true || setupDetails.followingStrategy === 'yes') {
      passed++;
      score += 12.5;
    } else {
      failed++;
    }

    return {
      score: Math.min(100, score),
      passed,
      failed,
    };
  }

  private scoreHistoricalData(historicalData: Record<string, unknown>): { score: number } {
    let score = 60;

    const similarCount = Number(historicalData.similarTradesCount || 0);
    const similarWinRate = Number(historicalData.similarTradesWinRate || 0);

    if (similarCount > 10) {
      score += (Math.min(similarWinRate, 100) - 50) / 2;
    } else if (similarCount > 5) {
      score += (Math.min(similarWinRate, 100) - 50) * 0.7;
    }

    if (historicalData.strategyWinRate) {
      score += (Math.min(Number(historicalData.strategyWinRate), 100) - 50) * 0.3;
    }

    return {
      score: Math.min(100, Math.max(0, score)),
    };
  }

  private generateReasoning(
    ruleScores: { score: number; passed: number; failed: number },
    historicalScore: { score: number },
    setupDetails: Record<string, unknown>
  ): string {
    const parts: string[] = [];

    parts.push(
      `Setup Rules Score: ${ruleScores.passed}/8 rules passed. ` +
      `You've clearly identified ${ruleScores.passed} of the 8 trading rules.`
    );

    if (historicalScore.score >= 70) {
      parts.push('Historical Performance: Your historical trades show positive patterns matching this setup.');
    } else if (historicalScore.score >= 50) {
      parts.push('Historical Performance: Mixed results in similar setups historically.');
    } else {
      parts.push('Historical Performance: Need more data or past struggles with similar setups.');
    }

    if (setupDetails.riskReward && String(setupDetails.riskReward).includes(':')) {
      const partsArr = String(setupDetails.riskReward).split(':');
      if (parseFloat(partsArr[1] || '0') >= 2) {
        parts.push('Risk/Reward: Excellent 1:2+ ratio identified.');
      } else {
        parts.push('Risk/Reward: Consider improving your risk/reward ratio.');
      }
    }

    return parts.join(' ');
  }

  private generateWarnings(
    setupDetails: Record<string, unknown>,
    historicalData: Record<string, unknown>
  ): string[] {
    const warnings: string[] = [];

    if (!setupDetails.trendingOrRanging) {
      warnings.push('Market trend not identified. Verify if market is trending or ranging.');
    }

    if (!setupDetails.liquidityLocation) {
      warnings.push('Liquidity zone not identified. Where will sellers/buyers step in?');
    }

    if (!setupDetails.invalidation) {
      warnings.push('No invalidation level set. Where will you exit if wrong?');
    }

    if (Number(historicalData.similarTradesCount || 0) < 5) {
      warnings.push('Limited historical data for this setup. Sample size is small.');
    }

    if (Number(historicalData.similarTradesWinRate || 0) < 50) {
      warnings.push('Historical win rate on similar setups is below 50%. Reconsider.');
    }

    if (setupDetails.riskReward) {
      const rrValue = typeof setupDetails.riskReward === 'string'
        ? parseFloat(String(setupDetails.riskReward).split(':')[1] || '0')
        : Number(setupDetails.riskReward);
      
      if (rrValue < 2) {
        warnings.push('Risk/Reward is below your 1:2 threshold. Expected setup quality is lower.');
      }
    }

    return warnings;
  }
}

/**
 * Load the appropriate AI provider based on configuration
 */
export function loadAIProvider(): AIProvider {
  return new FallbackAIProvider();
}
