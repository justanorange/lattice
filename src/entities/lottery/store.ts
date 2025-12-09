/**
 * Lottery State Store (Zustand)
 * Manages selected lottery, superprice, prize tables, and configuration
 */

import { create } from "zustand";
import type { Lottery, PrizeTable, PrizeRow } from "./types";
import {
  LOTTERY_8_PLUS_1,
  getLotteryById,
} from "./config";

/**
 * State for lottery management
 */
export interface LotteryStoreState {
  // Current lottery selection
  selectedLotteryId: string;
  selectedLottery: Lottery;

  // Current variant (for multi-variant lotteries like 4из20)
  selectedVariant?: string;

  // Editable prize table (user may have modified defaults)
  currentPrizeTable: PrizeTable;

  // Current superprice (editable)
  currentSuperprice: number;

  // Current secondary prize (for 5из36+1)
  currentSecondaryPrize?: number;

  // Ticket cost
  currentTicketCost: number;

  // Average pool (for percentage-based lotteries like 4из20)
  currentAveragePool?: number;

  // Actions
  selectLottery: (lotteryId: string) => void;
  selectVariant: (variantType: string) => void;
  updateSuperprice: (amount: number) => void;
  updateSecondaryPrize: (amount: number) => void;
  updateTicketCost: (cost: number) => void;
  updateAveragePool: (amount: number) => void;
  updatePrizeTable: (prizeTable: PrizeTable) => void;
  updatePrizeRow: (index: number, row: PrizeRow) => void;
  resetPrizeTableToDefaults: () => void;
  resetAllToDefaults: () => void;

  // Getters
  getSelectedLottery: () => Lottery;
  getPrizeTable: () => PrizeTable;
  getSuperprice: () => number;
  getSecondaryPrize: () => number | undefined;
}

/**
 * Create Zustand store for lottery state
 * Persists to localStorage (via middleware in lottery-store.ts)
 */
export const useLotteryStore = create<LotteryStoreState>((set, get) => ({
  // Initial state
  selectedLotteryId: LOTTERY_8_PLUS_1.id,
  selectedLottery: LOTTERY_8_PLUS_1,
  selectedVariant: undefined,
  currentPrizeTable: structuredClone(LOTTERY_8_PLUS_1.prizeTable!),
  currentSuperprice: LOTTERY_8_PLUS_1.defaultSuperprice,
  currentSecondaryPrize: LOTTERY_8_PLUS_1.defaultSecondaryPrize,
  currentTicketCost: LOTTERY_8_PLUS_1.defaultTicketCost,
  currentAveragePool: undefined,

  // Actions
  selectLottery: (lotteryId: string) => {
    const lottery = getLotteryById(lotteryId);
    if (!lottery) {
      console.warn(`Lottery not found: ${lotteryId}`);
      return;
    }

    const prizeTable = lottery.prizeTable
      ? structuredClone(lottery.prizeTable)
      : lottery.variants?.[0]?.prizeTable
        ? structuredClone(lottery.variants[0].prizeTable)
        : { rows: [], currency: "₽" };

    set({
      selectedLotteryId: lotteryId,
      selectedLottery: lottery,
      selectedVariant: lottery.variants ? lottery.variants[0].type : undefined,
      currentPrizeTable: prizeTable,
      currentSuperprice: lottery.defaultSuperprice,
      currentSecondaryPrize: lottery.defaultSecondaryPrize,
      currentTicketCost: lottery.defaultTicketCost,
      currentAveragePool: lottery.variants?.[0]?.averagePool,
    });
  },

  selectVariant: (variantType: string) => {
    const lottery = get().selectedLottery;
    if (!lottery.variants) return;

    const variant = lottery.variants.find((v) => v.type === variantType);
    if (!variant) return;

    set({
      selectedVariant: variantType,
      currentPrizeTable: structuredClone(variant.prizeTable),
      currentAveragePool: variant.averagePool,
    });
  },

  updateSuperprice: (amount: number) => {
    if (amount < 0) {
      console.warn("Superprice cannot be negative");
      return;
    }
    set({ currentSuperprice: amount });
  },

  updateSecondaryPrize: (amount: number) => {
    if (amount < 0) {
      console.warn("Secondary prize cannot be negative");
      return;
    }
    set({ currentSecondaryPrize: amount });
  },

  updateTicketCost: (cost: number) => {
    if (cost <= 0) {
      console.warn("Ticket cost must be positive");
      return;
    }
    set({ currentTicketCost: cost });
  },

  updateAveragePool: (amount: number) => {
    if (amount < 0) {
      console.warn("Average pool cannot be negative");
      return;
    }
    set({ currentAveragePool: amount });
  },

  updatePrizeTable: (prizeTable: PrizeTable) => {
    set({ currentPrizeTable: structuredClone(prizeTable) });
  },

  updatePrizeRow: (index: number, row: PrizeRow) => {
    const prizeTable = get().currentPrizeTable;
    if (index < 0 || index >= prizeTable.rows.length) {
      console.warn(`Prize row index out of bounds: ${index}`);
      return;
    }

    const newRows = [...prizeTable.rows];
    newRows[index] = { ...newRows[index], ...row };

    set({
      currentPrizeTable: {
        ...prizeTable,
        rows: newRows,
      },
    });
  },

  resetPrizeTableToDefaults: () => {
    const lottery = get().selectedLottery;
    const variant = get().selectedVariant;

    let defaultTable = lottery.prizeTable;
    if (!defaultTable && lottery.variants) {
      const selectedVariant = lottery.variants.find(
        (v) => v.type === variant
      );
      defaultTable = selectedVariant?.prizeTable;
    }

    if (defaultTable) {
      set({ currentPrizeTable: structuredClone(defaultTable) });
    }
  },

  resetAllToDefaults: () => {
    const lottery = get().selectedLottery;

    const prizeTable = lottery.prizeTable
      ? structuredClone(lottery.prizeTable)
      : lottery.variants?.[0]?.prizeTable
        ? structuredClone(lottery.variants[0].prizeTable)
        : { rows: [], currency: "₽" };

    set({
      currentPrizeTable: prizeTable,
      currentSuperprice: lottery.defaultSuperprice,
      currentSecondaryPrize: lottery.defaultSecondaryPrize,
      currentTicketCost: lottery.defaultTicketCost,
      currentAveragePool: lottery.variants?.[0]?.averagePool,
    });
  },

  // Getters
  getSelectedLottery: () => get().selectedLottery,
  getPrizeTable: () => get().currentPrizeTable,
  getSuperprice: () => get().currentSuperprice,
  getSecondaryPrize: () => get().currentSecondaryPrize,
}));

/**
 * Custom hook to use lottery store with proper TypeScript inference
 */
export function useLottery() {
  return useLotteryStore();
}

/**
 * Get lottery store snapshot (useful for non-React code)
 */
export function getLotteryStoreSnapshot() {
  return useLotteryStore.getState();
}

/**
 * Subscribe to lottery store changes
 */
export function subscribeLotteryStore(
  callback: (state: LotteryStoreState) => void
) {
  return useLotteryStore.subscribe(callback);
}
