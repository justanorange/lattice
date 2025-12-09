/**
 * Strategies Module
 * Complete strategy system for lottery plays
 */

export type {
  Strategy,
  StrategyParameter,
  StrategyParams,
  StrategyResult,
  StrategyGuarantee,
  LotteryStrategy,
  StrategyContext,
  StrategyComparison,
} from './types';

export { ALL_STRATEGIES, getStrategyById, getStrategiesForLottery, validateStrategyParams, getStrategyGuarantee } from './config';

export { executeStrategy } from './generator';

export { compareTwo, compareMultiple, getBestStrategy, analyzeStrategy, calculateExpectedValue, calculateEfficiency, calculateRiskLevel } from './comparison';
