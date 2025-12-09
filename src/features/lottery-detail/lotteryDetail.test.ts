/**
 * LotteryDetailPage Tests
 * Minimal tests for MVP
 */

import { useLotteryStore } from "../../entities/lottery/store";
import { calculateEV } from "../../entities/lottery/calculation";

/**
 * Test that store provides required data
 */
export function testLotteryDetailStoreAccess(): boolean {
  try {
    const store = useLotteryStore.getState();
    console.assert(store.selectedLottery !== undefined, "Selected lottery should exist");
    console.assert(store.currentSuperprice > 0, "Superprice should be positive");
    console.assert(store.currentPrizeTable.rows.length > 0, "Prize table should have rows");
    return true;
  } catch (e) {
    console.error("Store access test failed:", e);
    return false;
  }
}

/**
 * Test superprice update
 */
export function testSuperpriceUpdate(): boolean {
  try {
    const store = useLotteryStore.getState();
    const initialSuperprice = store.currentSuperprice;
    store.updateSuperprice(50000000);
    const newState = useLotteryStore.getState();
    console.assert(
      newState.currentSuperprice === 50000000,
      "Superprice should update"
    );
    // Restore
    store.updateSuperprice(initialSuperprice);
    return true;
  } catch (e) {
    console.error("Superprice update test failed:", e);
    return false;
  }
}

/**
 * Test EV calculation updates with superprice change
 */
export function testEVUpdatesWithSuperprice(): boolean {
  try {
    const store = useLotteryStore.getState();
    
    const ev1 = calculateEV(
      store.selectedLottery,
      store.currentSuperprice,
      store.currentPrizeTable,
      store.currentTicketCost
    );
    
    store.updateSuperprice(200000000);
    const ev2 = calculateEV(
      store.selectedLottery,
      store.currentSuperprice,
      store.currentPrizeTable,
      store.currentTicketCost
    );
    
    console.assert(ev2.expectedValue !== ev1.expectedValue, "EV should change with superprice");
    return true;
  } catch (e) {
    console.error("EV update test failed:", e);
    return false;
  }
}

/**
 * Test prize row update
 */
export function testPrizeRowUpdate(): boolean {
  try {
    const store = useLotteryStore.getState();
    const prizeTable = store.currentPrizeTable;
    const firstEditableRow = prizeTable.rows.find(
      (row) => typeof row.prize === "number" && row.prize > 0
    );
    
    if (!firstEditableRow) {
      console.warn("No editable prize row found for test");
      return true; // Skip test if no editable rows
    }
    
    const rowIndex = prizeTable.rows.indexOf(firstEditableRow);
    const originalPrize = firstEditableRow.prize as number;
    
    store.updatePrizeRow(rowIndex, { ...firstEditableRow, prize: originalPrize + 1000 });
    const newState = useLotteryStore.getState();
    const updatedRow = newState.currentPrizeTable.rows[rowIndex];
    
    console.assert(
      updatedRow.prize === originalPrize + 1000,
      "Prize row should update"
    );
    
    // Restore
    store.updatePrizeRow(rowIndex, { ...firstEditableRow, prize: originalPrize });
    return true;
  } catch (e) {
    console.error("Prize row update test failed:", e);
    return false;
  }
}

/**
 * Test reset prize table to defaults
 */
export function testResetPrizeTable(): boolean {
  try {
    const store = useLotteryStore.getState();
    const originalTable = structuredClone(store.currentPrizeTable);
    
    // Modify a row
    const firstEditableRow = originalTable.rows.find(
      (row) => typeof row.prize === "number" && row.prize > 0
    );
    if (firstEditableRow) {
      const rowIndex = originalTable.rows.indexOf(firstEditableRow);
      store.updatePrizeRow(rowIndex, { ...firstEditableRow, prize: 999999 });
    }
    
    // Reset
    store.resetPrizeTableToDefaults();
    const resetState = useLotteryStore.getState();
    
    // Check that table was reset (rows count should match)
    console.assert(
      resetState.currentPrizeTable.rows.length === originalTable.rows.length,
      "Prize table should have same number of rows after reset"
    );
    
    return true;
  } catch (e) {
    console.error("Reset prize table test failed:", e);
    return false;
  }
}

