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

import { findPrizeForCombination, isSymmetricLottery, normalize12_24Matches } from './utils';
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
  lotteryId?: string,
  ticketCost?: number,
  lottery?: Lottery
): number | 'Суперприз' | 'Приз' {
  // Find the row for these matches - using normalized lookup with lottery context
  const matchedRow = findPrizeForCombination(matches, prizeTable.rows, lotteryId);

  if (!matchedRow) {
    return 0;
  }

  // Handle superprice marker (both prize='Суперприз' and prizeNote='Суперприз')
  if (matchedRow.prize === 'Суперприз' || matchedRow.prizeNote === 'Суперприз') {
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
    // Calculate prize per winner: total category prize / expected winners
    // Expected winners = totalTickets × probability
    // NOTE: poolAmount is the PRIZE FUND (~50% of revenue), so real tickets ≈ 2× pool/ticketCost
    if (ticketCost && ticketCost > 0 && lottery) {
      const estimatedTickets = (poolAmount / ticketCost) * 2;
      const probability = calculateMatchProbability(lottery, matchedRow.matches);
      const expectedWinners = estimatedTickets * probability;
      
      if (expectedWinners > 0) {
        const totalPrizeForCategory = (matchedRow.prizePercent / 100) * poolAmount;
        return Math.floor(totalPrizeForCategory / expectedWinners);
      }
    }
    // Fallback: full percentage (for display when no ticket info)
    return Math.floor((matchedRow.prizePercent / 100) * poolAmount);
  }

  return 0;
}

/**
 * Calculate probability of a specific match combination
 */
function calculateMatchProbability(lottery: Lottery, matches: number[]): number {
  const isSymmetric = isSymmetricLottery(lottery.id);
  
  if (lottery.fieldCount === 1) {
    const field = lottery.fields[0];
    let prob = probabilityOfMatch(field.from, field.count, field.count, matches[0]);
    
    // 12/24 complement symmetry
    if (lottery.id === 'lottery_12_24') {
      const complement = field.count - matches[0];
      if (complement !== matches[0]) {
        prob += probabilityOfMatch(field.from, field.count, field.count, complement);
      }
    }
    return prob;
  }
  
  if (lottery.fieldCount === 2 && matches.length === 2) {
    const field1 = lottery.fields[0];
    const field2 = lottery.fields[1];
    
    const prob1 = probabilityOfMatch(field1.from, field1.count, field1.count, matches[0]);
    const prob2 = probabilityOfMatch(field2.from, field2.count, field2.count, matches[1]);
    let prob = prob1 * prob2;
    
    // Symmetric 2-field lottery
    if (isSymmetric && matches[0] !== matches[1]) {
      const prob1Swap = probabilityOfMatch(field1.from, field1.count, field1.count, matches[1]);
      const prob2Swap = probabilityOfMatch(field2.from, field2.count, field2.count, matches[0]);
      prob += prob1Swap * prob2Swap;
    }
    return prob;
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
  
  // For pool_percentage lotteries: estimate number of tickets sold
  // Assumption: pool ≈ total ticket sales (simplified model)
  const estimatedTickets = ticketCost > 0 ? poolAmount / ticketCost : 0;

  // Calculate EV based on actual probabilities
  for (const row of prizeTable.rows) {
    // Calculate probability for this match combination FIRST
    // (needed for pool_percentage prize calculation)
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
      if (lottery.id === 'lottery_12_24') {
        const complementMatches = field.count - matches;
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

      probability = prob1 * prob2;
      
      // For symmetric 2-field lotteries (4из20): [a,b] and [b,a] win same prize
      if (isSymmetric && matches1 !== matches2) {
        const prob1Swap = probabilityOfMatch(
          field1.from,
          field1.count,
          field1.count,
          matches2
        );
        const prob2Swap = probabilityOfMatch(
          field2.from,
          field2.count,
          field2.count,
          matches1
        );
        probability += prob1Swap * prob2Swap;
      }
    }

    // Now calculate prize value
    let prizeValue = 0;
    
    if (row.prize === 'Суперприз' || row.prizeNote === 'Суперприз') {
      // Superprice is always the user-editable value, regardless of pool_percentage
      prizeValue = superprice;
    } else if (row.prize === 'Приз' && secondaryPrize) {
      prizeValue = secondaryPrize;
    } else if (typeof row.prize === 'number') {
      prizeValue = row.prize;
    } else if (row.prizePercent !== undefined && poolAmount > 0) {
      // For pool_percentage: prize pool is SHARED among all winners
      // Expected winners in this category = estimatedTickets * probability
      // Prize per winner = (percent * pool) / expectedWinners
      const totalPrizeForCategory = (row.prizePercent / 100) * poolAmount;
      const expectedWinners = estimatedTickets * probability;
      
      if (expectedWinners > 0) {
        prizeValue = totalPrizeForCategory / expectedWinners;
      } else {
        // Fallback: if no expected winners, use full prize (edge case)
        prizeValue = totalPrizeForCategory;
      }
    }

    if (prizeValue <= 0 || probability <= 0) continue;

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
 * For display purposes, shows larger number first (e.g., "4+3" not "3+4")
 * For 12/24: normalizes complement matches (0→12, 1→11, etc.)
 * @param matches - Match counts
 * @param lotteryId - Optional lottery ID for special handling
 * @returns Category label (e.g., "4+1", "3+0", etc.) with larger number first
 */
export function getPrizeCategory(matches: number[], lotteryId?: string): string {
  // Handle 12/24 complement symmetry
  if (lotteryId === 'lottery_12_24' && matches.length === 1) {
    const normalized = normalize12_24Matches(matches);
    return normalized[0].toString();
  }
  
  // For 2-field lotteries, display with larger number first (e.g., "4+3" not "3+4")
  if (matches.length === 2) {
    const [a, b] = matches;
    return a >= b ? `${a}+${b}` : `${b}+${a}`;
  }
  
  return matches.map((m) => m.toString()).join('+');
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
