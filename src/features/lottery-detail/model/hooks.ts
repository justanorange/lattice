/**
 * Lottery Detail Model Hooks
 * Custom hooks for lottery detail feature logic
 */

import React from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import { calculateEV } from '@/entities/lottery/calculation';
import type { EVCalculation, Lottery, PrizeTable, PrizeRow } from '@/entities/lottery/types';

export interface UseLotteryDetailReturn {
  lottery: Lottery;
  ticketCost: number;
  superprice: number;
  prizeTable: PrizeTable;
  evCalculation: EVCalculation;
  defaultTicketCost: number;
  defaultSuperprice: number;
  selectedVariant?: string;
  secondaryPrize?: number;
  defaultSecondaryPrize?: number;
  averagePool?: number;
  defaultAveragePool?: number;
  updateTicketCost: (value: number) => void;
  updateSuperprice: (value: number) => void;
  updatePrizeRow: (index: number, row: PrizeRow) => void;
  updateSecondaryPrize: (value: number) => void;
  updateAveragePool: (value: number) => void;
  selectVariant: (variantType: string) => void;
  resetPrizeTable: () => void;
  resetTicketCost: () => void;
  resetSuperprice: () => void;
  resetSecondaryPrize: () => void;
  resetAveragePool: () => void;
}

/**
 * Main hook for lottery detail page
 * Handles lottery selection and EV calculation
 */
export function useLotteryDetail(lotteryId: string): UseLotteryDetailReturn {
  const {
    selectedLottery,
    selectedVariant,
    currentSuperprice,
    currentTicketCost,
    currentPrizeTable,
    currentSecondaryPrize,
    currentAveragePool,
    updateSuperprice,
    updateTicketCost,
    updateSecondaryPrize,
    updateAveragePool,
    selectLottery,
    selectVariant,
    updatePrizeRow,
    resetPrizeTableToDefaults,
    resetSuperpriceToDefault,
    resetTicketCostToDefault,
  } = useLotteryStore();

  // Ensure correct lottery is selected
  React.useEffect(() => {
    if (lotteryId && lotteryId !== selectedLottery.id) {
      selectLottery(lotteryId);
    }
  }, [lotteryId, selectedLottery.id, selectLottery]);

  // Calculate EV - updates in real-time when parameters change
  const evCalculation = React.useMemo(
    () =>
      calculateEV(
        selectedLottery,
        currentSuperprice,
        currentPrizeTable,
        currentTicketCost
      ),
    [selectedLottery, currentSuperprice, currentPrizeTable, currentTicketCost]
  );

  // Reset handlers for secondary prize and average pool
  const resetSecondaryPrize = React.useCallback(() => {
    updateSecondaryPrize(selectedLottery.defaultSecondaryPrize || 0);
  }, [selectedLottery, updateSecondaryPrize]);

  const resetAveragePool = React.useCallback(() => {
    const defaultPool = selectedLottery.variants?.[0]?.averagePool || 0;
    updateAveragePool(defaultPool);
  }, [selectedLottery, updateAveragePool]);

  return {
    lottery: selectedLottery,
    ticketCost: currentTicketCost,
    superprice: currentSuperprice,
    prizeTable: currentPrizeTable,
    evCalculation,
    defaultTicketCost: selectedLottery.defaultTicketCost,
    defaultSuperprice: selectedLottery.defaultSuperprice,
    selectedVariant,
    secondaryPrize: currentSecondaryPrize,
    defaultSecondaryPrize: selectedLottery.defaultSecondaryPrize,
    averagePool: currentAveragePool,
    defaultAveragePool: selectedLottery.variants?.[0]?.averagePool,
    updateTicketCost,
    updateSuperprice,
    updatePrizeRow,
    updateSecondaryPrize,
    updateAveragePool,
    selectVariant,
    resetPrizeTable: resetPrizeTableToDefaults,
    resetTicketCost: resetTicketCostToDefault,
    resetSuperprice: resetSuperpriceToDefault,
    resetSecondaryPrize,
    resetAveragePool,
  };
}

/**
 * Constants for superprice validation
 */
export const SUPERPRICE_LIMITS = {
  min: 0,
  max: 500_000_000,
  step: 1_000_000,
} as const;

/**
 * Validate and clamp superprice value
 */
export function clampSuperprice(value: number): number {
  return Math.max(
    SUPERPRICE_LIMITS.min,
    Math.min(SUPERPRICE_LIMITS.max, value)
  );
}
