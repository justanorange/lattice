/**
 * Lottery utility functions
 * Handles symmetric combinations and prize lookups
 */

import type { PrizeRow } from './types';

/**
 * Normalizes a combination to canonical form for lookup
 * For 2-field lotteries: [a, b] becomes [min(a,b), max(a,b)]
 * For 1-field lotteries: No normalization needed (single value can't be symmetric)
 * 
 * @param matches - The combination to normalize (array of matched counts)
 * @returns Normalized combination in canonical form
 */
export function normalizeMatches(matches: number[]): number[] {
  if (matches.length === 2) {
    // For 2-field lotteries, sort to canonical form [min, max]
    const [a, b] = matches;
    return a <= b ? [a, b] : [b, a];
  }
  // For 1-field lotteries, return as-is
  return matches;
}

/**
 * Checks if a combination is symmetric
 * A combination is symmetric if normalized form differs from original
 * 
 * @param matches - The combination to check
 * @returns true if the combination is symmetric (not in canonical form)
 */
export function isSymmetricMatch(matches: number[]): boolean {
  if (matches.length !== 2) return false;
  return matches[0] > matches[1];
}

/**
 * Finds the prize for a given combination
 * Automatically normalizes the combination before lookup
 * 
 * @param matches - The combination to look up (will be normalized)
 * @param prizeRows - The prize table rows to search
 * @returns The matching prize row, or undefined if not found
 */
export function findPrizeForCombination(
  matches: number[],
  prizeRows: PrizeRow[]
): PrizeRow | undefined {
  const normalized = normalizeMatches(matches);
  return prizeRows.find((row) => {
    const rowNormalized = normalizeMatches(row.matches);
    return (
      rowNormalized.length === normalized.length &&
      rowNormalized.every((val, idx) => val === normalized[idx])
    );
  });
}

/**
 * Gets a display label for symmetric combinations
 * Used to show both directions: "4 + 3 или 3 + 4"
 * 
 * @param matches - The combination
 * @returns Display label or empty string if not symmetric
 */
export function getSymmetricLabel(matches: number[]): string {
  if (matches.length !== 2) return '';
  const [a, b] = matches;
  if (a === b) return ''; // Not symmetric if both are same
  const [min, max] = a < b ? [a, b] : [b, a];
  return `${min} + ${max} или ${max} + ${min}`;
}
