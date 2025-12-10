/**
 * Test suite for lottery state persistence
 */

import {
  saveLotteryState,
  loadLotteryState,
  clearLotteryState,
  restoreLotteryState,
  getStorageInfo,
  setupAutoSave,
} from '@/entities/lottery/persistence';
import { useLotteryStore } from '@/entities/lottery/store';
import { LOTTERY_4_FROM_20, LOTTERY_5_FROM_36_PLUS_1 } from '@/entities/lottery/config';

/**
 * Test initial state is saved correctly
 */
export function testSaveInitialState(): void {
  console.log('Testing: Save initial state');
  clearLotteryState();
  saveLotteryState();

  const loaded = loadLotteryState();
  if (!loaded || !loaded.lottery) {
    console.warn('Failed to load initial state');
    return;
  }

  console.log('✓ Initial state saved and loaded');
}

/**
 * Test state modifications are persisted
 */
export function testSaveModifiedState(): void {
  console.log('Testing: Save modified state');
  clearLotteryState();

  const store = useLotteryStore.getState() as any;
  store.selectLottery(LOTTERY_4_FROM_20.id);
  store.updateSuperprice(5000);
  store.updateTicketCost(100);

  saveLotteryState();
  const loaded = loadLotteryState();

  if (
    !loaded ||
    !loaded.lottery ||
    loaded.lottery.id !== LOTTERY_4_FROM_20.id
  ) {
    console.warn('Failed to persist lottery selection');
    return;
  }

  if (loaded.superprice !== 5000) {
    console.warn('Failed to persist superprice');
    return;
  }

  if (loaded.ticketCost !== 100) {
    console.warn('Failed to persist ticket cost');
    return;
  }

  console.log('✓ Modified state persisted correctly');
}

/**
 * Test restore overwrites current state
 */
export function testRestoreState(): void {
  console.log('Testing: Restore state');
  clearLotteryState();

  // Save state with lottery 4из20
  const store = useLotteryStore.getState() as any;
  store.selectLottery(LOTTERY_4_FROM_20.id);
  store.updateSuperprice(3000);
  saveLotteryState();

  // Change to different lottery
  store.selectLottery(LOTTERY_5_FROM_36_PLUS_1.id);
  store.updateSuperprice(9000);

  // Verify we're on different lottery
  if (store.selectedLottery.id === LOTTERY_4_FROM_20.id) {
    console.warn('State should have changed');
    return;
  }

  // Restore
  restoreLotteryState();

  // Verify restored to original
  if (store.selectedLottery.id !== LOTTERY_4_FROM_20.id) {
    console.warn('Failed to restore lottery');
    return;
  }

  if (store.currentSuperprice !== 3000) {
    console.warn('Failed to restore superprice');
    return;
  }

  console.log('✓ State restored correctly');
}

/**
 * Test variant selection is persisted
 */
export function testSaveVariant(): void {
  console.log('Testing: Save variant selection');
  clearLotteryState();

  const store = useLotteryStore.getState() as any;
  store.selectLottery(LOTTERY_4_FROM_20.id);
  store.selectVariant('pool_percentage');
  store.updateAveragePool(100000);

  saveLotteryState();
  const loaded = loadLotteryState();

  if (loaded?.variant !== 'pool_percentage') {
    console.warn('Failed to persist variant');
    return;
  }

  if (loaded?.averagePool !== 100000) {
    console.warn('Failed to persist average pool');
    return;
  }

  console.log('✓ Variant and pool amount persisted');
}

/**
 * Test secondary prize is persisted
 */
export function testSaveSecondaryPrize(): void {
  console.log('Testing: Save secondary prize');
  clearLotteryState();

  const store = useLotteryStore.getState() as any;
  store.selectLottery(LOTTERY_5_FROM_36_PLUS_1.id);
  store.updateSecondaryPrize(150);

  saveLotteryState();
  const loaded = loadLotteryState();

  if (loaded?.secondaryPrize !== 150) {
    console.warn('Failed to persist secondary prize');
    return;
  }

  console.log('✓ Secondary prize persisted');
}

/**
 * Test clear state removes data
 */
export function testClearState(): void {
  console.log('Testing: Clear state');
  saveLotteryState();

  let stored = loadLotteryState();
  if (!stored) {
    console.warn('State should exist before clear');
    return;
  }

  clearLotteryState();
  stored = loadLotteryState();

  if (stored !== null) {
    console.warn('State should be null after clear');
    return;
  }

  console.log('✓ State cleared successfully');
}

/**
 * Test storage info retrieval
 */
export function testGetStorageInfo(): void {
  console.log('Testing: Get storage info');
  clearLotteryState();
  saveLotteryState();

  const info = getStorageInfo();
  if (!info) {
    console.warn('Failed to get storage info');
    return;
  }

  if (info.size <= 0) {
    console.warn('Storage size should be > 0');
    return;
  }

  if (info.version !== 1) {
    console.warn('Storage version should be 1');
    return;
  }

  if (!info.timestamp) {
    console.warn('Storage should have timestamp');
    return;
  }

  console.log(
    `✓ Storage info retrieved: ${info.size} bytes, v${info.version}`
  );
}

/**
 * Test restoration with no saved state falls back to defaults
 */
export function testRestoreWithoutSavedState(): void {
  console.log('Testing: Restore without saved state');
  clearLotteryState();

  // Verify storage is empty
  if (loadLotteryState() !== null) {
    console.warn('Storage should be empty');
    return;
  }

  // Restore (should set defaults)
  restoreLotteryState();

  const store = useLotteryStore.getState() as any;
  if (!store.selectedLottery) {
    console.warn('Should have default lottery after restore');
    return;
  }

  console.log('✓ Restore without saved state uses defaults');
}

/**
 * Test auto-save subscription
 */
export function testAutoSave(): void {
  console.log('Testing: Auto-save subscription');
  clearLotteryState();

  const unsubscribe = setupAutoSave();

  const store = useLotteryStore.getState() as any;
  store.updateSuperprice(7000);

  // Give subscription time to trigger
  setTimeout(() => {
    const loaded = loadLotteryState();
    if (loaded?.superprice !== 7000) {
      console.warn('Auto-save failed to persist superprice');
    } else {
      console.log('✓ Auto-save persisted state');
    }

    unsubscribe();
  }, 100);
}

/**
 * Test prize table persistence
 */
export function testSavePrizeTable(): void {
  console.log('Testing: Save prize table');
  clearLotteryState();

  const store = useLotteryStore.getState() as any;
  store.selectLottery(LOTTERY_4_FROM_20.id);

  // Get current prize table
  const originalTable = store.currentPrizeTable;

  saveLotteryState();
  const loaded = loadLotteryState();

  if (!loaded?.prizeTable) {
    console.warn('Prize table should be persisted');
    return;
  }

  if (loaded.prizeTable.rows.length !== originalTable.rows.length) {
    console.warn('Prize table length mismatch');
    return;
  }

  console.log('✓ Prize table persisted');
}

/**
 * Run all persistence tests
 */
export function runAllPersistenceTests(): void {
  console.log('\n=== Running Persistence Tests ===\n');

  testSaveInitialState();
  testSaveModifiedState();
  testRestoreState();
  testSaveVariant();
  testSaveSecondaryPrize();
  testClearState();
  testGetStorageInfo();
  testRestoreWithoutSavedState();
  testSavePrizeTable();
  testAutoSave();

  console.log('\n=== Persistence Tests Complete ===\n');
}
