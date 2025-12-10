/**
 * Advanced Lottery Analysis
 * Complex analysis functions for strategy evaluation
 */

import type { Lottery, PrizeTable } from '@/entities/lottery/types';
import { probabilityOfMatch, oddsFormat } from './probability';
import { calculateBasicStats } from './statistics';

/**
 * Analysis of a specific match category
 */
export interface MatchCategoryAnalysis {
  /** Match count (e.g., 4 for 4 matches) */
  matches: number;
  /** Probability of this match count */
  probability: number;
  /** Odds (1 in X format) */
  odds: number;
  /** Prize for this match */
  prize: number | string;
  /** Expected return (probability * prize) */
  expectedReturn: number;
  /** Relative weight compared to median */
  weight: number;
}

/**
 * Analyze all match categories for a lottery
 *
 * @param lottery - Lottery definition
 * @param prizeTable - Current prize table
 * @param superprice - Current superprice
 * @returns Array of category analyses
 */
export function analyzePrizeCategories(
  lottery: Lottery,
  prizeTable: PrizeTable,
  superprice: number
): MatchCategoryAnalysis[] {
  if (lottery.fieldCount !== 1) {
    // For simplicity, focus on single-field lotteries
    return [];
  }

  const field = lottery.fields[0];
  const drawn = field.count; // Assume drawn = selected for analysis
  const analysis: MatchCategoryAnalysis[] = [];

  for (const row of prizeTable.rows) {
    if (row.matches.length !== 1) continue;

    const m = row.matches[0];
    const prob = probabilityOfMatch(field.from, field.count, drawn, m);
    const odds = oddsFormat(prob);

    let prizeValue = 0;
    if (typeof row.prize === 'number') {
      prizeValue = row.prize;
    } else if (row.prize === 'Суперприз') {
      prizeValue = superprice;
    }

    const expectedReturn = prob * prizeValue;

    analysis.push({
      matches: m,
      probability: prob,
      odds,
      prize: row.prize || 0,
      expectedReturn,
      weight: expectedReturn > 0 ? expectedReturn : 0,
    });
  }

  // Calculate relative weights
  const maxReturn = Math.max(...analysis.map((a) => a.expectedReturn), 1);
  for (const cat of analysis) {
    cat.weight = cat.expectedReturn / maxReturn;
  }

  return analysis;
}

/**
 * Risk assessment for lottery parameters
 */
export interface RiskAssessment {
  /** Probability of winning any prize */
  winProbability: number;
  /** Probability of zero return */
  losseProbability: number;
  /** Expected value in rubles */
  expectedValue: number;
  /** Standard deviation of returns */
  riskScore: number;
  /** Risk rating: low, medium, high */
  riskLevel: 'low' | 'medium' | 'high';
  /** Value at Risk (95% confidence) */
  var95: number;
}

/**
 * Assess risk of playing a lottery
 *
 * @param lottery - Lottery definition
 * @param ticketCost - Ticket cost
 * @param prizes - Map of match counts to prizes
 * @returns Risk assessment
 */
export function assessRisk(
  lottery: Lottery,
  ticketCost: number,
  prizes: Record<number, number>
): RiskAssessment {
  if (lottery.fieldCount !== 1) {
    return {
      winProbability: 0,
      losseProbability: 1,
      expectedValue: -ticketCost,
      riskScore: 1,
      riskLevel: 'high',
      var95: ticketCost,
    };
  }

  const field = lottery.fields[0];
  const drawn = field.count;

  let winProb = 0;
  let ev = 0;
  const returns: number[] = [];

  // Calculate for each possible outcome
  for (let m = 0; m <= Math.min(field.count, drawn); m++) {
    const prob = probabilityOfMatch(field.from, field.count, drawn, m);
    const prize = prizes[m] || 0;

    if (prize > 0) {
      winProb += prob;
    }

    const netReturn = prize - ticketCost;
    ev += prob * netReturn;

    // Build return distribution
    for (let i = 0; i < Math.round(prob * 1000); i++) {
      returns.push(netReturn);
    }
  }

  const stats = calculateBasicStats(returns);
  const riskScore = stats.stdDev / ticketCost;

  let riskLevel: 'low' | 'medium' | 'high' = 'high';
  if (riskScore < 0.5) riskLevel = 'low';
  else if (riskScore < 1.5) riskLevel = 'medium';

  // VaR (5th percentile of losses)
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const varIndex = Math.floor(returns.length * 0.05);
  const var95 = Math.abs(sortedReturns[varIndex]);

  return {
    winProbability: winProb,
    losseProbability: 1 - winProb,
    expectedValue: ev,
    riskScore,
    riskLevel,
    var95,
  };
}

