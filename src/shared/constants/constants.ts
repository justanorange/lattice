/**
 * Application Constants
 * Numeric values, limits, and configuration
 */

// Currency
export const CURRENCY = {
  symbol: '₽',
  code: 'RUB',
  decimals: 2,
} as const;

// Limits & Constraints
export const LIMITS = {
  min_budget: 10,
  max_budget: 1000000,
  min_tickets: 1,
  max_tickets: 10000,
  min_draws_simulation: 1,
  max_draws_simulation: 100000,
} as const;

// UI Layout
export const LAYOUT = {
  breakpoint_mobile: 640,
  breakpoint_tablet: 1024,
  breakpoint_desktop: 1280,
  sidebar_width: 300,
  content_max_width: 1200,
} as const;

// Colors (Tailwind)
export const COLORS = {
  primary: 'amber',
  primary_50: '#fffbf0',
  primary_100: '#fef3c7',
  primary_200: '#fde68a',
  primary_500: '#f59e0b',
  primary_600: '#d97706',
  primary_900: '#78350f',
  
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  text_muted: '#6b7280',
} as const;

// Theme
export const THEME = {
  light: 'light',
  dark: 'dark',
  auto: 'auto',
} as const;

// Lottery Configuration
export const LOTTERY_CONFIG = {
  // Cost bounds
  min_cost: 2.5,
  max_cost: 1000,
  
  // Standard superprice
  standard_superprice: 10000,
  
  // Max numbers in field
  max_field_size: 50,
  
  // Max tickets per generation
  max_generation_tickets: 10000,
} as const;

// Strategy Parameters
export const STRATEGY_PARAMS = {
  // Min/Max tickets for strategies
  min_tickets: 1,
  max_tickets: 1000,
  
  // Min/Max budget
  min_budget: 10,
  max_budget: 1000000,
  
  // Min/Max additional numbers for wheel
  min_additional: 1,
  max_additional: 30,
  
  // Min/Max key numbers
  min_key: 1,
  max_key: 10,
  
  // Risk tolerance 0-100
  min_risk: 0,
  max_risk: 100,
} as const;

// Simulation Configuration
export const SIMULATION = {
  min_draws: 1,
  max_draws: 100000,
  default_draws: 100,
} as const;

// Performance
export const PERFORMANCE = {
  debounce_input: 300,
  debounce_search: 500,
  animation_duration: 200,
} as const;

// Storage Keys (LocalStorage)
export const STORAGE_KEYS = {
  theme: 'lattice_theme',
  locale: 'lattice_locale',
  lottery_state: 'lattice_lottery_state',
  strategy_state: 'lattice_strategy_state',
  generation_history: 'lattice_generation_history',
  user_preferences: 'lattice_user_preferences',
} as const;

// Validation
export const VALIDATION = {
  max_input_length: 1000,
  max_description_length: 5000,
  email_pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  number_pattern: /^-?\d+(\.\d+)?$/,
} as const;
