/**
 * Strategy Type Definitions
 * Comprehensive types for lottery playing strategies
 */

import type { Ticket, Lottery } from '../lottery/types';

/**
 * Base strategy interface
 */
export interface Strategy {
  /** Unique strategy identifier */
  id: string;
  /** Russian name of strategy */
  name: string;
  /** Russian description */
  description: string;
  /** Lotteries this strategy supports */
  supportedLotteries: string[];
  /** Parameter schema for this strategy */
  parameters: StrategyParameter[];
}

/**
 * Strategy parameter definition
 */
export interface StrategyParameter {
  /** Parameter key */
  key: string;
  /** Russian label */
  label: string;
  /** Parameter type */
  type: 'number' | 'boolean' | 'select' | 'range';
  /** Default value */
  defaultValue: unknown;
  /** Min value (for number/range) */
  min?: number;
  /** Max value (for number/range) */
  max?: number;
  /** Step size (for number/range) */
  step?: number;
  /** Options (for select) */
  options?: Array<{ label: string; value: unknown }>;
  /** Parameter description */
  description?: string;
}

/**
 * Strategy parameters for execution
 */
export interface StrategyParams {
  [key: string]: unknown;
}

/**
 * Result of strategy execution
 */
export interface StrategyResult {
  /** Generated tickets */
  tickets: Ticket[];
  /** Number of tickets generated */
  ticketCount: number;
  /** Total cost */
  totalCost: number;
  /** Coverage statistics */
  coverage?: {
    /** Combinations covered */
    covered: number;
    /** Total possible combinations */
    total: number;
    /** Coverage percentage */
    percent: number;
  };
  /** Strategy metadata */
  metadata: {
    /** Strategy used */
    strategy: string;
    /** Parameters used */
    parameters: StrategyParams;
    /** Generation timestamp */
    generatedAt: Date;
    /** Expected value of strategy */
    expectedValue?: number;
    /** Risk assessment */
    riskLevel?: 'low' | 'medium' | 'high';
    /** Additional notes */
    notes?: string;
  };
}

/**
 * Strategy capability/guarantee
 */
export interface StrategyGuarantee {
  /** Description of guarantee */
  description: string;
  /** Minimum matches guaranteed */
  guaranteedMatches: number;
  /** Required budget in rubles */
  requiredBudget: number;
  /** Number of tickets needed */
  ticketCount: number;
  /** Probability of achieving goal */
  probability?: number;
  /** Conditions/notes */
  conditions?: string;
}

/**
 * Lottery-specific strategy availability
 */
export interface LotteryStrategy {
  /** Lottery ID */
  lotteryId: string;
  /** Available strategy IDs for this lottery */
  strategyIds: string[];
  /** Recommended strategy for this lottery */
  recommended?: string;
  /** Notes specific to lottery */
  notes?: string;
}

/**
 * Strategy execution context
 */
export interface StrategyContext {
  /** Lottery definition */
  lottery: Lottery;
  /** Budget in rubles */
  budget: number;
  /** Ticket cost */
  ticketCost: number;
  /** Current superprice */
  superprice: number;
  /** Prize table */
  prizeTable: unknown;
  /** Additional context */
  [key: string]: unknown;
}

/**
 * Strategy comparison result
 */
export interface StrategyComparison {
  /** Strategy 1 ID */
  strategy1: string;
  /** Strategy 2 ID */
  strategy2: string;
  /** Expected value difference */
  evDifference: number;
  /** Coverage difference */
  coverageDifference: number;
  /** Better strategy (1, 2, or 0 for equal) */
  better: 1 | 2 | 0;
  /** Reasoning */
  reasoning: string;
}
