/**
 * LocalStorage persistence for lottery state
 * Handles save/load operations with schema versioning and migration support
 */

import type { LotteryState } from './types';
import { useLotteryStore } from './store';

const STORAGE_KEY = 'lattice_lottery_state';
const SCHEMA_VERSION = 1;

/**
 * Persisted state with version tracking
 */
interface PersistedState {
  version: number
  timestamp: number
  data: LotteryState
}

/**
 * Serialize LotteryState for storage
 */
function serializeState(state: LotteryState): string {
  const persisted: PersistedState = {
    version: SCHEMA_VERSION,
    timestamp: Date.now(),
    data: state,
  };
  return JSON.stringify(persisted);
}

/**
 * Deserialize and validate persisted state
 */
function deserializeState(json: string): LotteryState | null {
  try {
    const persisted = JSON.parse(json) as PersistedState;

    // Validate structure
    if (
      !persisted ||
      typeof persisted !== 'object' ||
      typeof persisted.version !== 'number'
    ) {
      console.warn('Invalid persisted state structure');
      return null;
    }

    // Handle schema migration if needed
    if (persisted.version !== SCHEMA_VERSION) {
      const migrated = migrateState(persisted.data, persisted.version);
      return migrated;
    }

    return persisted.data;
  } catch (error) {
    console.warn('Failed to parse persisted state:', error);
    return null;
  }
}

/**
 * Migrate state from older schema versions
 */
function migrateState(state: unknown, fromVersion: number): LotteryState | null {
  // Version 1 is current, no migrations needed yet
  // When version 2 released, add migration logic here
  if (fromVersion === 1) {
    try {
      const migrated = state as LotteryState;
      // Add validation of required fields
      if (
        migrated &&
        typeof migrated === 'object' &&
        'selectedLotteryId' in migrated
      ) {
        return migrated;
      }
    } catch (e) {
      console.warn('Migration failed for v1 state');
    }
  }

  return null;
}

/**
 * Save current lottery state to LocalStorage
 */
export function saveLotteryState(): void {
  try {
    const store = useLotteryStore.getState() as any;
    // Create serializable state (exclude store methods)
    const stateToSave: LotteryState = {
      lottery: store.selectedLottery,
      variant: store.selectedVariant,
      superprice: store.currentSuperprice,
      secondaryPrize: store.currentSecondaryPrize,
      ticketCost: store.currentTicketCost,
      prizeTable: store.currentPrizeTable,
      averagePool: store.currentAveragePool,
    };

    const serialized = serializeState(stateToSave);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save lottery state:', error);
  }
}

/**
 * Load lottery state from LocalStorage
 */
export function loadLotteryState(): LotteryState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return null;
    }

    const state = deserializeState(json);
    return state;
  } catch (error) {
    console.warn('Failed to load lottery state:', error);
    return null;
  }
}

/**
 * Clear saved lottery state from LocalStorage
 */
export function clearLotteryState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear lottery state:', error);
  }
}

/**
 * Restore persisted state to store, or use defaults if none exists
 */
export function restoreLotteryState(): void {
  try {
    const persisted = loadLotteryState();

    if (!persisted) {
      // No saved state, ensure defaults are loaded
      const store = useLotteryStore.getState() as any;
      store.resetAllToDefaults();
      return;
    }

    const store = useLotteryStore.getState() as any;

    // Restore state atomically
    if (persisted.lottery) {
      store.selectLottery(persisted.lottery.id);
    }

    if (persisted.variant) {
      store.selectVariant(persisted.variant);
    }

    if (persisted.superprice !== undefined) {
      store.updateSuperprice(persisted.superprice);
    }

    if (persisted.secondaryPrize !== undefined) {
      store.updateSecondaryPrize(persisted.secondaryPrize);
    }

    if (persisted.ticketCost !== undefined) {
      store.updateTicketCost(persisted.ticketCost);
    }

    if (persisted.averagePool !== undefined) {
      store.updateAveragePool(persisted.averagePool);
    }

    if (persisted.prizeTable) {
      store.updatePrizeTable(persisted.prizeTable);
    }
  } catch (error) {
    console.warn('Failed to restore lottery state:', error);
    // Fall back to defaults
    const store = useLotteryStore.getState() as any;
    store.resetAllToDefaults();
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  key: string
  size: number
  version: number
  timestamp?: Date
} | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return null;
    }

    const persisted = JSON.parse(json) as PersistedState;

    return {
      key: STORAGE_KEY,
      size: new Blob([json]).size,
      version: persisted.version,
      timestamp: new Date(persisted.timestamp),
    };
  } catch (error) {
    console.warn('Failed to get storage info:', error);
    return null;
  }
}

/**
 * Subscribe to store changes and auto-save on specific mutations
 * Returns unsubscribe function
 */
export function setupAutoSave(): () => void {
  return useLotteryStore.subscribe((state, prevState) => {
    // Only save on specific mutations to avoid excessive saves
    const shouldSave =
      state.selectedLotteryId !== prevState.selectedLotteryId ||
      state.currentSuperprice !== prevState.currentSuperprice ||
      state.currentSecondaryPrize !== prevState.currentSecondaryPrize ||
      state.currentTicketCost !== prevState.currentTicketCost ||
      state.currentAveragePool !== prevState.currentAveragePool ||
      state.currentPrizeTable !== prevState.currentPrizeTable;

    if (shouldSave) {
      saveLotteryState();
    }
  });
}
