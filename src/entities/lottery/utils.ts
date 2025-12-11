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
 * Normalize matches for 12/24 single-field lottery
 * In 12/24, matching X is equivalent to matching (12-X) because:
 * - You pick 12 numbers
 * - If you match X, the other 12 numbers you didn't pick match (12-X) in the non-drawn set
 * This normalizes to the higher value (e.g., 0→12, 1→11, 2→10, etc.)
 * 
 * @param matches - Array with single match count
 * @param fieldCount - Number of numbers selected in the field (12 for 12/24)
 * @returns Normalized match count (always the higher of matches or complement)
 */
export function normalize12_24Matches(matches: number[], fieldCount: number = 12): number[] {
  if (matches.length !== 1) return matches;
  const m = matches[0];
  const complement = fieldCount - m;
  // Return the higher value (canonical form)
  return [Math.max(m, complement)];
}

/**
 * Finds the prize for a given combination
 * Automatically normalizes the combination before lookup
 * Handles both 2-field symmetric lotteries (4_20) and 12/24 complement symmetry
 * 
 * @param matches - The combination to look up (will be normalized)
 * @param prizeRows - The prize table rows to search
 * @param lotteryId - Optional lottery ID for special handling (12/24)
 * @returns The matching prize row, or undefined if not found
 */
export function findPrizeForCombination(
  matches: number[],
  prizeRows: PrizeRow[],
  lotteryId?: string
): PrizeRow | undefined {
  let normalized = normalizeMatches(matches);
  
  // Special handling for 12/24 single-field complement symmetry
  if (lotteryId === 'lottery_12_24' && matches.length === 1) {
    normalized = normalize12_24Matches(matches);
  }
  
  return prizeRows.find((row) => {
    let rowNormalized = normalizeMatches(row.matches);
    
    // Also normalize row matches for 12/24
    if (lotteryId === 'lottery_12_24' && row.matches.length === 1) {
      rowNormalized = normalize12_24Matches(row.matches);
    }
    
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

/**
 * Check if a lottery is "symmetric-enabled" (supports symmetric combinations)
 * Symmetric lotteries: 4из20 (2-field), 12/24 (symmetric matches)
 * 
 * @param lotteryId - The lottery ID to check
 * @returns true if lottery uses symmetric combinations
 */
export function isSymmetricLottery(lotteryId: string): boolean {
  // 2-field lotteries where both fields are identical ranges
  if (lotteryId === 'lottery_4_20') return true; // 4 from 20 in each field
  
  // 1-field lotteries where high=total-low creates symmetry
  if (lotteryId === 'lottery_12_24') return true; // 12 from 24, so 12+0=12, 11+1=12, etc
  
  return false;
}

/**
 * Group symmetric prize rows together for combined display
 * Returns rows with combined display text (larger number first, no brackets)
 * 
 * @param prizeRows - The prize table rows
 * @param lotteryId - The lottery ID
 * @returns Grouped rows with display info
 */
export function getCombinedSymmetricDisplay(
  prizeRows: PrizeRow[],
  _lotteryId: string
): Array<{ row: PrizeRow; displayLabel: string }> {
  return prizeRows.map((row) => {
    // For 2-field lotteries, show larger number first (e.g., "4 + 2" not "2 + 4")
    if (row.matches.length === 2) {
      const [a, b] = row.matches;
      const displayLabel = a >= b ? `${a} + ${b}` : `${b} + ${a}`;
      return { row, displayLabel };
    }
    return {
      row,
      displayLabel: row.matches.join(' + '),
    };
  });
}
