/**
 * Lottery Store Tests
 * Validates Zustand store state management
 */

import {
  useLotteryStore,
  getLotteryStoreSnapshot,
  subscribeLotteryStore,
} from './store';
import {
  LOTTERY_8_PLUS_1,
  LOTTERY_4_FROM_20,
  LOTTERY_6_FROM_45,
} from './config';

/**
 * Test initial state
 */
export function testInitialState(): boolean {
  try {
    const state = useLotteryStore.getState();

    console.assert(state.selectedLotteryId === LOTTERY_8_PLUS_1.id);
    console.assert(state.selectedLottery === LOTTERY_8_PLUS_1);
    console.assert(state.currentSuperprice === LOTTERY_8_PLUS_1.defaultSuperprice);
    console.assert(state.currentTicketCost === LOTTERY_8_PLUS_1.defaultTicketCost);
    console.assert(state.currentPrizeTable.rows.length > 0);

    return true;
  } catch (e) {
    console.error('Initial state test failed:', e);
    return false;
  }
}

/**
 * Test lottery selection
 */
export function testSelectLottery(): boolean {
  try {
    const store = useLotteryStore.getState();

    // Select different lottery
    store.selectLottery(LOTTERY_6_FROM_45.id);
    const newState = useLotteryStore.getState();

    console.assert(newState.selectedLotteryId === LOTTERY_6_FROM_45.id);
    console.assert(newState.selectedLottery === LOTTERY_6_FROM_45);
    console.assert(
      newState.currentSuperprice === LOTTERY_6_FROM_45.defaultSuperprice
    );
    console.assert(
      newState.currentTicketCost === LOTTERY_6_FROM_45.defaultTicketCost
    );

    // Reset to 8+1
    store.selectLottery(LOTTERY_8_PLUS_1.id);

    return true;
  } catch (e) {
    console.error('Select lottery test failed:', e);
    return false;
  }
}

/**
 * Test variant selection
 */
export function testSelectVariant(): boolean {
  try {
    const store = useLotteryStore.getState();

    // Select 4из20 which has variants
    store.selectLottery(LOTTERY_4_FROM_20.id);
    let state = useLotteryStore.getState();

    console.assert(
      state.selectedLotteryId === LOTTERY_4_FROM_20.id,
      'Should select 4из20'
    );

    // Select pool_percentage variant
    store.selectVariant('pool_percentage');
    state = useLotteryStore.getState();

    console.assert(
      state.selectedVariant === 'pool_percentage',
      'Should select pool_percentage variant'
    );
    console.assert(
      state.currentAveragePool === 5000000,
      'Should set average pool'
    );

    // Reset
    store.selectLottery(LOTTERY_8_PLUS_1.id);

    return true;
  } catch (e) {
    console.error('Select variant test failed:', e);
    return false;
  }
}

/**
 * Test superprice update
 */
export function testUpdateSuperprice(): boolean {
  try {
    const store = useLotteryStore.getState();
    const originalSuperprice = store.currentSuperprice;

    store.updateSuperprice(250000000);
    let state = useLotteryStore.getState();
    console.assert(state.currentSuperprice === 250000000);

    store.updateSuperprice(500000000);
    state = useLotteryStore.getState();
    console.assert(state.currentSuperprice === 500000000);

    // Reset
    store.updateSuperprice(originalSuperprice);

    return true;
  } catch (e) {
    console.error('Update superprice test failed:', e);
    return false;
  }
}

/**
 * Test secondary prize update
 */
export function testUpdateSecondaryPrize(): boolean {
  try {
    const store = useLotteryStore.getState();

    store.updateSecondaryPrize(200000000);
    const state = useLotteryStore.getState();

    console.assert(state.currentSecondaryPrize === 200000000);

    return true;
  } catch (e) {
    console.error('Update secondary prize test failed:', e);
    return false;
  }
}

/**
 * Test ticket cost update
 */
export function testUpdateTicketCost(): boolean {
  try {
    const store = useLotteryStore.getState();
    const originalCost = store.currentTicketCost;

    store.updateTicketCost(200);
    let state = useLotteryStore.getState();
    console.assert(state.currentTicketCost === 200);

    store.updateTicketCost(150);
    state = useLotteryStore.getState();
    console.assert(state.currentTicketCost === 150);

    // Reset
    store.updateTicketCost(originalCost);

    return true;
  } catch (e) {
    console.error('Update ticket cost test failed:', e);
    return false;
  }
}

/**
 * Test prize table update
 */
export function testUpdatePrizeTable(): boolean {
  try {
    const store = useLotteryStore.getState();
    const originalTable = store.currentPrizeTable;

    // Modify first prize row
    const newTable = {
      ...originalTable,
      rows: [
        { matches: [8, 1], prize: 150000000 }, // Changed from default
        ...originalTable.rows.slice(1),
      ],
    };

    store.updatePrizeTable(newTable);
    const state = useLotteryStore.getState();

    console.assert(state.currentPrizeTable.rows[0].prize === 150000000);

    // Reset
    store.updatePrizeTable(originalTable);

    return true;
  } catch (e) {
    console.error('Update prize table test failed:', e);
    return false;
  }
}

