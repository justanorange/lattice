/**
 * Strategy Generator
 * Execute strategies to generate tickets
 */

import type { StrategyParams, StrategyResult } from './types';
import type { Ticket, Lottery } from '@/entities/lottery/types';
import { getStrategyById, validateStrategyParams, calculateCombinations } from './config';
import { uniqueRandomNumbers } from '@/entities/calculations/combinatorics';

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
 * Generate min risk strategy - random diverse combinations
 */
function generateMinRiskStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate requested number of tickets with good distribution
  const count = requestedTicketCount || 10;
  return generateDiverseTickets(lottery, count);
}

/**
 * Generate coverage strategy - diverse combinations with max coverage
 */
function generateCoverageStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate random tickets for coverage with diversity
  const count = requestedTicketCount || 50;
  return generateDiverseTickets(lottery, count);
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
 * Generate key wheel strategy - fixed key numbers + diverse random combinations
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

  // Generate diverse combinations from remaining pool
  const needed = selectionCount - keyCount;
  const allNumbers = Array.from({ length: lottery.fields[0].from }, (_, i) => i + 1);
  
  // Remove key numbers from available pool
  const availableNumbers = allNumbers.filter((n) => !keyNumbers.includes(n));

  if (availableNumbers.length < needed) {
    // Not enough numbers available
    return [];
  }

  // Generate all combinations from available numbers
  const allCombos = generateCombinations(availableNumbers, needed);

  // If we have more combinations than we can reasonably use, sample randomly
  let combosToUse = allCombos;
  const MAX_REASONABLE_COMBOS = 1000;
  
  if (allCombos.length > MAX_REASONABLE_COMBOS) {
    // Sample random combinations instead of using all
    combosToUse = [];
    const usedIndices = new Set<number>();
    
    while (combosToUse.length < Math.min(MAX_REASONABLE_COMBOS, allCombos.length)) {
      const randomIndex = Math.floor(Math.random() * allCombos.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        combosToUse.push(allCombos[randomIndex]);
      }
    }
  }

  const tickets: Ticket[] = combosToUse.map((additionalNums) => {
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
 * Generate risk strategy - fewer tickets but diverse
 */
function generateRiskStrategy(
  lottery: Lottery,
  _params: StrategyParams,
  requestedTicketCount: number | null
): Ticket[] {
  // Generate requested number of tickets with good distribution
  const count = requestedTicketCount || 5;
  return generateDiverseTickets(lottery, count);
}

/**
 * Count intersection between two tickets (how many numbers match)
 */
function countIntersection(ticket1: number[], ticket2: number[]): number {
  const set2 = new Set(ticket2);
  return ticket1.filter((n) => set2.has(n)).length;
}

/**
 * Generate N diverse tickets with good spread
 * Uses random combinations that don't overlap too much
 */
function generateDiverseTickets(lottery: Lottery, count: number): Ticket[] {
  const field = lottery.fields[0];
  const selectionCount = field.count;
  const maxTries = 50; // Try up to 50 times to find a diverse ticket
  const maxIntersection = Math.max(1, Math.floor(selectionCount / 3)); // Allow up to 1/3 overlap

  const tickets: Ticket[] = [];
  const usedCombos = new Set<string>();

  for (let i = 0; i < count; i++) {
    let field1: number[] | null = null;
    let attempts = 0;

    // Try to generate a ticket that doesn't overlap too much with previous ones
    while (!field1 && attempts < maxTries) {
      const candidate = uniqueRandomNumbers(1, field.from, selectionCount);
      const comboKey = candidate.join(',');

      // Check if we've already used this exact combination
      if (usedCombos.has(comboKey)) {
        attempts++;
        continue;
      }

      // Check overlap with existing tickets
      let tooMuchOverlap = false;
      for (const existingTicket of tickets) {
        const intersection = countIntersection(candidate, existingTicket.field1);
        if (intersection > maxIntersection) {
          tooMuchOverlap = true;
          break;
        }
      }

      if (!tooMuchOverlap) {
        field1 = candidate;
        usedCombos.add(comboKey);
      } else {
        attempts++;
      }
    }

    // If we couldn't find a diverse one after maxTries, just use the best we have
    if (!field1) {
      field1 = uniqueRandomNumbers(1, field.from, selectionCount);
      usedCombos.add(field1.join(','));
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
export function combinationsForCoverage(lottery: Lottery): number {
  let total = calculateCombinations(lottery.fields[0].from, lottery.fields[0].count);

  if (lottery.fieldCount === 2) {
    total *= calculateCombinations(lottery.fields[1].from, lottery.fields[1].count);
  }

  return total;
}
