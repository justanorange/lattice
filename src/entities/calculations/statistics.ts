/**
 * Statistical Calculations
 * Analysis functions for lottery results
 */

import type { SimulationRound, SimulationStatistics } from '@/entities/lottery/types';

/**
 * Calculate basic statistics for array of numbers
 */
export interface BasicStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  sum: number;
  count: number;
}

/**
 * Calculate basic statistics for array of numbers
 *
 * @param values - Array of numbers
 * @returns Statistics object
 */
export function calculateBasicStats(values: number[]): BasicStats {
  if (values.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      sum: 0,
      count: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  // Median
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  // Standard deviation
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    median,
    stdDev,
    sum,
    count: values.length,
  };
}

/**
 * Calculate statistics from simulation rounds
 *
 * @param rounds - Array of simulation rounds
 * @returns Simulation statistics
 */
export function calculateSimulationStats(
  rounds: SimulationRound[],
  ticketCost: number
): SimulationStatistics {
  if (rounds.length === 0) {
    return {
      totalInvestment: 0,
      totalWon: 0,
      netReturn: 0,
      roi: 0,
      zeroWinRounds: 0,
      zeroWinPercent: 0,
      avgPrizePerRound: 0,
      maxPrizeInRound: 0,
      minNonZeroPrize: 0,
      prizeDistribution: {},
    };
  }

  const ticketCount = rounds[0].matches.length;
  const totalCost = ticketCost * ticketCount;
  const totalInvestment = totalCost * rounds.length;

  const prizes = rounds.map((r) => r.totalPrizeThisRound);
  const totalWon = prizes.reduce((a, b) => a + b, 0);
  const netReturn = totalWon - totalInvestment;
  const roi = (netReturn / totalInvestment) * 100;

  // Zero win rounds
  const zeroWinRounds = rounds.filter((r) => r.totalPrizeThisRound === 0)
    .length;
  const zeroWinPercent = (zeroWinRounds / rounds.length) * 100;

  // Prize statistics
  const avgPrizePerRound = totalWon / rounds.length;
  const maxPrizeInRound = Math.max(...prizes);

  const nonZeroPrizes = prizes.filter((p) => p > 0);
  const minNonZeroPrize =
    nonZeroPrizes.length > 0 ? Math.min(...nonZeroPrizes) : 0;

  // Prize distribution by category
  const prizeDistribution: Record<string, number> = {};
  for (const round of rounds) {
    for (const match of round.matches) {
      if (match.prizeWon > 0) {
        const key = match.prizeCategory;
        prizeDistribution[key] = (prizeDistribution[key] || 0) + 1;
      }
    }
  }

  return {
    totalInvestment,
    totalWon,
    netReturn,
    roi,
    zeroWinRounds,
    zeroWinPercent,
    avgPrizePerRound,
    maxPrizeInRound,
    minNonZeroPrize,
    prizeDistribution,
  };
}

/**
 * Calculate percentile value from array
 *
 * @param values - Sorted array of numbers
 * @param percentile - Percentile (0-100)
 * @returns Value at percentile
 */
export function percentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculate confidence interval for mean
 * CI = mean ± (z * stdDev / sqrt(n))
 *
 * @param values - Array of values
 * @param confidenceLevel - 0.95 for 95%, 0.99 for 99%, etc.
 * @returns [lower, upper] bounds
 */
export function confidenceInterval(
  values: number[],
  confidenceLevel: number = 0.95
): [number, number] {
  if (values.length === 0) return [0, 0];

  const stats = calculateBasicStats(values);
  const zScores: Record<number, number> = {
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const margin = (z * stats.stdDev) / Math.sqrt(values.length);

  return [stats.mean - margin, stats.mean + margin];
}

/**
 * Calculate variance of values
 *
 * @param values - Array of numbers
 * @returns Variance
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;

  const stats = calculateBasicStats(values);
  return Math.pow(stats.stdDev, 2);
}

/**
 * Calculate coefficient of variation (relative standard deviation)
 * CV = (stdDev / mean) * 100
 *
 * @param values - Array of numbers
 * @returns Coefficient of variation as percentage
 */
export function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;

  const stats = calculateBasicStats(values);
  if (stats.mean === 0) return 0;

  return (stats.stdDev / stats.mean) * 100;
}

/**
 * Identify outliers using IQR method
 * Outliers are values > Q3 + 1.5*IQR or < Q1 - 1.5*IQR
 *
 * @param values - Array of numbers
 * @returns Array of outlier values
 */
export function findOutliers(values: number[]): number[] {
  if (values.length < 4) return [];

  const q1 = percentile(values, 25);
  const q3 = percentile(values, 75);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.filter((v) => v < lowerBound || v > upperBound);
}

/**
 * Calculate Z-score for a value
 * Z = (value - mean) / stdDev
 *
 * @param value - Value to score
 * @param values - Array of values for context
 * @returns Z-score
 */
export function zScore(value: number, values: number[]): number {
  if (values.length === 0) return 0;

  const stats = calculateBasicStats(values);
  if (stats.stdDev === 0) return 0;

  return (value - stats.mean) / stats.stdDev;
}

/**
 * Estimate how many samples needed to reach target mean with given confidence
 * n = (z * stdDev / margin)^2
 *
 * @param stdDev - Standard deviation of population
 * @param margin - Acceptable margin of error
 * @param confidenceLevel - Confidence level (0.95, 0.99, etc.)
 * @returns Number of samples needed
 */
export function sampleSizeNeeded(
  stdDev: number,
  margin: number,
  confidenceLevel: number = 0.95
): number {
  const zScores: Record<number, number> = {
    0.9: 1.645,
    0.95: 1.96,
    0.99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  return Math.ceil(Math.pow((z * stdDev) / margin, 2));
}

/**
 * Calculate skewness (asymmetry of distribution)
 * Positive = right-skewed, Negative = left-skewed, ~0 = symmetric
 *
 * @param values - Array of numbers
 * @returns Skewness coefficient
 */
export function skewness(values: number[]): number {
  if (values.length < 3) return 0;

  const stats = calculateBasicStats(values);
  if (stats.stdDev === 0) return 0;

  const cubedDiffs = values.reduce(
    (sum, val) => sum + Math.pow((val - stats.mean) / stats.stdDev, 3),
    0
  );

  return cubedDiffs / values.length;
}

/**
 * Calculate kurtosis (tailedness of distribution)
 * High kurtosis = heavy tails, low kurtosis = light tails
 *
 * @param values - Array of numbers
 * @returns Excess kurtosis
 */
export function kurtosis(values: number[]): number {
  if (values.length < 4) return 0;

  const stats = calculateBasicStats(values);
  if (stats.stdDev === 0) return 0;

  const fourthMoment = values.reduce(
    (sum, val) => sum + Math.pow((val - stats.mean) / stats.stdDev, 4),
    0
  );

  return fourthMoment / values.length - 3; // Excess kurtosis
}
