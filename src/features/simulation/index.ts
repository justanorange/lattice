/**
 * Simulation Feature
 * Exports sections, model hooks, and types
 */

// Sections for page composition
export {
  SimulationControls,
  SimulationStats,
  BankrollChart,
} from './ui/sections';

// Model hooks for business logic
export {
  useSimulation,
  type UseSimulationReturn,
} from './model';
