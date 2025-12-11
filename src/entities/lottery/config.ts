/**
 * Lottery Configurations
 * Complete definitions for all 6 Russian lotteries with prize tables
 */

import type { Lottery } from './types';

/**
 * 8 из 20 + 1 из 4
 * Two field lottery: select 8 from 20 in first field, 1 from 4 in second
 */
export const LOTTERY_8_PLUS_1: Lottery = {
  id: 'lottery_8_1',
  name: '8 + 1',
  description: '8 из 20 + 1 из 4',
  fieldCount: 2,
  fields: [
    { count: 8, from: 20 },
    { count: 1, from: 4 },
  ],
  defaultTicketCost: 300,
  defaultSuperprice: 5000000,
  prizeTable: {
    rows: [
      { matches: [8, 1], prize: 'Суперприз' },
      { matches: [8, 0], prize: 300000 },
      { matches: [7, 1], prize: 75000 },
      { matches: [7, 0], prize: 15000 },
      { matches: [6, 1], prize: 3000 },
      { matches: [6, 0], prize: 1500 },
      { matches: [5, 1], prize: 900 },
      { matches: [5, 0], prize: 600 },
      { matches: [4, 1], prize: 300 },
    ],
    currency: '₽',
  },
  visualLayout: '5 columns × 4 rows + 1 row of 4',
  availableStrategies: [
    'min_risk',
    'coverage',
    'wheel',
    'key_wheel',
  ],
};

/**
 * 4 из 20 в двух полях
 * Two field lottery: select 4 from 20 in each field
 * Has two variants: fixed prizes and prize pool percentage
 */
export const LOTTERY_4_FROM_20: Lottery = {
  id: 'lottery_4_20',
  name: '4 из 20',
  description: '4 из 20 в двух полях',
  fieldCount: 2,
  fields: [
    { count: 4, from: 20 },
    { count: 4, from: 20 },
  ],
  defaultTicketCost: 400,
  defaultSuperprice: 50000000,
  variants: [
    {
      type: 'fixed',
      label: 'Фиксированные выигрыши',
      prizeTable: {
        rows: [
          { matches: [4, 4], prize: 'Суперприз' },
          { matches: [3, 4], prize: 100000 },
          { matches: [2, 4], prize: 10000 },
          { matches: [1, 4], prize: 2000 },
          { matches: [0, 4], prize: 4000 },
          { matches: [3, 3], prize: 3000 },
          { matches: [2, 3], prize: 1000 },
          { matches: [1, 3], prize: 500 },
          { matches: [0, 3], prize: 450 },
          { matches: [2, 2], prize: 300 },
          { matches: [1, 2], prize: 100 },
          { matches: [0, 2], prize: 100 },
        ],
        currency: '₽',
      },
    },
    {
      type: 'pool_percentage',
      label: 'Процент от призового фонда',
      prizeTable: {
        rows: [
          { matches: [4, 4], prizePercent: 30, prizeNote: 'Суперприз' },
          { matches: [3, 4], prizePercent: 3.12 },
          { matches: [2, 4], prizePercent: 1.5 },
          { matches: [1, 4], prizePercent: 1.9 },
          { matches: [0, 4], prizePercent: 1.8 },
          { matches: [3, 3], prizePercent: 0.8 },
          { matches: [2, 3], prizePercent: 6.38 },
          { matches: [1, 3], prizePercent: 8.5 },
          { matches: [0, 3], prizePercent: 10.5 },
          { matches: [2, 2], prizePercent: 10.5 },
          { matches: [1, 2], prize: 400 },
          { matches: [0, 2], prizePercent: 25 },
        ],
        currency: '₽',
      },
      averagePool: 4000000,
    },
  ],
  visualLayout: '2 fields × 4 columns × 5 rows',
  availableStrategies: ['coverage'],
};

/**
 * 12 / 24
 * Single field lottery: select 12 from 24 numbers
 * Special case: 0 or 12 matches both win superprice
 */
export const LOTTERY_12_FROM_24: Lottery = {
  id: 'lottery_12_24',
  name: '12 / 24',
  description: 'Нужно выбрать 12 из 24',
  fieldCount: 1,
  fields: [{ count: 12, from: 24 }],
  defaultTicketCost: 300,
  defaultSuperprice: 100000000,
  prizeTable: {
    rows: [
      { matches: [12], prize: 'Суперприз' },
      { matches: [11], prize: 30000 },
      { matches: [10], prize: 3000 },
      { matches: [9], prize: 600 },
      { matches: [8], prize: 150 },
    ],
    currency: '₽',
  },
  visualLayout: '6 columns × 4 rows',
  availableStrategies: ['guaranteed_win'],
};

/**
 * 5 из 36 + 1 из 4
 * Two field lottery with secondary prize
 * Select 5 from 36 in first field, 1 from 4 in second
 * Has both superprice and regular prize
 */
