/**
 * Prize Calculation Logic
 * Core functions for determining prizes based on matches
 */

import type {
  Lottery,
  PrizeTable,
  PrizeRow,

  EVCalculation,
} from './types';

import { findPrizeForCombination, normalizeMatches, isSymmetricLottery, normalize12_24Matches } from './utils';
import { probabilityOfMatch } from '@/entities/calculations/probability';

/**
 * Find prize amount for given matches
 * Automatically handles symmetric combinations (e.g., [3,4] matches [4,3])
 * @param prizeTable - The prize table to search
 * @param matches - Array of match counts (e.g., [8, 1] for 8+1 lottery)
 * @param lotteryId - Optional lottery ID for special handling (12/24 complement symmetry)
 * @returns Prize amount (number or string like "Суперприз") or 0 if no match
 */
export function findPrizeByMatches(
  prizeTable: PrizeTable,
  matches: number[],
  lotteryId?: string
): number | string {
  const matchedRow = findPrizeForCombination(matches, prizeTable.rows, lotteryId);
  return matchedRow?.prize ?? 0;
}

/**
 * Calculate prize amount in rubles
 * Handles both fixed prizes and percentage-based prizes
 * Automatically normalizes symmetric combinations before lookup
 * @param prizeTable - The prize table
 * @param matches - Match counts
 * @param superprice - Current superprice (for "Суперприз")
 * @param secondaryPrize - Secondary prize (for 5из36+1)
 * @param poolAmount - Prize pool amount (for percentage-based prizes)
 * @param lotteryId - Lottery ID for special handling (12/24 complement symmetry)
 * @returns Prize amount in rubles, or undefined for superprice
 */
export function calculatePrizeAmount(
  prizeTable: PrizeTable,
  matches: number[],
  _superprice: number,
  _secondaryPrize?: number,
  poolAmount: number = 0,
  lotteryId?: string
): number | 'Суперприз' | 'Приз' {
  // Find the row for these matches - using normalized lookup with lottery context
  const matchedRow = findPrizeForCombination(matches, prizeTable.rows, lotteryId);

  if (!matchedRow) {
    return 0;
  }

  // Handle superprice marker
  if (matchedRow.prize === 'Суперприз') {
    return 'Суперприз';
  }

  // Handle secondary prize marker (5из36+1)
  if (matchedRow.prize === 'Приз') {
    return 'Приз';
  }

  // Handle numeric prize
  if (typeof matchedRow.prize === 'number') {
    return matchedRow.prize;
  }

  // Handle percentage-based prize
  if (matchedRow.prizePercent !== undefined && poolAmount > 0) {
    return Math.floor((matchedRow.prizePercent / 100) * poolAmount);
  }

  return 0;
}


/**
 * Get numeric prize value
 * For "Суперприз" returns superprice, for "Приз" returns secondary prize
 * @param prize - Prize value (number or string marker)
 * @param superprice - Superprice amount
 * @param secondaryPrize - Secondary prize amount
 * @returns Numeric prize value
 */
export function getPrizeNumericValue(
  prize: number | string | 'Суперприз' | 'Приз',
  superprice: number,
  secondaryPrize?: number
): number {
  if (typeof prize === 'number') {
    return prize;
  }

  if (prize === 'Суперприз') {
    return superprice;
  }

  if (prize === 'Приз' && secondaryPrize) {
    return secondaryPrize;
  }

  return 0;
}

/**
 * Check if a match combination wins a prize
 * @param matches - Match counts
 * @param prizeTable - Prize table
 * @returns true if this combination wins any prize
 */
export function isWinningCombination(
  matches: number[],
  prizeTable: PrizeTable
): boolean {
  const prize = findPrizeByMatches(prizeTable, matches);
  return prize !== 0 && prize !== undefined;
}

/**
 * Calculate Expected Value (EV) for a lottery
 * EV = sum(prize * probability) - ticket_cost
 * Uses actual probability calculations for accurate EV
 * Accounts for symmetric lotteries (12/24 and 4_20) where multiple combinations win same prize
 *
 * @param lottery - The lottery definition
 * @param superprice - Current superprice
 * @param prizeTable - Current prize table
 * @param ticketCost - Ticket cost in rubles
 * @param secondaryPrize - Secondary prize (if applicable)
 * @param poolAmount - Average prize pool (for percentage-based lotteries)
 * @returns EV calculation
 */
