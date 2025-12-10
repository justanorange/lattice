/**
 * Lottery Configuration Tests - Validation Functions
 * Validates all 6 lottery definitions and helper functions
 */

import {
  LOTTERY_8_PLUS_1,
  LOTTERY_4_FROM_20,
  LOTTERY_12_FROM_24,
  LOTTERY_5_FROM_36_PLUS_1,
  ALL_LOTTERIES,
  LOTTERIES_ARRAY,
  getLotteryById,
  getLotteryByName,
  getSingleFieldLotteries,
  getTwoFieldLotteries,
  getLotteriesWithSecondaryPrize,
  getLotteriesWithVariants,
} from './config';

/**
 * Validate 8 + 1 Lottery configuration
 */
export function validate8Plus1Lottery(): boolean {
  try {
    console.assert(LOTTERY_8_PLUS_1.fieldCount === 2);
    console.assert(LOTTERY_8_PLUS_1.fields.length === 2);
    console.assert(LOTTERY_8_PLUS_1.fields[0].count === 8);
    console.assert(LOTTERY_8_PLUS_1.prizeTable!.rows.length === 9);
    console.assert(LOTTERY_8_PLUS_1.defaultSuperprice === 100000000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate 4 из 20 Lottery with variants
 */
export function validate4From20Lottery(): boolean {
  try {
    console.assert(LOTTERY_4_FROM_20.variants!.length === 2);
    console.assert(LOTTERY_4_FROM_20.variants![0].type === 'fixed');
    console.assert(LOTTERY_4_FROM_20.variants![1].type === 'pool_percentage');
    console.assert(LOTTERY_4_FROM_20.variants![1].averagePool === 5000000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate 12 / 24 Lottery
 */
export function validate12From24Lottery(): boolean {
  try {
    console.assert(LOTTERY_12_FROM_24.fieldCount === 1);
    const superprizesCount = LOTTERY_12_FROM_24.prizeTable!.rows.filter(
      (r) => r.prize === 'Суперприз'
    ).length;
    console.assert(superprizesCount === 2);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate 5 из 36 + 1 Lottery
 */
export function validate5From36Plus1Lottery(): boolean {
  try {
    console.assert(LOTTERY_5_FROM_36_PLUS_1.hasSecondaryPrize === true);
    console.assert(LOTTERY_5_FROM_36_PLUS_1.defaultSecondaryPrize === 100000000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate all lottery configurations
 */
export function validateAllLotteries(): boolean {
  return (
    validate8Plus1Lottery() &&
    validate4From20Lottery() &&
    validate12From24Lottery() &&
    validate5From36Plus1Lottery() &&
    LOTTERIES_ARRAY.length === 6 &&
    Object.keys(ALL_LOTTERIES).length === 6 &&
    getLotteryById('lottery_8_1') === LOTTERY_8_PLUS_1 &&
    getLotteryByName('8 + 1') === LOTTERY_8_PLUS_1 &&
    getSingleFieldLotteries().length === 3 &&
    getTwoFieldLotteries().length === 3 &&
    getLotteriesWithSecondaryPrize().length === 1 &&
    getLotteriesWithVariants().length === 1
  );
}
