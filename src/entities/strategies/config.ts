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
      type: 'range',
      defaultValue: 50,
      min: 1,
      max: 99,
      step: 1,
      description: 'Какой % всех комбинаций покрыть (экспоненциальная шкала)',
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
      label: 'Числа для колеса (через запятую или пробел)',
      type: 'text',
      defaultValue: '1 2 3 4 5 6 7 8 9 10',
      description: 'Список чисел (пример: 5 10 15 20 25 30 или 5,10,15,20,25,30)',
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
  description: 'Фиксированные числа во всех билетах + комбинации с другими числами',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'keyNumbers',
      label: 'Обязательные числа (через запятую или пробел)',
      type: 'text',
      defaultValue: '1 2 3 4',
      description: 'Эти числа будут во ВСЕХ сгенерированных билетах',
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
  description: 'Логарифмическая шкала: меньше риск = больше билетов',
  supportedLotteries: [
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_8_1',
  ],
  parameters: [
    {
      key: 'riskLevel',
      label: 'Риск (%)',
      type: 'range',
      defaultValue: 50,
      min: 1,
      max: 99,
      description: 'Риск не выиграть ничего (логарифмическая шкала)',
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
 * Helper: Parse numbers from string (supports both comma and space separators)
 */
function parseNumbers(str: string): number[] {
  return str
    .split(/[,\s]+/)
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n) && n > 0);
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
  const probabilities: Record<string, number> = {
    'lottery_8_1': 0.08,
    'lottery_6_45': 0.027,
    'lottery_7_49': 0.022,
    'lottery_5_36_1': 0.018,
    'lottery_4_20': 0.03,
  };
  
  return probabilities[lottery.id] || 0.05;
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
      const guaranteed = (params['guaranteedWinningTickets'] as number) || 1;
      const winProb = getWinProbabilityForTicket(lottery);
      return Math.ceil((guaranteed / winProb) * 1.5);
    }

    case 'max_coverage': {
      const coverage = (params['targetCoverage'] as number) || 50;
      const totalCombos = getTotalCombinations(lottery);
      const targetFraction = coverage / 100;
      
      if (targetFraction <= 0) return 1;
      if (targetFraction >= 0.99) return totalCombos;
      
      const tickets = Math.ceil(-totalCombos * Math.log(1 - targetFraction));
      return Math.min(tickets, totalCombos);
    }

    case 'full_wheel': {
      const wheelnumbersStr = (params['wheelnumbers'] as string) || '';
      const numbers = parseNumbers(wheelnumbersStr);
      const selectionCount = lottery.fields[0].count;

      if (numbers.length === 0) return 1;
      if (numbers.length < selectionCount) {
        return 0;
      }

      const combinations = calculateCombinations(numbers.length, selectionCount);
      return Math.max(1, combinations);
    }

    case 'key_wheel': {
      const keyStr = (params['keyNumbers'] as string) || '';
      const keyNumbers = parseNumbers(keyStr);
      const selectionCount = lottery.fields[0].count;
      const keyCount = keyNumbers.length;

      // Need to select (selectionCount - keyCount) from lottery range
      // Generate combinations from remaining pool
      const needed = Math.max(0, selectionCount - keyCount);
      
      if (keyCount > selectionCount) {
        // If we have more key numbers than needed, just return 1 (all key numbers)
        return 1;
      }

      // Remaining numbers available for random selection
      const remainingInPool = lottery.fields[0].from - keyCount;
      
      if (remainingInPool < needed) {
        return 0; // Can't make wheel
      }
      
      const combinations = calculateCombinations(remainingInPool, needed);
      return Math.max(1, combinations);
    }

    case 'risk_strategy': {
      const risk = (params['riskLevel'] as number) || 50;
      const totalCombos = getTotalCombinations(lottery);
      
      // Convert risk to coverage using logarithmic scale
      // Risk 1% = 95% coverage (very safe)
      // Risk 50% = 50% coverage (balanced)
      // Risk 99% = 5% coverage (very risky)
      const safetyFactor = Math.log(100 - risk + 1) / Math.log(100);
      const targetCoverage = safetyFactor * 90; // Max 90% to avoid extreme values
      
      const targetFraction = Math.max(0.01, Math.min(0.99, targetCoverage / 100));
      
      const tickets = Math.ceil(-totalCombos * Math.log(1 - targetFraction));
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
