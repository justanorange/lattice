/**
 * Strategy Comparison
 * Compare multiple strategies and select optimal choice
 */

import type { StrategyParams, StrategyResult, StrategyComparison } from './types';
import type { Lottery } from '../lottery/types';
import { executeStrategy } from './generator';
import { ALL_STRATEGIES } from './config';

/**
 * Compare two strategies
 */
export async function compareTwo(
  strategy1Id: string,
  strategy2Id: string,
  lottery: Lottery,
  params: Record<string, StrategyParams>,
  ticketCost: number
): Promise<StrategyComparison> {
  const result1 = await executeStrategy(strategy1Id, lottery, params[strategy1Id] || {}, ticketCost);
  const result2 = await executeStrategy(strategy2Id, lottery, params[strategy2Id] || {}, ticketCost);

  const ev1 = calculateExpectedValue(result1);
  const ev2 = calculateExpectedValue(result2);
  const evDifference = ev1 - ev2;

  const coverage1 = result1.coverage?.percent || 0;
  const coverage2 = result2.coverage?.percent || 0;
  const coverageDifference = coverage1 - coverage2;

  let better: 1 | 2 | 0 = 0;
  if (ev1 > ev2) {
    better = 1;
  } else if (ev2 > ev1) {
    better = 2;
  }

  const reasoning = generateComparison(
    strategy1Id,
    strategy2Id,
    ev1,
    ev2,
    coverage1,
    coverage2,
    better
  );

  return {
    strategy1: strategy1Id,
    strategy2: strategy2Id,
    evDifference,
    coverageDifference,
    better,
    reasoning,
  };
}

/**
 * Compare multiple strategies
 */
export async function compareMultiple(
  lottery: Lottery,
  strategyIds: string[],
  params: Record<string, StrategyParams>,
  ticketCost: number
): Promise<StrategyComparison[]> {
  const results: StrategyComparison[] = [];

  // Compare each pair
  for (let i = 0; i < strategyIds.length; i++) {
    for (let j = i + 1; j < strategyIds.length; j++) {
      const comparison = await compareTwo(
        strategyIds[i],
        strategyIds[j],
        lottery,
        params,
        ticketCost
      );
      results.push(comparison);
    }
  }

  return results;
}

/**
 * Get best strategy for lottery
 */
export async function getBestStrategy(
  lottery: Lottery,
  params: Record<string, StrategyParams>,
  ticketCost: number
): Promise<{
  strategyId: string;
  result: StrategyResult;
  guarantee: {
    description: string;
    guaranteedMatches: number;
    requiredBudget: number;
    ticketCount: number;
    probability?: number;
  };
} | null> {
  const supportedStrategies = Object.keys(ALL_STRATEGIES).filter((id) =>
    ALL_STRATEGIES[id].supportedLotteries.includes(lottery.id)
  );

  if (supportedStrategies.length === 0) {
    return null;
  }

  let bestStrategy = supportedStrategies[0];
  let bestEv = -Infinity;

  for (const strategyId of supportedStrategies) {
    try {
      const result = await executeStrategy(strategyId, lottery, params[strategyId] || {}, ticketCost);
      const ev = calculateExpectedValue(result);

      if (ev > bestEv) {
        bestEv = ev;
        bestStrategy = strategyId;
      }
    } catch (e) {
      // Skip failed strategies
      continue;
    }
  }

  const result = await executeStrategy(bestStrategy, lottery, params[bestStrategy] || {}, ticketCost);

  return {
    strategyId: bestStrategy,
    result,
    guarantee: {
      description: 'Strategy executed',
      guaranteedMatches: 0,
      requiredBudget: result.totalCost,
      ticketCount: result.ticketCount,
    },
  };
}

/**
 * Calculate expected value for strategy result
 */
export function calculateExpectedValue(result: StrategyResult): number {
  if (!result.coverage || result.coverage.total === 0) {
    return 0;
  }

  // Simple EV: (covered / total) * average_prize - cost
  // This is simplified - real EV would use prize table
  const coverageRatio = result.coverage.covered / result.coverage.total;
  const estimatedAveragePrize = 100; // Placeholder

  return coverageRatio * estimatedAveragePrize - (result.totalCost / result.ticketCount);
}

/**
 * Calculate strategy efficiency
 */
export function calculateEfficiency(result: StrategyResult): number {
  if (result.ticketCount === 0) {
    return 0;
  }

  if (!result.coverage) {
    return 0;
  }

  // Efficiency: coverage per cost unit
  const coveragePerCost = (result.coverage.percent / 100) / (result.totalCost / 1000);
  return Math.max(0, coveragePerCost);
}

/**
 * Calculate risk level (0-10)
 */
export function calculateRiskLevel(strategyId: string): number {
  const riskMap: Record<string, number> = {
    min_risk: 2,
    coverage: 4,
    full_wheel: 6,
    key_wheel: 5,
    guaranteed_win: 1,
    budget_optimizer: 5,
  };

  return riskMap[strategyId] || 5;
}

/**
 * Generate comparison reasoning
 */
function generateComparison(
  s1: string,
  s2: string,
  ev1: number,
  ev2: number,
  c1: number,
  c2: number,
  better: 1 | 2 | 0
): string {
  let reasoning = '';

  if (better === 1) {
    reasoning = `${s1} is superior: EV ${(ev1 - ev2).toFixed(2)} higher, `;
  } else if (better === 2) {
    reasoning = `${s2} is superior: EV ${(ev2 - ev1).toFixed(2)} higher, `;
  } else {
    reasoning = 'Both strategies have equivalent EV, ';
  }

  if (c1 > c2) {
    reasoning += `${s1} has better coverage (${c1.toFixed(1)}% vs ${c2.toFixed(1)}%)`;
  } else if (c2 > c1) {
    reasoning += `${s2} has better coverage (${c2.toFixed(1)}% vs ${c1.toFixed(1)}%)`;
  } else {
    reasoning += 'equivalent coverage';
  }

  return reasoning;
}

/**
 * Analyze strategy for lottery
 */
export async function analyzeStrategy(
  strategyId: string,
  lottery: Lottery,
  params: StrategyParams,
  ticketCost: number
): Promise<{
  result: StrategyResult;
  recommendations: string[];
  warnings: string[];
}> {
  const result = await executeStrategy(strategyId, lottery, params, ticketCost);

  const recommendations: string[] = [];
  const warnings: string[] = [];

  const efficiency = calculateEfficiency(result);
  const risk = calculateRiskLevel(strategyId);

  // Generate recommendations
  if (efficiency > 0.5) {
    recommendations.push('High efficiency ratio - good value for money');
  }

  if (result.coverage && result.coverage.percent > 80) {
    recommendations.push('Excellent coverage of number combinations');
  }

  if (strategyId === 'guaranteed_win') {
    recommendations.push('Guarantees at least one winning ticket');
  }

  // Generate warnings
  if (result.totalCost > 10000) {
    warnings.push('High investment required - consider budget constraints');
  }

  if (result.ticketCount > 100) {
    warnings.push('Large number of tickets - may be impractical to manage');
  }

  if (risk > 7) {
    warnings.push('High risk strategy - potential for significant losses');
  }

  return {
    result,
    recommendations,
    warnings,
  };
}

