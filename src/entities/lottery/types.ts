/**
 * Lottery Type Definitions
 * Comprehensive type system for all 6 supported Russian lotteries
 */

/**
 * Prize table entry - represents one prize category
 */
export interface PrizeRow {
  /** Array of number matches (e.g., [8, 1] for 8+1 lottery) */
  matches: number[];
  /** Prize amount in rubles, or "Суперприз" / "Приз" for jackpot variants */
  prize: number | string;
  /** Optional: percentage of prize fund (for 4из20 pool variant) */
  prizePercent?: number;
  /** Optional: note for jackpot entries */
  prizeNote?: string;
}

/**
 * Complete prize table for a lottery
 */
export interface PrizeTable {
  rows: PrizeRow[];
  currency: string; // "₽" for Russian rubles
}

/**
 * Field definition within a lottery
 */
export interface LotteryField {
  /** Number of selections in this field */
  count: number;
  /** Total numbers available in this field */
  from: number;
}

/**
 * Lottery variant (for lotteries with multiple prize table versions)
 */
export interface LotteryVariant {
  type: "fixed" | "pool_percentage";
  label: string;
  prizeTable: PrizeTable;
  averagePool?: number; // For pool_percentage variant
}

/**
 * Complete lottery definition
 */
export interface Lottery {
  /** Unique identifier */
  id: string;
  /** Russian name */
  name: string;
  /** Russian description */
  description: string;
  /** Number of fields (1 or 2) */
  fieldCount: number;
  /** Field definitions */
  fields: LotteryField[];
  /** Default ticket cost in rubles */
  defaultTicketCost: number;
  /** Default superprice in rubles */
  defaultSuperprice: number;
  /** Prize table(s) - single or variants */
  prizeTable?: PrizeTable;
  variants?: LotteryVariant[];
  /** Whether this lottery has a secondary prize (like 5из36+1) */
  hasSecondaryPrize?: boolean;
  /** Default secondary prize if hasSecondaryPrize is true */
  defaultSecondaryPrize?: number;
  /** Visual layout description for rendering */
  visualLayout: string;
  /** Available strategies for this lottery */
  availableStrategies: string[];
}

/**
 * Generated ticket - array of numbers selected
 */
export interface Ticket {
  /** Lottery ID this ticket belongs to */
  lotteryId: string;
  /** Array of selected numbers for field 1 */
  field1: number[];
  /** Array of selected numbers for field 2 (if applicable) */
  field2?: number[];
  /** Optional secondary field (for 5из36+1) */
  secondaryField?: number[];
}

/**
 * Multiple generated tickets from strategy
 */
export interface GeneratedTickets {
  /** Lottery ID */
  lotteryId: string;
  /** Array of tickets */
  tickets: Ticket[];
  /** Strategy parameters used to generate */
  strategy: string;
  /** Generation timestamp */
  generatedAt: Date;
  /** Total cost (ticket count × ticket price) */
  totalCost: number;
  /** Coverage analysis */
  coverage?: {
    /** Number of unique combinations covered */
    coverageCount: number;
    /** Total possible combinations */
    totalCombinations: number;
    /** Coverage percentage */
    coveragePercent: number;
  };
}

/**
 * Draw result - simulated lottery draw
 */
export interface DrawResult {
  /** Numbers drawn in field 1 */
  field1: number[];
  /** Numbers drawn in field 2 (if applicable) */
  field2?: number[];
  /** Secondary field result (if applicable) */
  secondaryField?: number[];
}

/**
 * Match result - how many numbers matched for one ticket
 */
export interface MatchResult {
  /** Ticket index in the tickets array */
  ticketIndex: number;
  /** Number of matches in field 1 */
  field1Matches: number;
  /** Number of matches in field 2 */
  field2Matches?: number;
  /** Secondary field matches */
  secondaryMatches?: number;
  /** Prize amount won (or 0 if no win) */
  prizeWon: number;
  /** Prize category key (for histogram) */
  prizeCategory: string;
}

/**
 * Simulation round result - results for all tickets in one draw
 */
export interface SimulationRound {
  /** Round number (1-indexed) */
  roundNumber: number;
  /** Draw that occurred */
  draw: DrawResult;
  /** Match results for all tickets */
  matches: MatchResult[];
  /** Total prize won this round */
  totalPrizeThisRound: number;
  /** Running bankroll (cumulative - cost - wins) */
  bankroll: number;
}

/**
 * Complete simulation result
 */
export interface SimulationResult {
  /** Lottery ID */
  lotteryId: string;
  /** Tickets simulated */
  tickets: Ticket[];
  /** Ticket cost */
  ticketCost: number;
  /** Number of rounds simulated */
  roundsCount: number;
  /** All simulation rounds */
  rounds: SimulationRound[];
  /** Timestamp */
  simulatedAt: Date;
  /** Statistics */
  statistics: SimulationStatistics;
}

/**
 * Simulation statistics
 */
export interface SimulationStatistics {
  /** Total cost (tickets × ticket price × rounds) */
  totalInvestment: number;
  /** Total prizes won */
  totalWon: number;
  /** Net return (won - invested) */
  netReturn: number;
  /** ROI percentage */
  roi: number;
  /** Number of rounds with zero prize */
  zeroWinRounds: number;
  /** Percentage of rounds with zero win */
  zeroWinPercent: number;
  /** Average prize per round */
  avgPrizePerRound: number;
  /** Maximum prize won in single round */
  maxPrizeInRound: number;
  /** Minimum non-zero prize */
  minNonZeroPrize: number;
  /** Prize distribution by category */
  prizeDistribution: Record<string, number>; // category -> count
}

/**
 * Lottery with current user state
 */
export interface LotteryState {
  /** Selected lottery */
  lottery: Lottery;
  /** Current selected variant (for multi-variant lotteries) */
  variant?: string; // "fixed" or "pool_percentage"
  /** Current superprice (user-edited) */
  superprice: number;
  /** Current secondary prize (if applicable) */
  secondaryPrize?: number;
  /** Current ticket cost */
  ticketCost: number;
  /** Current prize table (user may have edited) */
  prizeTable: PrizeTable;
  /** Average pool size (for 4из20 pool variant) */
  averagePool?: number;
}

/**
 * Expected Value calculation result
 */
export interface EVCalculation {
  /** Expected value in rubles */
  expectedValue: number;
  /** EV percentage (win% if playing 1 ticket) */
  evPercent: number;
  /** Whether lottery is profitable (EV > 0) */
  isProfitable: boolean;
  /** Number of draws until break-even */
  drawsToBreakEven?: number;
}
