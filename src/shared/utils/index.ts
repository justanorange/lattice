/**
 * Shared Utils Module
 * Common utility functions
 */

export {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatProbability,
  formatLargeNumber,
  formatOdds,
  formatDate,
  formatDuration,
} from './format';

export {
  isValidLotteryId,
  isValidStrategyId,
  isInRange,
  areUnique,
  areInRange,
  isValidTicket,
  isValidBudget,
  isValidTicketCount,
} from './validation';

export {
  safeJsonParse,
  sleep,
  debounce,
  throttle,
  clamp,
  generateId,
  deepClone,
  isEmpty,
  merge,
} from './common';
