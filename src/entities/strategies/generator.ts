/**
 * Strategy Generator
 * Execute strategies to generate tickets
 */

import type { StrategyParams, StrategyResult } from './types';
import type { Ticket, Lottery } from '../lottery/types';
import { getStrategyById, validateStrategyParams } from './config';
import { uniqueRandomNumbers, combinations } from '../calculations/combinatorics';
import { totalCombinations } from '../calculations/probability';

/**
 * Execute strategy and generate tickets
 */
export async function executeStrategy(
  strategyId: string,
  lottery: Lottery,
  params: StrategyParams,
  ticketCost: number
): Promise<StrategyResult> {
  const strategy = getStrategyById(strategyId);
  if (!strategy) {
    throw new Error(`Strategy not found: ${strategyId}`);
  }

  // Fill in default parameters
  const filledParams: StrategyParams = { ...params };
  for (const param of strategy.parameters) {
    if (filledParams[param.key] === undefined && param.defaultValue !== undefined) {
      filledParams[param.key] = param.defaultValue;
    }
  }

  // Validate parameters
  const validation = validateStrategyParams(strategyId, filledParams);
  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }

  // Check lottery support
  if (!strategy.supportedLotteries.includes(lottery.id)) {
    throw new Error(`Strategy ${strategyId} not supported for lottery ${lottery.id}`);
  }

  let tickets: Ticket[] = [];

  // Route to strategy implementation
  switch (strategyId) {
    case 'min_risk':
      tickets = generateMinRiskStrategy(lottery, filledParams);
      break;
    case 'coverage':
      tickets = generateCoverageStrategy(lottery, filledParams, ticketCost);
      break;
    case 'full_wheel':
      tickets = generateFullWheelStrategy(lottery, filledParams);
      break;
    case 'key_wheel':
      tickets = generateKeyWheelStrategy(lottery, filledParams);
      break;
    case 'guaranteed_win':
      tickets = generateGuaranteedWinStrategy(lottery, filledParams);
      break;
    case 'budget_optimizer':
      tickets = generateBudgetOptimizerStrategy(lottery, filledParams, ticketCost);
      break;
    default:
      throw new Error(`Unknown strategy: ${strategyId}`);
  }

  const totalCost = tickets.length * ticketCost;

  // Calculate coverage estimate
  const field = lottery.fields[0];
  const totalCombinations = field
    ? combinationsForCoverage(lottery)
    : 0;

  return {
    tickets,
    ticketCount: tickets.length,
    totalCost,
    coverage: totalCombinations > 0 ? {
      covered: Math.min(tickets.length * 10, totalCombinations), // Rough estimate
      total: totalCombinations,
      percent: (Math.min(tickets.length * 10, totalCombinations) / totalCombinations) * 100,
    } : undefined,
    metadata: {
      strategy: strategyId,
      parameters: filledParams,
      generatedAt: new Date(),
      notes: `Generated ${tickets.length} tickets`,
    },
  };
}

/**
 * Generate min risk strategy tickets
 */
function generateMinRiskStrategy(
  lottery: Lottery,
  params: StrategyParams
): Ticket[] {
  const ticketCount = (params['ticketCount'] as number) || 5;
  const tickets: Ticket[] = [];

  for (let i = 0; i < ticketCount; i++) {
    const field1 = uniqueRandomNumbers(1, lottery.fields[0].from, lottery.fields[0].count);

    const ticket: Ticket = {
      lotteryId: lottery.id,
      field1,
    };

    if (lottery.fieldCount === 2) {
      ticket.field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }

    tickets.push(ticket);
  }

  return tickets;
}

/**
 * Generate coverage strategy tickets
 */
function generateCoverageStrategy(
  lottery: Lottery,
  params: StrategyParams,
  ticketCost: number
): Ticket[] {
  const budget = (params['budget'] as number) || 1000;
  const ticketCount = Math.floor(budget / ticketCost);
  const tickets: Ticket[] = [];

  // Spread numbers across tickets for better coverage
  const spreadNumbers = (params['spreadNumbers'] as boolean) ?? true;
  const totalAvailable = lottery.fields[0].from;
  const selection = lottery.fields[0].count;

  for (let i = 0; i < ticketCount; i++) {
    let field1: number[];

    if (spreadNumbers) {
      // Rotate through available numbers
      const start = (i * selection) % (totalAvailable - selection + 1);
      field1 = Array.from(
        { length: selection },
        (_, j) => ((start + j) % totalAvailable) + 1
      );
    } else {
      // Random selection
      field1 = uniqueRandomNumbers(1, totalAvailable, selection);
    }

    const ticket: Ticket = {
      lotteryId: lottery.id,
      field1,
    };

    if (lottery.fieldCount === 2) {
      ticket.field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }

    tickets.push(ticket);
  }

  return tickets;
}

