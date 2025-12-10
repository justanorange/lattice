/**
 * Coverage Analysis
 * Analyze how lottery strategies cover combinations
 */

import type { Ticket } from '@/entities/lottery/types';
import { binomial } from './probability';

/**
 * Coverage analysis result
 */
export interface CoverageResult {
  /** Number of unique combinations covered */
  covered: number;
  /** Total possible combinations */
  total: number;
  /** Coverage percentage */
  percent: number;
  /** Unique coverage count */
  unique: number;
  /** Duplicate coverage count */
  duplicates: number;
}

/**
 * Calculate total combinations covered by a single-field lottery ticket
 * Numbers in ticket can match in multiple ways
 *
 * @param from - Total numbers available
 * @param count - Numbers in ticket
 * @param mustMatch - Minimum numbers that must match
 * @returns Number of combinations that will match
 */
export function combinationsCovered(
  from: number,
  count: number,
  mustMatch: number
): number {
  if (mustMatch > count || mustMatch < 0) return 0;

  // Combinations where exactly 'mustMatch' numbers match
  // = C(count, mustMatch) * C(from - count, count - mustMatch)
  const matchingFromTicket = binomial(count, mustMatch);
  const matchingFromOther = binomial(from - count, count - mustMatch);

  return matchingFromTicket * matchingFromOther;
}

/**
 * Estimate coverage for ticket set
 * Calculates approximate coverage with overlaps
 *
 * @param tickets - Array of tickets
 * @param from - Total numbers available
 * @param selectedCount - Numbers selected per ticket
 * @returns Coverage estimate
 */
export function estimateCoverage(
  tickets: Ticket[],
  from: number,
  selectedCount: number
): CoverageResult {
  const totalCombinations = binomial(from, selectedCount);
  const ticketCount = tickets.length;

  // Rough estimate: coverage increases with tickets, but with diminishing returns
  // Simple model: coverage ≈ 1 - (1 - 1/total)^tickets
  // But we account for some overlap

  // Each ticket covers approximately total/C(from, selected) of the space
  // With overlap, we use: coverage ≈ 1 - (1 - p)^n where p ≈ 1/total
  const singleCoverage = 1 / totalCombinations;
  const estimatedCovered =
    totalCombinations * (1 - Math.pow(1 - singleCoverage, ticketCount));

  const covered = Math.round(estimatedCovered);
  const percent = (covered / totalCombinations) * 100;

  return {
    covered,
    total: totalCombinations,
    percent,
    unique: covered,
    duplicates: ticketCount - covered, // Rough estimate
  };
}

/**
 * Calculate coverage for guaranteed match category
 * How many tickets guarantee at least m matches?
 *
 * @param from - Total numbers
 * @param selectedCount - Numbers selected
 * @param guaranteedMatches - Minimum matches to guarantee
 * @returns Minimum tickets needed
 */
export function ticketsForGuarantee(
  from: number,
  selectedCount: number,
  guaranteedMatches: number
): number {
  if (guaranteedMatches > selectedCount || guaranteedMatches < 0) {
    return Infinity;
  }

  // Using covering designs theory
  // Minimum tickets = C(from - selectedCount, selectedCount - guaranteedMatches)
  // This is a simplified approximation

  if (guaranteedMatches === selectedCount) {
    // Exact match - need to cover all combinations
    return binomial(from, selectedCount);
  }

  // For partial matches, use combinatorial covering
  const otherNumbers = from - selectedCount;
  const numbersNeeded = selectedCount - guaranteedMatches;

  if (numbersNeeded > otherNumbers) {
    return Infinity;
  }

  return binomial(otherNumbers, numbersNeeded);
}

/**
 * Calculate efficiency of ticket set
 * Efficiency = combinations covered / (tickets * cost)
 *
 * @param covered - Combinations covered
 * @param ticketCount - Number of tickets
 * @param ticketCost - Cost per ticket
 * @returns Combinations per cost unit
 */
export function coverageEfficiency(
  covered: number,
  ticketCount: number,
  ticketCost: number
): number {
  const totalCost = ticketCount * ticketCost;
  if (totalCost === 0) return 0;

  return covered / totalCost;
}

