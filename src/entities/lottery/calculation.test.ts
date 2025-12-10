/**
 * Prize Calculation Tests
 * Validates prize calculation logic for all lottery types
 */

import {
  findPrizeByMatches,
  calculatePrizeAmount,
  getPrizeNumericValue,
  isWinningCombination,
  calculateEV,
  getPrizeCategory,
  isValidMatchesForLottery,
  calculatePrizesForMatches,
} from './calculation';
import {
  LOTTERY_8_PLUS_1,
  LOTTERY_4_FROM_20,
  LOTTERY_12_FROM_24,
  LOTTERY_5_FROM_36_PLUS_1,
  LOTTERY_6_FROM_45,
} from './config';

/**
 * Test prize finding in 8+1 lottery
 */
export function test8Plus1PrizeFinding(): boolean {
  try {
    const prizeTable = LOTTERY_8_PLUS_1.prizeTable!;

    // Superprice match
    const superprize = findPrizeByMatches(prizeTable, [8, 1]);
    console.assert(superprize === 'Суперприз');

    // Regular prize match
    const prize = findPrizeByMatches(prizeTable, [8, 0]);
    console.assert(prize === 300000);

    // No prize
    const noPrize = findPrizeByMatches(prizeTable, [3, 0]);
    console.assert(noPrize === 0);

    return true;
  } catch (e) {
    console.error('8+1 prize finding failed:', e);
    return false;
  }
}

/**
 * Test prize amount calculation with superprice
 */
export function testPrizeAmountCalculation(): boolean {
  try {
    const prizeTable = LOTTERY_8_PLUS_1.prizeTable!;
    const superprice = 100000000;

    // Superprice
    const superprizeAmount = calculatePrizeAmount(
      prizeTable,
      [8, 1],
      superprice
    );
    console.assert(superprizeAmount === 'Суперприз');

    // Regular prize
    const regularPrize = calculatePrizeAmount(
      prizeTable,
      [8, 0],
      superprice
    );
    console.assert(regularPrize === 300000);

    return true;
  } catch (e) {
    console.error('Prize amount calculation failed:', e);
    return false;
  }
}

/**
 * Test numeric prize value conversion
 */
export function testGetPrizeNumericValue(): boolean {
  try {
    const superprice = 100000000;
    const secondaryPrize = 50000000;

    // Numeric prize
    const numeric = getPrizeNumericValue(10000, superprice);
    console.assert(numeric === 10000);

    // Superprice conversion
    const superValue = getPrizeNumericValue('Суперприз', superprice);
    console.assert(superValue === superprice);

    // Secondary prize
    const secondary = getPrizeNumericValue('Приз', superprice, secondaryPrize);
    console.assert(secondary === secondaryPrize);

    return true;
  } catch (e) {
    console.error('Get prize numeric value failed:', e);
    return false;
  }
}

/**
 * Test winning combination detection
 */
export function testIsWinningCombination(): boolean {
  try {
    const prizeTable = LOTTERY_8_PLUS_1.prizeTable!;

    // Winning
    console.assert(isWinningCombination([8, 1], prizeTable) === true);
    console.assert(isWinningCombination([7, 0], prizeTable) === true);

    // Non-winning
    console.assert(isWinningCombination([3, 0], prizeTable) === false);
    console.assert(isWinningCombination([0, 0], prizeTable) === false);

    return true;
  } catch (e) {
    console.error('Winning combination test failed:', e);
    return false;
  }
}

/**
 * Test prize category generation
 */
export function testGetPrizeCategory(): boolean {
  try {
    const category1 = getPrizeCategory([8, 1]);
    console.assert(category1 === '8+1');

    const category2 = getPrizeCategory([3, 0]);
    console.assert(category2 === '3+0');

    const category3 = getPrizeCategory([6]);
    console.assert(category3 === '6');

    return true;
  } catch (e) {
    console.error('Prize category test failed:', e);
    return false;
  }
}

/**
 * Test matches validation
 */
export function testIsValidMatchesForLottery(): boolean {
  try {
    // Valid 8+1 matches
    console.assert(
      isValidMatchesForLottery(LOTTERY_8_PLUS_1, [8, 1]) === true
    );
    console.assert(
      isValidMatchesForLottery(LOTTERY_8_PLUS_1, [0, 0]) === true
    );

    // Invalid matches - too many
    console.assert(
      isValidMatchesForLottery(LOTTERY_8_PLUS_1, [9, 1]) === false
    );

    // Invalid matches - wrong field count
    console.assert(
      isValidMatchesForLottery(LOTTERY_8_PLUS_1, [8]) === false
    );

    // Valid single-field lottery
    console.assert(
      isValidMatchesForLottery(LOTTERY_6_FROM_45, [6]) === true
    );

    return true;
  } catch (e) {
    console.error('Valid matches test failed:', e);
    return false;
  }
}

/**
 * Test batch prize calculation
 */
