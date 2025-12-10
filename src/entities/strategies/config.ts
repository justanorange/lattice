/**
 * Strategy Implementations
 * Simple, clear strategies
 *
 * Each strategy answers: "How many tickets do I need to buy?"
 * Result is always: ticketCount → user can edit, which updates budget
 */

import type { Strategy, StrategyParams } from './types';
import type { Lottery } from '../lottery/types';

/**
 * Strategy 1: Min Risk
 * Guarantee minimum winning tickets
 */
export const MIN_RISK_STRATEGY: Strategy = {
  id: 'min_risk',
  name: 'Гарантия минимального выигрыша',
  description: 'Сколько билетов нужно, чтобы гарантировать минимум N выигрышных',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'guaranteedWinningTickets',
      label: 'Минимум выигрышных билетов',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 20,
      description: 'Сколько билетов должны выиграть (как минимум)',
    },
  ],
};

/**
 * Strategy 2: Max Coverage
 * Maximize coverage of all combinations
 */
export const COVERAGE_STRATEGY: Strategy = {
  id: 'max_coverage',
  name: 'Максимальное покрытие',
  description: 'Покрыть максимум уникальных комбинаций чисел',
  supportedLotteries: [
    'lottery_4_20',
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_8_1',
  ],
  parameters: [
    {
      key: 'targetCoverage',
      label: 'Целевое покрытие (%)',
      type: 'number',
      defaultValue: 80,
      min: 10,
      max: 100,
      step: 10,
      description: 'Какой % всех комбинаций покрыть',
    },
  ],
};

/**
 * Strategy 3: Full Wheel
 * All combinations of selected numbers
 */
export const FULL_WHEEL_STRATEGY: Strategy = {
  id: 'full_wheel',
  name: 'Полное колесо',
  description: 'Все комбинации выбранных чисел - гарантированный выигрыш',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'wheelnumbers',
      label: 'Числа для колеса (через запятую)',
      type: 'text',
      defaultValue: '1,2,3,4,5,6,7,8,9,10',
      description: 'Список чисел (например: 5,10,15,20,25,30)',
    },
  ],
};

/**
 * Strategy 4: Key Wheel
 * Fixed key numbers + combinations
 */
export const KEY_WHEEL_STRATEGY: Strategy = {
  id: 'key_wheel',
  name: 'Колесо с ключевыми числами',
  description: 'Фиксированные числа + варианты из дополнительного набора',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'keyNumbers',
      label: 'Ключевые числа (через запятую)',
      type: 'text',
      defaultValue: '1,2',
      description: 'Числа которые будут во ВСЕХ билетах',
    },
    {
      key: 'additionalNumbers',
      label: 'Дополнительные числа (через запятую)',
      type: 'text',
      defaultValue: '3,4,5,6,7,8,9,10,11,12,13',
      description: 'Числа для комбинирования с ключевыми',
    },
  ],
};

/**
 * Strategy 5: Controlled Risk
 * User-defined risk tolerance
 */
export const RISK_STRATEGY: Strategy = {
  id: 'risk_strategy',
  name: 'Контролируемый риск',
  description: 'Выберите уровень риска - алгоритм рассчитает сколько билетов нужно',
  supportedLotteries: [
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_8_1',
  ],
  parameters: [
    {
      key: 'riskLevel',
      label: 'Уровень приемлемого риска (%)',
      type: 'range',
      defaultValue: 30,
      min: 1,
      max: 99,
      description: 'Риск = вероятность потерять потенциальный выигрыш (1-99%)',
    },
  ],
};

/**
 * All available strategies
 */
export const ALL_STRATEGIES: Record<string, Strategy> = {
  [MIN_RISK_STRATEGY.id]: MIN_RISK_STRATEGY,
  [COVERAGE_STRATEGY.id]: COVERAGE_STRATEGY,
  [FULL_WHEEL_STRATEGY.id]: FULL_WHEEL_STRATEGY,
  [KEY_WHEEL_STRATEGY.id]: KEY_WHEEL_STRATEGY,
  [RISK_STRATEGY.id]: RISK_STRATEGY,
};

/**
 * Get strategy by ID
 */
export function getStrategyById(id: string): Strategy | undefined {
  return ALL_STRATEGIES[id];
}

/**
 * Get strategies for lottery
 */
export function getStrategiesForLottery(lotteryId: string): Strategy[] {
  return Object.values(ALL_STRATEGIES).filter((s) =>
    s.supportedLotteries.includes(lotteryId)
  );
}

/**
 * Validate strategy parameters
 */
