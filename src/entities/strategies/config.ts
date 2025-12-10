/**
 * Strategy Implementations
 * Complete implementations of lottery strategies
 *
 * Strategy Types:
 * 1. Min Risk - Минимизация риска (гарантия минимального выигрыша)
 * 2. Max Coverage - Максимальное покрытие (охватить все возможные комбинации)
 * 3. Full Wheel - Полное колесо (все комбинации выбранных чисел)
 * 4. Key Wheel - Колесо с ключевыми числами (фиксированные числа + варианты)
 * 5. Risk Strategy - Стратегия с риском (контролируемая вероятность выигрыша)
 */

import type {
  Strategy,
  StrategyParams,
  StrategyGuarantee,
} from './types';
import type { Lottery } from '../lottery/types';

/**
 * Strategy 1: Minimum Risk
 * Guaranteed minimum win - ensures P(at least N matches) >= target probability
 * Result: Number of tickets needed + expected value
 */
export const MIN_RISK_STRATEGY: Strategy = {
  id: 'min_risk',
  name: 'Гарантия минимального выигрыша',
  description:
    'Гарантирует минимальное количество выигрышных билетов с заданной вероятностью',
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
      key: 'targetProbability',
      label: 'Вероятность гарантии (%)',
      type: 'number',
      defaultValue: 99,
      min: 50,
      max: 100,
      step: 5,
      description: 'Вероятность получить хотя бы один выигрыш',
    },
  ],
};

/**
 * Strategy 2: Maximum Coverage
 * Cover all possible combinations with given budget
 * Result: Number of tickets that fit budget + coverage % + expected value
 */
export const COVERAGE_STRATEGY: Strategy = {
  id: 'max_coverage',
  name: 'Максимальное покрытие',
  description:
    'Максимизирует покрытие всех комбинаций при фиксированном бюджете',
  supportedLotteries: [
    'lottery_4_20',
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_8_1',
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
      description: 'Максимально денег на билеты',
    },
  ],
};

/**
 * Strategy 3: Full Wheel
 * Play all combinations of selected numbers
 * Result: Exact number of tickets for full coverage + 100% expected value
 */
export const FULL_WHEEL_STRATEGY: Strategy = {
  id: 'full_wheel',
  name: 'Полное колесо',
  description:
    'Играет все возможные комбинации выбранных чисел - гарантированный выигрыш если совпадут все числа',
  supportedLotteries: ['lottery_6_45', 'lottery_7_49', 'lottery_5_36_1', 'lottery_8_1'],
  parameters: [
    {
      key: 'selectedNumbers',
      label: 'Количество чисел в колесе',
      type: 'number',
      defaultValue: 10,
      min: 6,
      max: 20,
      description: 'Количество чисел (должно быть > требуемому выбору)',
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
 * Strategy 5B: Risk Strategy
 * Controlled probability of win - with risk slider
 * Risk% = probability of losing the potential win
 */
export const RISK_STRATEGY: Strategy = {
  id: 'risk_strategy',
  name: 'Стратегия с контролируемым риском',
  description:
    'Определяет количество билетов для достижения целевой вероятности выигрыша с учетом приемлемого риска потери',
  supportedLotteries: [
    'lottery_6_45',
    'lottery_7_49',
    'lottery_5_36_1',
    'lottery_8_1',
  ],
  parameters: [
    {
      key: 'targetMatches',
      label: 'Целевое количество совпадений',
      type: 'number',
      defaultValue: 3,
      min: 2,
      max: 5,
      description: 'Минимум совпадений для выигрыша',
    },
    {
      key: 'riskLevel',
      label: 'Уровень приемлемого риска (%)',
      type: 'range',
      defaultValue: 30,
      min: 1,
      max: 50,
      description: 'Вероятность потерять потенциальный выигрыш (чем выше - больше билетов)',
    },
    {
      key: 'budget',
      label: 'Максимальный бюджет (₽)',
      type: 'number',
      defaultValue: 5000,
      min: 100,
      max: 100000,
      step: 100,
      description: 'Максимум денег на билеты',
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
  _strategy: Strategy,
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