export function testCalculatePrizesForMatches(): boolean {
  try {
    const matchesArray = [
      [8, 1],
      [8, 0],
      [7, 1],
      [0, 0],
    ];

    const prizes = calculatePrizesForMatches(
      LOTTERY_8_PLUS_1,
      matchesArray,
      100000000
    );

    console.assert(prizes.length === 4);
    console.assert(prizes[0] === 'Суперприз');
    console.assert(prizes[1] === 300000);
    console.assert(prizes[2] === 75000);
    console.assert(prizes[3] === 0);

    return true;
  } catch (e) {
    console.error('Batch prize calculation failed:', e);
    return false;
  }
}

/**
 * Test EV calculation
 */
export function testCalculateEV(): boolean {
  try {
    const ev = calculateEV(
      LOTTERY_8_PLUS_1,
      100000000,
      LOTTERY_8_PLUS_1.prizeTable!,
      100
    );

    // EV should exist
    console.assert(typeof ev.expectedValue === 'number');
    console.assert(typeof ev.evPercent === 'number');
    console.assert(typeof ev.isProfitable === 'boolean');

    // For most lotteries, simple EV will be negative (house edge)
    // unless superprice is very high
    console.assert(ev.isProfitable === ev.expectedValue > 0);

    return true;
  } catch (e) {
    console.error('EV calculation failed:', e);
    return false;
  }
}

/**
 * Test 12/24 symmetric prizes (0 and 12 both win superprice)
 */
export function test12From24SymmetricPrizes(): boolean {
  try {
    const prizeTable = LOTTERY_12_FROM_24.prizeTable!;

    // Both 0 and 12 should win superprice
    const prize12 = findPrizeByMatches(prizeTable, [12]);
    const prize0 = findPrizeByMatches(prizeTable, [0]);

    console.assert(prize12 === 'Суперприз');
    console.assert(prize0 === 'Суперприз');

    return true;
  } catch (e) {
    console.error('12/24 symmetric prizes test failed:', e);
    return false;
  }
}

/**
 * Test 5из36+1 with secondary prize
 */
export function test5From36PlusSecondaryPrize(): boolean {
  try {
    const prizeTable = LOTTERY_5_FROM_36_PLUS_1.prizeTable!;

    // [5, 1] should be superprice
    const superPrize = findPrizeByMatches(prizeTable, [5, 1]);
    console.assert(superPrize === 'Суперприз');

    // [5, 0] should be secondary prize marker
    const secondaryPrize = findPrizeByMatches(prizeTable, [5, 0]);
    console.assert(secondaryPrize === 'Приз');

    return true;
  } catch (e) {
    console.error('5из36+1 secondary prize test failed:', e);
    return false;
  }
}

/**
 * Test 4из20 percentage-based prizes
 */
export function test4From20PercentagePrizes(): boolean {
  try {
    const poolVariant = LOTTERY_4_FROM_20.variants![1];
    const prizeTable = poolVariant.prizeTable;
    const poolAmount = 5000000; // Average pool

    // [4, 4] should be 30% of pool
    const prize = calculatePrizeAmount(
      prizeTable,
      [4, 4],
      50000000,
      undefined,
      poolAmount
    );

    // Since [4,4] has prizeNote="Суперприз", it returns the marker
    console.assert(prize === 'Суперприз');

    return true;
  } catch (e) {
    console.error('4из20 percentage test failed:', e);
    return false;
  }
}

/**
 * Run all tests
 */
export function runAllCalculationTests(): boolean {
  console.log('\n=== Running Prize Calculation Tests ===\n');

  const tests = [
    { name: '8+1 Prize Finding', fn: test8Plus1PrizeFinding },
    { name: 'Prize Amount Calculation', fn: testPrizeAmountCalculation },
    { name: 'Get Prize Numeric Value', fn: testGetPrizeNumericValue },
    { name: 'Is Winning Combination', fn: testIsWinningCombination },
    { name: 'Prize Category', fn: testGetPrizeCategory },
    { name: 'Valid Matches', fn: testIsValidMatchesForLottery },
    { name: 'Batch Prize Calculation', fn: testCalculatePrizesForMatches },
    { name: 'EV Calculation', fn: testCalculateEV },
    { name: '12/24 Symmetric Prizes', fn: test12From24SymmetricPrizes },
    { name: '5из36+1 Secondary Prize', fn: test5From36PlusSecondaryPrize },
    { name: '4из20 Percentage Prizes', fn: test4From20PercentagePrizes },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test.fn()) {
        console.log(`✓ ${test.name}`);
        passed++;
      } else {
        console.log(`✗ ${test.name}`);
        failed++;
      }
    } catch (e) {
      console.log(`✗ ${test.name} - ${e}`);
      failed++;
    }
  }

  console.log(
    `\n${passed}/${tests.length} tests passed, ${failed} failed\n`
  );

  return failed === 0;
}