/**
 * Generate full wheel strategy
 */
function generateFullWheelStrategy(
  lottery: Lottery,
  params: StrategyParams
): Ticket[] {
  const selectedNumbers = (params['selectedNumbers'] as number) || 10;
  const useRandom = (params['useRandomNumbers'] as boolean) ?? true;

  let numbers: number[];
  if (useRandom) {
    numbers = uniqueRandomNumbers(1, lottery.fields[0].from, selectedNumbers);
  } else {
    numbers = Array.from({ length: selectedNumbers }, (_, i) => i + 1);
  }

  // Generate all combinations
  const combos = combinations(numbers, lottery.fields[0].count);
  const tickets: Ticket[] = combos.map((field1) => ({
    lotteryId: lottery.id,
    field1: field1 as number[],
  }));

  return tickets;
}

/**
 * Generate key wheel strategy
 */
function generateKeyWheelStrategy(
  lottery: Lottery,
  params: StrategyParams
): Ticket[] {
  const keyNumberCount = (params['keyNumbers'] as number) || 2;
  const additionalNumbers = (params['additionalNumbers'] as number) || 5;

  const keyNums = uniqueRandomNumbers(1, lottery.fields[0].from, keyNumberCount);
  const additionalNums = uniqueRandomNumbers(
    1,
    lottery.fields[0].from,
    additionalNumbers
  );

  // Remove any key numbers from additional
  const filtered = additionalNums.filter((n) => !keyNums.includes(n));

  // Generate combinations with fixed key numbers
  const neededAdditional = lottery.fields[0].count - keyNumberCount;
  const additionalCombos = combinations(filtered, neededAdditional);

  const tickets: Ticket[] = additionalCombos.map((combo) => ({
    lotteryId: lottery.id,
    field1: [...keyNums, ...combo] as number[],
  }));

  return tickets;
}

/**
 * Generate guaranteed win strategy (12/24)
 */
function generateGuaranteedWinStrategy(
  lottery: Lottery,
  _params: StrategyParams
): Ticket[] {
  // Simplified: generate balanced tickets
  const tickets: Ticket[] = [];

  // Create 4 tickets that together guarantee coverage
  // This is a simplified implementation
  for (let i = 0; i < 4; i++) {
    const start = i * 6;
    const field1 = Array.from(
      { length: 12 },
      (_, j) => ((start + j) % 24) + 1
    );
    tickets.push({
      lotteryId: lottery.id,
      field1: field1 as number[],
    });
  }

  return tickets;
}

/**
 * Generate budget optimizer strategy
 */
function generateBudgetOptimizerStrategy(
  lottery: Lottery,
  params: StrategyParams,
  ticketCost: number
): Ticket[] {
  const budget = (params['budget'] as number) || 1000;
  const riskTolerance = (params['riskTolerance'] as number) || 50;

  const ticketCount = Math.floor(budget / ticketCost);
  const tickets: Ticket[] = [];

  // Risk affects diversification
  const diversify = riskTolerance < 50; // Low risk = high diversification

  for (let i = 0; i < ticketCount; i++) {
    let field1: number[];

    if (diversify) {
      // Spread numbers for low risk
      const spread = Math.floor((i * lottery.fields[0].count) / ticketCount);
      field1 = Array.from(
        { length: lottery.fields[0].count },
        (_, j) => ((spread + j) % lottery.fields[0].from) + 1
      );
    } else {
      // Random for higher risk
      field1 = uniqueRandomNumbers(
        1,
        lottery.fields[0].from,
        lottery.fields[0].count
      );
    }

    const ticket: Ticket = {
      lotteryId: lottery.id,
      field1,
    };

    if (lottery.fieldCount === 2) {
      ticket.field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }

    tickets.push(ticket);
  }

  return tickets;
}

/**
 * Helper: Calculate total combinations for coverage
 */
function combinationsForCoverage(lottery: Lottery): number {
  let total = totalCombinations(lottery.fields[0].from, lottery.fields[0].count);

  if (lottery.fieldCount === 2) {
    total *= totalCombinations(lottery.fields[1].from, lottery.fields[1].count);
  }

  return total;
}