export const LOTTERY_5_FROM_36_PLUS_1: Lottery = {
  id: 'lottery_5_36_1',
  name: '5 из 36 + 1',
  description: '5 из 36 + 1 из 4',
  fieldCount: 2,
  fields: [
    { count: 5, from: 36 },
    { count: 1, from: 4 },
  ],
  defaultTicketCost: 100,
  defaultSuperprice: 500000000,
  hasSecondaryPrize: true,
  defaultSecondaryPrize: 100000000,
  prizeTable: {
    rows: [
      { matches: [5, 1], prize: 'Суперприз' },
      { matches: [5, 0], prize: 'Приз' },
      { matches: [4], prize: 7500 },
      { matches: [3], prize: 750 },
      { matches: [2], prize: 75 },
    ],
    currency: '₽',
  },
  visualLayout: '6 × 6 grid + 1 row of 4',
  availableStrategies: ['coverage', 'wheel'],
};

/**
 * 6 из 45
 * Single field lottery: select 6 from 45 numbers
 */
export const LOTTERY_6_FROM_45: Lottery = {
  id: 'lottery_6_45',
  name: '6 из 45',
  description: 'Нужно выбрать 6 из 45',
  fieldCount: 1,
  fields: [{ count: 6, from: 45 }],
  defaultTicketCost: 100,
  defaultSuperprice: 250000000,
  prizeTable: {
    rows: [
      { matches: [6], prize: 'Суперприз' },
      { matches: [5], prize: 100000 },
      { matches: [4], prize: 2800 },
      { matches: [3], prize: 1400 },
    ],
    currency: '₽',
  },
  visualLayout: '9 columns × 5 rows',
  availableStrategies: ['min_risk', 'coverage', 'wheel'],
};

/**
 * 7 из 49
 * Single field lottery: select 7 from 49 numbers
 */
export const LOTTERY_7_FROM_49: Lottery = {
  id: 'lottery_7_49',
  name: '7 из 49',
  description: 'Нужно выбрать 7 из 49',
  fieldCount: 1,
  fields: [{ count: 7, from: 49 }],
  defaultTicketCost: 50,
  defaultSuperprice: 300000000,
  prizeTable: {
    rows: [
      { matches: [7], prize: 'Суперприз' },
      { matches: [6], prize: 120000 },
      { matches: [5], prize: 2400 },
      { matches: [4], prize: 280 },
      { matches: [3], prize: 120 },
      { matches: [2], prize: 40 },
    ],
    currency: '₽',
  },
  visualLayout: '7 × 7 grid',
  availableStrategies: ['min_risk', 'coverage', 'wheel'],
};

/**
 * All lottery definitions indexed by ID
 */
export const ALL_LOTTERIES: Record<string, Lottery> = {
  [LOTTERY_8_PLUS_1.id]: LOTTERY_8_PLUS_1,
  [LOTTERY_4_FROM_20.id]: LOTTERY_4_FROM_20,
  [LOTTERY_12_FROM_24.id]: LOTTERY_12_FROM_24,
  [LOTTERY_5_FROM_36_PLUS_1.id]: LOTTERY_5_FROM_36_PLUS_1,
  [LOTTERY_6_FROM_45.id]: LOTTERY_6_FROM_45,
  [LOTTERY_7_FROM_49.id]: LOTTERY_7_FROM_49,
};

/**
 * All lotteries as array for iteration
 * Order: 8+1, 4из20, 12/24, 5из36+1, 6из45, 7из49
 */
export const LOTTERIES_ARRAY: Lottery[] = [
  LOTTERY_8_PLUS_1,
  LOTTERY_4_FROM_20,
  LOTTERY_12_FROM_24,
  LOTTERY_5_FROM_36_PLUS_1,
  LOTTERY_6_FROM_45,
  LOTTERY_7_FROM_49,
];

/**
 * Get lottery by ID
 */
export const getLotteryById = (id: string): Lottery | undefined => {
  return ALL_LOTTERIES[id];
};

/**
 * Get lottery by name
 */
export const getLotteryByName = (name: string): Lottery | undefined => {
  return LOTTERIES_ARRAY.find((l) => l.name === name);
};

/**
 * Get all single-field lotteries
 */
export const getSingleFieldLotteries = (): Lottery[] => {
  return LOTTERIES_ARRAY.filter((l) => l.fieldCount === 1);
};

/**
 * Get all two-field lotteries
 */
export const getTwoFieldLotteries = (): Lottery[] => {
  return LOTTERIES_ARRAY.filter((l) => l.fieldCount === 2);
};

/**
 * Get lotteries with secondary prize
 */
export const getLotteriesWithSecondaryPrize = (): Lottery[] => {
  return LOTTERIES_ARRAY.filter((l) => l.hasSecondaryPrize);
};

/**
 * Get lotteries with variants (multiple prize table versions)
 */
export const getLotteriesWithVariants = (): Lottery[] => {
  return LOTTERIES_ARRAY.filter((l) => l.variants && l.variants.length > 0);
};