/**
 * Calculate overlap between two tickets
 * Returns number of common numbers
 *
 * @param ticket1 - First set of numbers
 * @param ticket2 - Second set of numbers
 * @returns Count of common numbers
 */
export function ticketOverlap(ticket1: number[], ticket2: number[]): number {
  const set1 = new Set(ticket1);
  let overlap = 0;

  for (const num of ticket2) {
    if (set1.has(num)) {
      overlap++;
    }
  }

  return overlap;
}

/**
 * Calculate average overlap for set of tickets
 *
 * @param tickets - Array of ticket number arrays
 * @returns Average overlap count
 */
export function averageTicketOverlap(tickets: number[][]): number {
  if (tickets.length < 2) return 0;

  let totalOverlap = 0;
  let comparisons = 0;

  for (let i = 0; i < tickets.length; i++) {
    for (let j = i + 1; j < tickets.length; j++) {
      totalOverlap += ticketOverlap(tickets[i], tickets[j]);
      comparisons++;
    }
  }

  return comparisons > 0 ? totalOverlap / comparisons : 0;
}

/**
 * Analyze which numbers appear most frequently in tickets
 *
 * @param tickets - Array of ticket number arrays
 * @returns Object with number -> frequency mapping
 */
export function numberFrequency(tickets: number[][]): Record<number, number> {
  const frequency: Record<number, number> = {};

  for (const ticket of tickets) {
    for (const num of ticket) {
      frequency[num] = (frequency[num] || 0) + 1;
    }
  }

  return frequency;
}

/**
 * Check if number set covers all combinations of given size
 * For verification of covering designs
 *
 * @param selectedNumbers - Numbers selected by player
 * @param targetMatchSize - Size of matches to guarantee coverage for
 * @returns true if all combinations of targetMatchSize are covered
 */
export function checkCompleteCoverage(
  selectedNumbers: number[],
  targetMatchSize: number
): boolean {
  if (targetMatchSize > selectedNumbers.length || targetMatchSize < 0) {
    return false;
  }

  // For complete coverage of all m-subsets, we need C(n, m) distinct tickets
  // This is a simplified check - full verification would require checking
  // all combinations
  return selectedNumbers.length >= targetMatchSize;
}

/**
 * Calculate how many unique winning combinations are covered
 * Against a specific draw
 *
 * @param ticketSet - Set of tickets
 * @param drawnNumbers - Numbers drawn in lottery
 * @param winThreshold - Minimum matches to count as win
 * @returns Number of winning combinations
 */
export function winsAgainstDraw(
  ticketSet: Ticket[],
  drawnNumbers: number[],
  winThreshold: number
): number {
  let winCount = 0;

  for (const ticket of ticketSet) {
    const matches = ticket.field1.filter((n) =>
      drawnNumbers.includes(n)
    ).length;

    if (matches >= winThreshold) {
      winCount++;
    }
  }

  return winCount;
}

/**
 * Calculate coverage diversity
 * How well distributed are the numbers across tickets (0-1)
 * Higher = more uniform distribution
 *
 * @param tickets - Array of ticket number arrays
 * @param totalNumbers - Total numbers in lottery
 * @returns Diversity score (0-1)
 */
export function coverageDiversity(
  tickets: number[][],
  totalNumbers: number
): number {
  if (tickets.length === 0) return 0;

  const frequency = numberFrequency(tickets);
  const expectedFreq = (tickets.length * tickets[0].length) / totalNumbers;

  // Calculate chi-square distance from expected uniform distribution
  let chiSquare = 0;
  for (let i = 1; i <= totalNumbers; i++) {
    const observed = frequency[i] || 0;
    const diff = observed - expectedFreq;
    chiSquare += (diff * diff) / (expectedFreq || 1);
  }

  // Normalize to 0-1 scale (lower chi-square = higher diversity)
  // Using empirical max of 2 * totalNumbers as denominator
  return Math.max(0, 1 - chiSquare / (2 * totalNumbers));
}
