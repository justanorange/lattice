/**
 * Lottery State Store (Zustand)
 * Manages selected lottery, superprice, prize tables, and configuration
 * Persists settings PER LOTTERY to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lottery, PrizeTable, PrizeRow } from './types';
import {
  LOTTERY_8_PLUS_1,
  getLotteryById,
} from './config';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Per-lottery saved settings
 */
export interface LotterySettings {
  superprice: number;
  secondaryPrize?: number;
  ticketCost: number;
  prizeTable: PrizeTable;
  averagePool?: number;
  variant?: string;
}

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

  // Per-lottery saved settings
  savedSettings: Record<string, LotterySettings>;

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
  resetSuperpriceToDefault: () => void;
  resetTicketCostToDefault: () => void;
  resetAllToDefaults: () => void;

  // Getters
  getSelectedLottery: () => Lottery;
  getPrizeTable: () => PrizeTable;
  getSuperprice: () => number;
  getSecondaryPrize: () => number | undefined;
}

/**
 * Get default settings for a lottery
 */
function getDefaultSettings(lottery: Lottery): LotterySettings {
  const prizeTable = lottery.prizeTable
    ? structuredClone(lottery.prizeTable)
    : lottery.variants?.[0]?.prizeTable
      ? structuredClone(lottery.variants[0].prizeTable)
      : { rows: [], currency: '₽' };

  // Find averagePool from any variant that has it
  const variantWithPool = lottery.variants?.find(v => v.averagePool !== undefined);
  const averagePool = variantWithPool?.averagePool;

  return {
    superprice: lottery.defaultSuperprice,
    secondaryPrize: lottery.defaultSecondaryPrize,
    ticketCost: lottery.defaultTicketCost,
    prizeTable,
    averagePool,
    variant: lottery.variants?.[0]?.type,
  };
}

/**
 * Save current settings to savedSettings
 */
function saveCurrentSettings(state: LotteryStoreState): Record<string, LotterySettings> {
  return {
    ...state.savedSettings,
    [state.selectedLotteryId]: {
      superprice: state.currentSuperprice,
      secondaryPrize: state.currentSecondaryPrize,
      ticketCost: state.currentTicketCost,
      prizeTable: structuredClone(state.currentPrizeTable),
      averagePool: state.currentAveragePool,
      variant: state.selectedVariant,
    },
  };
}

/**
 * Create Zustand store for lottery state
 * Persists to localStorage with per-lottery settings
 */
export const useLotteryStore = create<LotteryStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedLotteryId: LOTTERY_8_PLUS_1.id,
      selectedLottery: LOTTERY_8_PLUS_1,
      selectedVariant: undefined,
      currentPrizeTable: structuredClone(LOTTERY_8_PLUS_1.prizeTable!),
      currentSuperprice: LOTTERY_8_PLUS_1.defaultSuperprice,
      currentSecondaryPrize: LOTTERY_8_PLUS_1.defaultSecondaryPrize,
      currentTicketCost: LOTTERY_8_PLUS_1.defaultTicketCost,
      currentAveragePool: undefined,
      savedSettings: {},

      // Actions
      selectLottery: (lotteryId: string) => {
        const lottery = getLotteryById(lotteryId);
        if (!lottery) {
          console.warn(`Lottery not found: ${lotteryId}`);
          return;
        }

        const state = get();

        // Save current lottery settings before switching
        const newSavedSettings = saveCurrentSettings(state);

        // Load saved settings for new lottery, or use defaults
        const savedForLottery = newSavedSettings[lotteryId];
        const settings = savedForLottery || getDefaultSettings(lottery);

        set({
          selectedLotteryId: lotteryId,
          selectedLottery: lottery,
          selectedVariant: settings.variant,
          currentPrizeTable: structuredClone(settings.prizeTable),
          currentSuperprice: settings.superprice,
          currentSecondaryPrize: settings.secondaryPrize,
          currentTicketCost: settings.ticketCost,
          currentAveragePool: settings.averagePool,
          savedSettings: newSavedSettings,
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
          console.warn('Superprice cannot be negative');
          return;
        }
        set({ currentSuperprice: amount });
      },

      updateSecondaryPrize: (amount: number) => {
        if (amount < 0) {
          console.warn('Secondary prize cannot be negative');
          return;
        }
        set({ currentSecondaryPrize: amount });
      },

      updateTicketCost: (cost: number) => {
        if (cost <= 0) {
          console.warn('Ticket cost must be positive');
          return;
        }
        set({ currentTicketCost: cost });
      },

      updateAveragePool: (amount: number) => {
        if (amount < 0) {
          console.warn('Average pool cannot be negative');
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
        const defaults = getDefaultSettings(lottery);

        // Also remove from saved settings
        const { savedSettings, selectedLotteryId } = get();
        const newSaved = { ...savedSettings };
        delete newSaved[selectedLotteryId];

        set({
          currentPrizeTable: defaults.prizeTable,
          currentSuperprice: defaults.superprice,
          currentSecondaryPrize: defaults.secondaryPrize,
          currentTicketCost: defaults.ticketCost,
          currentAveragePool: defaults.averagePool,
          selectedVariant: defaults.variant,
          savedSettings: newSaved,
        });
      },

      resetSuperpriceToDefault: () => {
        const lottery = get().selectedLottery;
        set({ currentSuperprice: lottery.defaultSuperprice });
      },

      resetTicketCostToDefault: () => {
        const lottery = get().selectedLottery;
        set({ currentTicketCost: lottery.defaultTicketCost });
      },

      // Getters
      getSelectedLottery: () => get().selectedLottery,
      getPrizeTable: () => get().currentPrizeTable,
      getSuperprice: () => get().currentSuperprice,
      getSecondaryPrize: () => get().currentSecondaryPrize,
    }),
    {
      name: STORAGE_KEYS.lottery_state,
      partialize: (state) => ({
        // Persist current state + all saved settings
        selectedLotteryId: state.selectedLotteryId,
        selectedVariant: state.selectedVariant,
        currentSuperprice: state.currentSuperprice,
        currentSecondaryPrize: state.currentSecondaryPrize,
        currentTicketCost: state.currentTicketCost,
        currentPrizeTable: state.currentPrizeTable,
        currentAveragePool: state.currentAveragePool,
        savedSettings: state.savedSettings,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, restore selectedLottery from ID
        if (state) {
          const lottery = getLotteryById(state.selectedLotteryId);
          if (lottery) {
            state.selectedLottery = lottery;
          }
        }
      },
    }
  )
);

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
