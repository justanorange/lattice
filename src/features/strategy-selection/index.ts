/**
 * Strategy Selection Feature
 * Exports sections, model hooks, and types
 */

// Sections for page composition
export {
  StrategyList,
  StrategyParameters,
  CalculationResult,
} from './ui/sections';

// Model hooks for business logic
export {
  useStrategySelection,
  type UseStrategySelectionReturn,
} from './model';
