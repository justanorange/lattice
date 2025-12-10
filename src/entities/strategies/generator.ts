/**
 * Strategy Generator
 * Execute strategies to generate tickets
 */

import type { StrategyParams, StrategyResult } from './types';
import type { Ticket, Lottery } from '../lottery/types';
import { getStrategyById, validateStrategyParams, calculateCombinations } from './config';
import { uniqueRandomNumbers } from '../calculations/combinatorics';

/**
 * Helper: Parse numbers from string (supports both comma and space separators)
 */
function parseNumbers(str: string): number[] {
  return str
    .split(/[,\s]+/)
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n) && n > 0);
}

/**
 * Generate all combinations of elements
 */
function generateCombinations(elements: number[], r: number): number[][] {
  if (r === 0) return [[]];
  if (elements.length === 0) return [];
  
  const result: number[][] = [];
  const [first, ...rest] = elements;
  
  // Combinations that include the first element
  const combosWithFirst = generateCombinations(rest, r - 1);
  for (const combo of combosWithFirst) {
    result.push([first, ...combo]);
  }
  
  // Combinations that don't include the first element
  const combosWithoutFirst = generateCombinations(rest, r);
  result.push(...combosWithoutFirst);
  
  return result;
}

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

  // Get ticket count from params (passed from UI)
  const requestedTicketCount = (filledParams['ticketCount'] as number) || null;

  // Route to strategy implementation
  switch (strategyId) {
    case 'min_risk':
      tickets = generateMinRiskStrategy(lottery, filledParams, requestedTicketCount);
      break;
    case 'max_coverage':
      tickets = generateCoverageStrategy(lottery, filledParams, requestedTicketCount);
      break;
    case 'full_wheel':
      tickets = generateFullWheelStrategy(lottery, filledParams);
      break;
    case 'key_wheel':
      tickets = generateKeyWheelStrategy(lottery, filledParams);
      break;
    case 'risk_strategy':
      tickets = generateRiskStrategy(lottery, filledParams, requestedTicketCount);
      break;
    default:
      throw new Error(`Unknown strategy: ${strategyId}`);
  }

  const effectiveTicketCount = tickets.length;
  const totalCost = effectiveTicketCount * ticketCost;

  return {
    tickets,
    ticketCount: effectiveTicketCount,
    totalCost,
    metadata: {
      strategy: strategyId,
      parameters: filledParams,
      generatedAt: new Date(),
    },
  };
}

/**
 * Generate min risk strategy
 */
function generateMinRiskStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate requested number of tickets, or full random
  const count = requestedTicketCount || 10;
  return generateTicketsCount(lottery, count);
}

/**
 * Generate coverage strategy
 */
function generateCoverageStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate random tickets for coverage
  const count = requestedTicketCount || 50;
  return generateTicketsCount(lottery, count);
}

/**
 * Generate full wheel strategy
 */
function generateFullWheelStrategy(
  lottery: Lottery,
  params: StrategyParams
): Ticket[] {
  const wheelnumbersStr = (params['wheelnumbers'] as string) || '';
  const numbers = parseNumbers(wheelnumbersStr);
  
  if (numbers.length === 0) {
    // No numbers provided, return empty
    return [];
  }

  const selectionCount = lottery.fields[0].count;
  
  if (numbers.length < selectionCount) {
    // Not enough numbers for wheel
    return [];
  }

  // Generate all combinations
  const combos = generateCombinations(numbers, selectionCount);
  
  const tickets: Ticket[] = combos.map((field1) => {
    const ticket: Ticket = {
      lotteryId: lottery.id,
      field1: field1.sort((a, b) => a - b),
    };

    if (lottery.fieldCount === 2) {
      // For second field, use random numbers
      ticket.field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }

    return ticket;
  });

  return tickets;
}

/**
 * Generate key wheel strategy
 */
function generateKeyWheelStrategy(
  lottery: Lottery,
  params: StrategyParams
): Ticket[] {
  const keyStr = (params['keyNumbers'] as string) || '';
  const keyNumbers = parseNumbers(keyStr);

  if (keyNumbers.length === 0) {
    // No key numbers, return empty
    return [];
  }

  const selectionCount = lottery.fields[0].count;
  const keyCount = keyNumbers.length;

  if (keyCount > selectionCount) {
    // Key numbers exceed selection count, just return tickets with key numbers
    const tickets: Ticket[] = [{
      lotteryId: lottery.id,
      field1: keyNumbers.slice(0, selectionCount),
    }];
    
    if (lottery.fieldCount === 2) {
      tickets[0].field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }
    
    return tickets;
  }

  // Generate combinations from remaining pool
  const needed = selectionCount - keyCount;
  const allNumbers = Array.from({ length: lottery.fields[0].from }, (_, i) => i + 1);
  
  // Remove key numbers from available pool
  const availableNumbers = allNumbers.filter((n) => !keyNumbers.includes(n));

  if (availableNumbers.length < needed) {
    // Not enough numbers available
    return [];
  }

  // Generate combinations from available numbers
  const combos = generateCombinations(availableNumbers, needed);

  const tickets: Ticket[] = combos.map((additionalNums) => {
    const ticket: Ticket = {
      lotteryId: lottery.id,
      field1: [...keyNumbers, ...additionalNums].sort((a, b) => a - b),
    };

    if (lottery.fieldCount === 2) {
      ticket.field2 = uniqueRandomNumbers(
        1,
        lottery.fields[1].from,
        lottery.fields[1].count
      );
    }

    return ticket;
  });

  return tickets;
}

/**
 * Generate risk strategy
 */
function generateRiskStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate requested number of tickets
  const count = requestedTicketCount || 5;
  return generateTicketsCount(lottery, count);
}

/**
 * Helper: Generate exactly N random tickets
 */
function generateTicketsCount(lottery: Lottery, count: number): Ticket[] {
  const tickets: Ticket[] = [];

  for (let i = 0; i < count; i++) {
    const field1 = uniqueRandomNumbers(
      1,
      lottery.fields[0].from,
      lottery.fields[0].count
    );

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
export function combinationsForCoverage(lottery: Lottery): number {
  let total = calculateCombinations(lottery.fields[0].from, lottery.fields[0].count);

  if (lottery.fieldCount === 2) {
    total *= calculateCombinations(lottery.fields[1].from, lottery.fields[1].count);
  }

  return total;
}