export function calculateEV(
  lottery: Lottery,
  superprice: number,
  prizeTable: PrizeTable,
  ticketCost: number,
  secondaryPrize?: number,
  poolAmount: number = 0
): EVCalculation {

  let expectedValue = 0; // Sum of (prize * probability)
  const isSymmetric = isSymmetricLottery(lottery.id);

  // Calculate EV based on actual probabilities
  for (const row of prizeTable.rows) {
    let prizeValue = 0;
    
    // Get prize value
    if (row.prize === 'Суперприз') {
      prizeValue = superprice;
    } else if (row.prize === 'Приз' && secondaryPrize) {
      prizeValue = secondaryPrize;
    } else if (typeof row.prize === 'number') {
      prizeValue = row.prize;
    } else if (row.prizePercent !== undefined && poolAmount > 0) {
      prizeValue = (row.prizePercent / 100) * poolAmount;
    }

    if (prizeValue <= 0) continue;

    // Calculate probability for this match combination
    let probability = 0;

    if (lottery.fieldCount === 1) {
      // Single field lottery (6из45, 7из49, 12/24)
      const field = lottery.fields[0];
      const matches = row.matches[0];
      
      probability = probabilityOfMatch(
        field.from,
        field.count,
        field.count, // drawn = selected
        matches
      );
      
      // For 12/24: matching X numbers is same as matching (field.count - X) numbers
      // because if you pick 12 numbers and match X, the 12 numbers you didn't pick match (12-X)
      // Example: 12 matches = 0 not-matches, 11 matches = 1 not-match - both win same prize
      if (lottery.id === 'lottery_12_24') {
        const complementMatches = field.count - matches;
        // Only add complement probability if it's different from original (not middle point)
        if (complementMatches !== matches) {
          const complementProbability = probabilityOfMatch(
            field.from,
            field.count,
            field.count,
            complementMatches
          );
          probability += complementProbability;
        }
      }
    } else if (lottery.fieldCount === 2 && row.matches.length === 2) {
      // Two field lottery (8+1, 5из36+1, 4из20)
      const field1 = lottery.fields[0];
      const field2 = lottery.fields[1];
      const matches1 = row.matches[0];
      const matches2 = row.matches[1];

      const prob1 = probabilityOfMatch(
        field1.from,
        field1.count,
        field1.count,
        matches1
      );
      const prob2 = probabilityOfMatch(
        field2.from,
        field2.count,
        field2.count,
        matches2
      );

      // Probability of both fields matching = prob1 * prob2
      probability = prob1 * prob2;
      
      // For symmetric 2-field lotteries (4из20): [a,b] and [b,a] win same prize
      // Prize table only contains normalized form [min,max], so we need to double the probability
      // if the combination is not symmetric (a != b)
      if (isSymmetric && matches1 !== matches2) {
        // The prize table is normalized, so [3,4] entry covers both [3,4] and [4,3]
        // We need to add the probability of [4,3] as well
        const prob1Swap = probabilityOfMatch(
          field1.from,
          field1.count,
          field1.count,
          matches2  // swapped
        );
        const prob2Swap = probabilityOfMatch(
          field2.from,
          field2.count,
          field2.count,
          matches1  // swapped
        );
        probability += prob1Swap * prob2Swap;
      }
    }

    // Add to expected value: prize * probability
    expectedValue += prizeValue * probability;
  }

  // Final EV = sum(prize * prob) - ticket_cost
  const finalEV = expectedValue - ticketCost;
  const evPercent = (finalEV / ticketCost) * 100;

  return {
    expectedValue: finalEV,
    evPercent,
    isProfitable: finalEV > 0,
  };
}

/**
 * Get prize category label for histogram/statistics
 * Normalizes symmetric combinations so [2,3] and [3,2] are counted together
 * For 12/24: normalizes complement matches (0→12, 1→11, etc.)
 * @param matches - Match counts
 * @param lotteryId - Optional lottery ID for special handling
 * @returns Category label (e.g., "4+1", "3+0", etc.) normalized for symmetric lotteries
 */
export function getPrizeCategory(matches: number[], lotteryId?: string): string {
  // Handle 12/24 complement symmetry
  if (lotteryId === 'lottery_12_24' && matches.length === 1) {
    const normalized = normalize12_24Matches(matches);
    return normalized[0].toString();
  }
  
  // Normalize symmetric combinations to canonical form for 2-field lotteries
  const normalized = normalizeMatches(matches);
  return normalized.map((m) => m.toString()).join('+');
}

/**
 * Validate that matches array is valid for a lottery
 * @param lottery - The lottery
 * @param matches - Match counts to validate
 * @returns true if valid
 */
export function isValidMatchesForLottery(
  lottery: Lottery,
  matches: number[]
): boolean {
  if (matches.length !== lottery.fieldCount) {
    return false;
  }

  return matches.every((m, idx) => {
    const field = lottery.fields[idx];
    return m >= 0 && m <= field.count;
  });
}

/**
 * Batch calculate prizes for multiple match combinations
 * @param lottery - The lottery
 * @param matchesArray - Array of match combinations
 * @param superprice - Current superprice
 * @param secondaryPrize - Secondary prize (if applicable)
 * @param poolAmount - Prize pool (if percentage-based)
 * @returns Array of prizes in same order
 */
export function calculatePrizesForMatches(
  lottery: Lottery,
  matchesArray: number[][],
  superprice: number,
  secondaryPrize?: number,
  poolAmount: number = 0
): (number | string)[] {
  const prizeTable = lottery.prizeTable!;

  return matchesArray.map((matches) => {
    if (!isValidMatchesForLottery(lottery, matches)) {
      return 0;
    }

    return calculatePrizeAmount(
      prizeTable,
      matches,
      superprice,
      secondaryPrize,
      poolAmount
    );
  });
}

/**
 * Calculate probabilities for all prize rows in a lottery
 * @param lottery - The lottery definition
 * @param prizeTable - The prize table
 * @returns Prize table with calculated probabilities
 */
export function calculatePrizeTableWithProbabilities(
  lottery: Lottery,
  prizeTable: PrizeTable
): PrizeTable {
  const rowsWithProbs: PrizeRow[] = prizeTable.rows.map((row) => {
    let probability = 0;

    if (lottery.fieldCount === 1) {
      // Single field lottery
      const field = lottery.fields[0];
      const matches = row.matches[0];
      probability = probabilityOfMatch(
        field.from,
        field.count,
        field.count,
        matches
      );
    } else if (lottery.fieldCount === 2 && row.matches.length === 2) {
      // Two field lottery
      const field1 = lottery.fields[0];
      const field2 = lottery.fields[1];
      const matches1 = row.matches[0];
      const matches2 = row.matches[1];

      const prob1 = probabilityOfMatch(
        field1.from,
        field1.count,
        field1.count,
        matches1
      );
      const prob2 = probabilityOfMatch(
        field2.from,
        field2.count,
        field2.count,
        matches2
      );

      probability = prob1 * prob2;
    }

    return { ...row, probability };
  });

  return { ...prizeTable, rows: rowsWithProbs };
}