/**
 * Compare two lotteries or configurations
 */
export interface ComparisonResult {
  /** Expected value difference */
  evDifference: number;
  /** Better option (-1, 0, or 1) */
  better: -1 | 0 | 1;
  /** Recommendation reason */
  reason: string;
  /** EV ratio (ratio of expected values) */
  evRatio: number;
}

/**
 * Compare two lottery configurations
 *
 * @param ev1 - Expected value of option 1
 * @param ev2 - Expected value of option 2
 * @returns Comparison result
 */
export function compareEV(
  ev1: number,
  ev2: number
): ComparisonResult {
  const difference = ev1 - ev2;
  const ratio = ev2 !== 0 ? ev1 / ev2 : ev1 > ev2 ? Infinity : 1;

  let better: -1 | 0 | 1 = 0;
  let reason = 'Options are equivalent';

  if (difference > 0.01) {
    better = 1;
    reason = `Option 1 has ${Math.abs(difference).toFixed(2)} ₽ better EV`;
  } else if (difference < -0.01) {
    better = -1;
    reason = `Option 2 has ${Math.abs(difference).toFixed(2)} ₽ better EV`;
  }

  return {
    evDifference: difference,
    better,
    reason,
    evRatio: ratio,
  };
}

/**
 * Profitability analysis
 */
export interface ProfitabilityAnalysis {
  /** Whether lottery has positive EV */
  isProfitable: boolean;
  /** Draws to break even */
  drawsToBreakEven?: number;
  /** Annual profit at 52 draws/year */
  annualProfit?: number;
  /** Recommendation */
  recommendation: string;
}

/**
 * Analyze profitability of lottery
 *
 * @param ev - Expected value per draw
 * @param ticketCost - Ticket cost
 * @returns Profitability analysis
 */
export function analyzeProfitability(
  ev: number,
  ticketCost: number
): ProfitabilityAnalysis {
  const isProfitable = ev > 0;

  let drawsToBreakEven: number | undefined;
  let annualProfit: number | undefined;
  let recommendation = 'Not recommended for regular play';

  if (isProfitable) {
    drawsToBreakEven = 1;
    annualProfit = ev * 52;
    recommendation = `Play regularly - positive EV of ${ev.toFixed(2)} ₽ per ticket`;
  } else {
    const loss = Math.abs(ev);
    drawsToBreakEven = Math.ceil(loss / ev);
    recommendation = `${loss > ticketCost * 0.5 ? 'Avoid regular play' : 'Play occasionally'} - negative EV`;
  }

  return {
    isProfitable,
    drawsToBreakEven: isProfitable ? undefined : drawsToBreakEven,
    annualProfit,
    recommendation,
  };
}

/**
 * Strategy effectiveness score (0-100)
 * Combines coverage, cost efficiency, and expected return
 *
 * @param coverage - Coverage percentage (0-100)
 * @param costPerCombination - Cost per covered combination
 * @param ev - Expected value
 * @returns Effectiveness score (0-100)
 */
export function strategyEffectiveness(
  coverage: number,
  costPerCombination: number,
  ev: number
): number {
  // Normalize factors to 0-1 range
  const coverageScore = Math.min(coverage / 100, 1);
  const efficiencyScore = Math.min(1 / (costPerCombination + 1), 1);
  const profitScore = Math.max(Math.min(ev / 1000, 1), 0);

  // Weight: 40% coverage, 30% efficiency, 30% profit
  return (
    (0.4 * coverageScore + 0.3 * efficiencyScore + 0.3 * profitScore) * 100
  );
}
