/**
 * Lottery Specific Constants
 * Risk levels, strategy availability, etc.
 */

// Risk levels for strategies (0-10)
export const RISK_LEVELS = {
  VERY_LOW: 1,
  LOW: 2,
  LOW_MEDIUM: 3,
  MEDIUM: 5,
  MEDIUM_HIGH: 6,
  HIGH: 8,
  VERY_HIGH: 10,
} as const;

// Strategy availability per lottery
export const LOTTERY_STRATEGIES: Record<string, string[]> = {
  '8_20_1': ['min_risk', 'coverage', 'key_wheel', 'budget_optimizer'],
  '4_20_2': ['min_risk', 'coverage', 'full_wheel', 'budget_optimizer'],
  '12_24': ['guaranteed_win', 'coverage', 'key_wheel'],
  '5_36_1': ['min_risk', 'coverage', 'budget_optimizer'],
  '6_45': ['min_risk', 'coverage', 'full_wheel', 'budget_optimizer'],
  '6_49': ['min_risk', 'coverage', 'full_wheel', 'budget_optimizer'],
} as const;

// Default parameters per lottery
export const LOTTERY_DEFAULTS: Record<string, {
  budget: number;
  ticketCount: number;
  spreadNumbers: boolean;
}> = {
  '8_20_1': { budget: 500, ticketCount: 10, spreadNumbers: true },
  '4_20_2': { budget: 1000, ticketCount: 5, spreadNumbers: false },
  '12_24': { budget: 100, ticketCount: 4, spreadNumbers: true },
  '5_36_1': { budget: 500, ticketCount: 20, spreadNumbers: true },
  '6_45': { budget: 1000, ticketCount: 50, spreadNumbers: false },
  '6_49': { budget: 500, ticketCount: 20, spreadNumbers: false },
} as const;

// Probability tiers for UI presentation
export const PROBABILITY_TIERS = {
  VIRTUALLY_IMPOSSIBLE: { min: 0, max: 0.00001, label: 'Практически невозможно' },
  EXTREMELY_RARE: { min: 0.00001, max: 0.0001, label: 'Чрезвычайно редко' },
  VERY_RARE: { min: 0.0001, max: 0.001, label: 'Очень редко' },
  RARE: { min: 0.001, max: 0.01, label: 'Редко' },
  UNCOMMON: { min: 0.01, max: 0.1, label: 'Необычно' },
  POSSIBLE: { min: 0.1, max: 1, label: 'Возможно' },
} as const;

// Expected value tiers
export const EV_TIERS = {
  VERY_NEGATIVE: { min: -1, max: -0.5, label: 'Очень отрицательное' },
  NEGATIVE: { min: -0.5, max: -0.1, label: 'Отрицательное' },
  POOR: { min: -0.1, max: 0, label: 'Плохое' },
  NEUTRAL: { min: 0, max: 0.1, label: 'Нейтральное' },
  GOOD: { min: 0.1, max: 0.5, label: 'Хорошее' },
  EXCELLENT: { min: 0.5, max: 1, label: 'Отличное' },
} as const;

// Coverage tiers (percent)
export const COVERAGE_TIERS = {
  MINIMAL: { min: 0, max: 10, label: 'Минимальное' },
  LOW: { min: 10, max: 25, label: 'Низкое' },
  MODERATE: { min: 25, max: 50, label: 'Умеренное' },
  GOOD: { min: 50, max: 75, label: 'Хорошее' },
  EXCELLENT: { min: 75, max: 95, label: 'Отличное' },
  COMPLETE: { min: 95, max: 100, label: 'Полное' },
} as const;