export function validateStrategyParams(
  strategyId: string,
  params: StrategyParams
): { valid: boolean; errors: string[] } {
  const strategy = getStrategyById(strategyId);
  if (!strategy) {
    return { valid: false, errors: [`Strategy not found: ${strategyId}`] };
  }

  const errors: string[] = [];

  for (const param of strategy.parameters) {
    const value = params[param.key];

    if (value === undefined && param.defaultValue === undefined) {
      errors.push(`Missing parameter: ${param.key}`);
      continue;
    }

    if (param.type === 'number' || param.type === 'range') {
      if (typeof value !== 'number') {
        errors.push(`${param.key} must be a number`);
      } else {
        if (param.min !== undefined && value < param.min) {
          errors.push(`${param.key} must be >= ${param.min}`);
        }
        if (param.max !== undefined && value > param.max) {
          errors.push(`${param.key} must be <= ${param.max}`);
        }
      }
    } else if (param.type === 'text') {
      if (typeof value !== 'string') {
        errors.push(`${param.key} must be a string`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate total combinations for lottery
 */
function getTotalCombinations(lottery: Lottery): number {
  let total = calculateCombinations(lottery.fields[0].from, lottery.fields[0].count);
  
  if (lottery.fieldCount === 2) {
    total *= calculateCombinations(lottery.fields[1].from, lottery.fields[1].count);
  }
  
  return total;
}

/**
 * Calculate win probability for single ticket in lottery
 */
function getWinProbabilityForTicket(lottery: Lottery): number {
  // This is approximate - probability of winning ANY prize (not just jackpot)
  // For 8+1 lottery: roughly 5-10% of tickets win something
  // For simplicity, using a lookup table per lottery
  
  const probabilities: Record<string, number> = {
    'lottery_8_1': 0.08, // ~8% win probability
    'lottery_6_45': 0.027, // ~2.7%
    'lottery_7_49': 0.022, // ~2.2%
    'lottery_5_36_1': 0.018, // ~1.8%
    'lottery_4_20': 0.03, // ~3%
  };
  
  return probabilities[lottery.id] || 0.05; // Default 5%
}

/**
 * Calculate ticket count for a strategy
 * This is the CORE calculation that all strategies must do
 */
export function calculateTicketCountForStrategy(
  strategyId: string,
  lottery: Lottery,
  params: StrategyParams,
  _ticketCost: number
): number {
  switch (strategyId) {
    case 'min_risk': {
      // Guarantee N winning tickets
      // Expected: if each ticket has prob p of winning
      // To guarantee k wins, need k/p tickets on average
      const guaranteed = (params['guaranteedWinningTickets'] as number) || 1;
      const winProb = getWinProbabilityForTicket(lottery);
      
      // Safety factor: multiply by 1.5 to increase odds
      return Math.ceil((guaranteed / winProb) * 1.5);
    }

    case 'max_coverage': {
      // Use Coupon Collector Problem formula
      // Expected tickets for P% coverage: -N * ln(1 - P)
      const coverage = (params['targetCoverage'] as number) || 80;
      const totalCombos = getTotalCombinations(lottery);
      const targetFraction = coverage / 100;
      
      if (targetFraction <= 0) return 1;
      if (targetFraction >= 0.99) return totalCombos;
      
      // Formula: tickets = -totalCombos * ln(1 - targetFraction)
      const tickets = Math.ceil(-totalCombos * Math.log(1 - targetFraction));
      
      // Cap at total combinations (can't exceed all possible tickets)
      return Math.min(tickets, totalCombos);
    }

    case 'full_wheel': {
      // Calculate combinations C(n, k) for all selected numbers
      const wheelnumbersStr = (params['wheelnumbers'] as string) || '';
      const numbers = wheelnumbersStr
        .split(',')
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n > 0);
      
      const selectionCount = lottery.fields[0].count;

      if (numbers.length < selectionCount) {
        return 0; // Can't make wheel with fewer numbers than needed
      }

      // C(n, k) = n! / (k! * (n-k)!)
      const combinations = calculateCombinations(numbers.length, selectionCount);
      return Math.max(1, combinations);
    }

    case 'key_wheel': {
      const keyStr = (params['keyNumbers'] as string) || '';
      const additionalStr = (params['additionalNumbers'] as string) || '';
      
      const keyNumbers = keyStr
        .split(',')
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n > 0);
      
      const additionalNumbers = additionalStr
        .split(',')
        .map((n) => parseInt(n.trim()))
        .filter((n) => !isNaN(n) && n > 0);
      
      const selectionCount = lottery.fields[0].count;
      const keyCount = keyNumbers.length;

      // Need to select (selectionCount - keyCount) from additional numbers
      const needed = Math.max(0, selectionCount - keyCount);
      
      if (additionalNumbers.length < needed) {
        return 0; // Can't make wheel
      }
      
      const combinations = calculateCombinations(additionalNumbers.length, needed);
      return Math.max(1, combinations);
    }

    case 'risk_strategy': {
      // Risk-based strategy
      // High risk (90%+) = few tickets
      // Low risk (1-10%) = many tickets
      const risk = (params['riskLevel'] as number) || 30;
      const totalCombos = getTotalCombinations(lottery);
      
      // Convert risk % to coverage %
      // Risk 1% = want 99% coverage (very safe)
      // Risk 99% = want 1% coverage (very risky)
      const targetCoverage = 100 - risk;
      
      if (targetCoverage < 1) return 1;
      if (targetCoverage >= 99) return totalCombos;
      
      // Use same formula as coverage strategy
      const tickets = Math.ceil(-totalCombos * Math.log(1 - targetCoverage / 100));
      return Math.min(tickets, totalCombos);
    }

    default:
      return 1;
  }
}

/**
 * Helper: Calculate binomial coefficient C(n, k)
 */
export function calculateCombinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = Math.floor((result * (n - i)) / (i + 1));
  }

  return result;
}
