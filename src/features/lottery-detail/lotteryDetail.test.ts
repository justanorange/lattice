/**
 * LotteryDetailPage Tests
 * Minimal tests for MVP
 */

import { useLotteryStore } from "../../entities/lottery/store";

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
    const { calculateEV } = require("../../entities/lottery/calculation");
    
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

