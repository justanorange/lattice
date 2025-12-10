/**
 * Lottery Detail Feature
 * Exports sections, model hooks, and types
 */

// Sections for page composition
export {
  TicketSettings,
  PrizeTableSection,
  EVDisplay,
} from './ui/sections';

// Model hooks for business logic
export {
  useLotteryDetail,
  clampSuperprice,
  SUPERPRICE_LIMITS,
  type UseLotteryDetailReturn,
} from './model';
