/**
 * Strategy Implementations
 * Complete implementations of lottery strategies
 */

import type {
  Strategy,
  StrategyResult,
  StrategyParams,
  StrategyGuarantee,
} from './types';
import type { Lottery, Ticket } from '../lottery/types';
import { combinations, randomSample, uniqueRandomNumbers } from '../calculations/combinatorics';
import { totalCombinations } from '../calculations/probability';

/**
 * Strategy 1: Minimum Risk
 * Maximize probability of at least minimum prize
 */
export const MIN_RISK_STRATEGY: Strategy = {
  id: 'min_risk',
  name: 'Минимизация риска',
  description:
    'Максимизирует вероятность хотя бы минимального приза (2-3 совпадения)',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'targetMatches',
      label: 'Минимум совпадений',
      type: 'number',
      defaultValue: 3,
      min: 2,
      max: 5,
      description: 'Минимальное количество совпадений для победы',
    },
    {
      key: 'ticketCount',
      label: 'Количество билетов',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100,
      description: 'Сколько билетов сгенерировать',
    },
  ],
};

/**
 * Strategy 2: Coverage
 * Maximum coverage with fixed budget
 */
export const COVERAGE_STRATEGY: Strategy = {
  id: 'coverage',
  name: 'Максимальное покрытие',
  description:
    'Максимизирует количество покрытых комбинаций при фиксированном бюджете',
  supportedLotteries: [
    'lottery_4_20',
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
  ],
  parameters: [
    {
      key: 'budget',
      label: 'Бюджет (₽)',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 100000,
      step: 100,
      description: 'Сколько денег потратить',
    },
    {
      key: 'spreadNumbers',
      label: 'Распределять числа',
      type: 'boolean',
      defaultValue: true,
      description: 'Распределять числа равномерно для лучшего покрытия',
    },
  ],
};

/**
 * Strategy 3: Full Wheel
 * Play all combinations of selected numbers
 */
export const FULL_WHEEL_STRATEGY: Strategy = {
  id: 'full_wheel',
  name: 'Полное колесо',
  description:
    'Играет все возможные комбинации выбранных чисел - гарантирует выигрыш если все числа совпадут',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'selectedNumbers',
      label: 'Выбранные числа',
      type: 'number',
      defaultValue: 10,
      min: 6,
      max: 20,
      description: 'Количество чисел для колеса (больше числа выборок)',
    },
    {
      key: 'useRandomNumbers',
      label: 'Использовать случайные числа',
      type: 'boolean',
      defaultValue: true,
      description: 'Если ложь, использовать числа 1,2,3... до N',
    },
  ],
};

/**
 * Strategy 4: Key Wheel
 * Abbreviated wheel with key numbers fixed
 */
export const KEY_WHEEL_STRATEGY: Strategy = {
  id: 'key_wheel',
  name: 'Колесо с ключевыми числами',
  description:
    'Фиксирует 2-3 «счастливых» числа и комбинирует их с остальным минимальным набором',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'keyNumbers',
      label: 'Количество ключевых чисел',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 4,
      description: 'Числа которые будут во всех билетах',
    },
    {
      key: 'additionalNumbers',
      label: 'Дополнительные числа',
      type: 'number',
      defaultValue: 5,
      min: 3,
      max: 15,
      description: 'Дополнительные числа для комбинирования',
    },
  ],
};

/**
 * Strategy 5: Guaranteed Win
 * Specialized for 12/24 lottery - guaranteed win on any draw
 */
export const GUARANTEED_WIN_STRATEGY: Strategy = {
  id: 'guaranteed_win',
  name: 'Гарантированный выигрыш',
  description:
    'Специально для лотереи 12/24 - гарантирует выигрыш при любом раскладе (0 или 12 всегда выигрыш)',
  supportedLotteries: ['lottery_12_24'],
  parameters: [
    {
      key: 'blockDesign',
      label: 'Используемая конструкция',
      type: 'select',
      defaultValue: 'optimal',
      options: [
        { label: 'Оптимальная', value: 'optimal' },
        { label: 'Простая', value: 'simple' },
        { label: 'Максимальная', value: 'maximum' },
      ],
      description: 'Конструкция блок-дизайна для покрытия',
    },
  ],
};

/**
 * Strategy 6: Budget Optimizer
 * Maximize expected value with given budget
 */
export const BUDGET_OPTIMIZER_STRATEGY: Strategy = {
  id: 'budget_optimizer',
  name: 'Оптимизация по бюджету',
  description:
    'Выбирает оптимальное количество билетов для максимизации ожидаемого возврата при заданном бюджете',
  supportedLotteries: [
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_4_20',
  ],
  parameters: [
    {
      key: 'budget',
      label: 'Бюджет (₽)',
      type: 'number',
      defaultValue: 1000,
      min: 100,
      max: 100000,
      step: 100,
    },
    {
      key: 'riskTolerance',
      label: 'Допустимый риск',
      type: 'range',
      defaultValue: 50,
      min: 10,
      max: 90,
      description: 'Процент риска (выше = более рискованно)',
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
  [GUARANTEED_WIN_STRATEGY.id]: GUARANTEED_WIN_STRATEGY,
  [BUDGET_OPTIMIZER_STRATEGY.id]: BUDGET_OPTIMIZER_STRATEGY,
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

    if (value === undefined) {
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
    } else if (param.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push(`${param.key} must be a boolean`);
      }
    } else if (param.type === 'select') {
      if (!param.options?.some((o) => o.value === value)) {
        errors.push(`${param.key} has invalid value`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Generate guarantee info for a strategy
 */
export function getStrategyGuarantee(
  strategy: Strategy,
  lottery: Lottery,
  params: StrategyParams
): StrategyGuarantee | null {
  // Implement guarantee info based on strategy type
  // This is a placeholder - actual implementation varies by strategy

  const ticketCost = lottery.defaultTicketCost;
  const budget = (params['budget'] as number) || 1000;
  const ticketCount = Math.floor(budget / ticketCost);

  return {
    description: `${ticketCount} билетов при бюджете ${budget} ₽`,
    guaranteedMatches: 0,
    requiredBudget: budget,
    ticketCount,
    probability: 0.5,
    conditions: 'Вероятность зависит от раскладов',
  };
}
