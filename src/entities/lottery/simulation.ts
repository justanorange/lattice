/**
 * Lottery Simulation
 * Simulate multiple lottery draws with tickets
 */

import type {
  Lottery,
  Ticket,
  DrawResult,
  MatchResult,
  SimulationRound,
  SimulationResult,

  PrizeTable,
} from './types';
import { calculatePrizeAmount } from './calculation';
import { calculateSimulationStats } from '@/entities/calculations/statistics';
import { uniqueRandomNumbers } from '@/entities/calculations/combinatorics';

/**
 * Generate random draw for lottery
 */
function generateDraw(lottery: Lottery): DrawResult {
  const draw: DrawResult = {
    field1: [],
  };

  for (let i = 0; i < lottery.fields.length; i++) {
    const field = lottery.fields[i];
    const drawn = uniqueRandomNumbers(1, field.from, field.count);
    if (i === 0) {
      draw.field1 = drawn;
    } else {
      draw.field2 = drawn;
    }
  }

  return draw;
}

/**
 * Calculate matches between ticket and draw
 */
function calculateMatches(
  ticket: Ticket,
  draw: DrawResult,
  lottery: Lottery
): number[] {
  const matches: number[] = [];

  for (let i = 0; i < lottery.fields.length; i++) {
    const ticketField = i === 0 ? ticket.field1 : ticket.field2;
    const drawField = i === 0 ? draw.field1 : draw.field2;

    if (!ticketField || !drawField) continue;

    const matchCount = ticketField.filter((num) => drawField.includes(num))
      .length;
    matches.push(matchCount);
  }

  return matches;
}

/**
 * Simulate lottery draws
 *
 * @param lottery - Lottery to simulate
 * @param tickets - Tickets to simulate
 * @param roundsCount - Number of rounds to simulate
 * @param prizeTable - Prize table to use
 * @param superprice - Superprice amount
 * @param ticketCost - Cost per ticket
 * @param secondaryPrize - Secondary prize (if applicable)
 * @returns Simulation result
 */
export function simulateLottery(
  lottery: Lottery,
  tickets: Ticket[],
  roundsCount: number,
  prizeTable: PrizeTable,
  superprice: number,
  ticketCost: number,
  secondaryPrize?: number
): SimulationResult {
  const rounds: SimulationRound[] = [];
  let bankroll = 0;

  for (let roundNum = 1; roundNum <= roundsCount; roundNum++) {
    // Generate draw
    const draw = generateDraw(lottery);

    // Calculate matches and prizes for all tickets
    const matchResults: MatchResult[] = [];
    let totalPrizeThisRound = 0;

    for (const ticket of tickets) {
      const matches = calculateMatches(ticket, draw, lottery);
      const prize = calculatePrizeAmount(
        prizeTable,
        matches,
        superprice,
        secondaryPrize
      );

      const prizeValue =
        typeof prize === 'number' ? prize : prize === 'Суперприз' ? superprice : secondaryPrize || 0;

      matchResults.push({
        ticketIndex: tickets.indexOf(ticket),
        field1Matches: matches[0] || 0,
        field2Matches: matches[1],
        prizeWon: prizeValue,
        prizeCategory: matches.join('+'),
      });

      totalPrizeThisRound += prizeValue;
    }

    // Update bankroll
    bankroll -= ticketCost * tickets.length; // Cost
    bankroll += totalPrizeThisRound; // Winnings

    rounds.push({
      roundNumber: roundNum,
      draw,
      matches: matchResults,
      totalPrizeThisRound,
      bankroll,
    });
  }

  // Calculate statistics
  const statistics = calculateSimulationStats(rounds, ticketCost);

  return {
    lotteryId: lottery.id,
    tickets,
    ticketCost,
    roundsCount,
    rounds,
    simulatedAt: new Date(),
    statistics,
  };
}