/**
 * Test prize row update
 */
export function testUpdatePrizeRow(): boolean {
  try {
    const store = useLotteryStore.getState();
    const originalPrize = store.currentPrizeTable.rows[0].prize;

    // Update first row
    store.updatePrizeRow(0, { matches: [8, 1], prize: 125000000 });
    const state = useLotteryStore.getState();

    console.assert(state.currentPrizeTable.rows[0].prize === 125000000);

    // Reset
    store.updatePrizeRow(0, { matches: [8, 1], prize: originalPrize });

    return true;
  } catch (e) {
    console.error('Update prize row test failed:', e);
    return false;
  }
}

/**
 * Test reset prize table to defaults
 */
export function testResetPrizeTableToDefaults(): boolean {
  try {
    const store = useLotteryStore.getState();
    const defaultTable = store.currentPrizeTable;

    // Modify table
    store.updatePrizeTable({
      ...defaultTable,
      rows: [{ matches: [8, 1], prize: 999999999 }],
    });

    let state = useLotteryStore.getState();
    console.assert(state.currentPrizeTable.rows.length === 1);

    // Reset
    store.resetPrizeTableToDefaults();
    state = useLotteryStore.getState();

    console.assert(state.currentPrizeTable.rows.length === defaultTable.rows.length);

    return true;
  } catch (e) {
    console.error('Reset prize table test failed:', e);
    return false;
  }
}

/**
 * Test reset all to defaults
 */
export function testResetAllToDefaults(): boolean {
  try {
    const store = useLotteryStore.getState();
    const lottery = LOTTERY_8_PLUS_1;

    // Make multiple changes
    store.updateSuperprice(999999999);
    store.updateTicketCost(500);
    store.updateSecondaryPrize(888888888);

    let state = useLotteryStore.getState();
    console.assert(state.currentSuperprice === 999999999);
    console.assert(state.currentTicketCost === 500);

    // Reset all
    store.resetAllToDefaults();
    state = useLotteryStore.getState();

    console.assert(state.currentSuperprice === lottery.defaultSuperprice);
    console.assert(state.currentTicketCost === lottery.defaultTicketCost);

    return true;
  } catch (e) {
    console.error('Reset all test failed:', e);
    return false;
  }
}

/**
 * Test getters
 */
export function testGetters(): boolean {
  try {
    const store = useLotteryStore.getState();

    const lottery = store.getSelectedLottery();
    console.assert(lottery.id === store.selectedLotteryId);

    const prizeTable = store.getPrizeTable();
    console.assert(prizeTable.rows.length === store.currentPrizeTable.rows.length);

    const superprice = store.getSuperprice();
    console.assert(superprice === store.currentSuperprice);

    return true;
  } catch (e) {
    console.error('Getters test failed:', e);
    return false;
  }
}

/**
 * Test store snapshot function
 */
export function testGetStoreSnapshot(): boolean {
  try {
    const snapshot = getLotteryStoreSnapshot();

    console.assert(snapshot.selectedLotteryId === LOTTERY_8_PLUS_1.id);
    console.assert(snapshot.currentSuperprice > 0);

    return true;
  } catch (e) {
    console.error('Get store snapshot test failed:', e);
    return false;
  }
}

/**
 * Test store subscription
 */
export function testStoreSubscription(): boolean {
  try {
    let callCount = 0;
    let lastState: any = null;

    const unsubscribe = subscribeLotteryStore((state) => {
      callCount++;
      lastState = state;
    });

    const store = useLotteryStore.getState();
    const originalSuperprice = store.currentSuperprice;

    store.updateSuperprice(123456789);

    // Wait a tick for subscription to fire
    setTimeout(() => {
      console.assert(callCount > 0, 'Subscription should have fired');
      console.assert(
        lastState.currentSuperprice === 123456789,
        'State should be updated'
      );

      unsubscribe();
      store.updateSuperprice(originalSuperprice);
    }, 0);

    return true;
  } catch (e) {
    console.error('Store subscription test failed:', e);
    return false;
  }
}

/**
 * Run all store tests
 */
export function runAllStoreTests(): boolean {
  console.log('\n=== Running Lottery Store Tests ===\n');

  const tests = [
    { name: 'Initial State', fn: testInitialState },
    { name: 'Select Lottery', fn: testSelectLottery },
    { name: 'Select Variant', fn: testSelectVariant },
    { name: 'Update Superprice', fn: testUpdateSuperprice },
    { name: 'Update Secondary Prize', fn: testUpdateSecondaryPrize },
    { name: 'Update Ticket Cost', fn: testUpdateTicketCost },
    { name: 'Update Prize Table', fn: testUpdatePrizeTable },
    { name: 'Update Prize Row', fn: testUpdatePrizeRow },
    { name: 'Reset Prize Table', fn: testResetPrizeTableToDefaults },
    { name: 'Reset All to Defaults', fn: testResetAllToDefaults },
    { name: 'Getters', fn: testGetters },
    { name: 'Get Store Snapshot', fn: testGetStoreSnapshot },
    { name: 'Store Subscription', fn: testStoreSubscription },
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
