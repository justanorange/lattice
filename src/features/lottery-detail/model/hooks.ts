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
  updateTicketCost: (value: number) => void;
  updateSuperprice: (value: number) => void;
  updatePrizeRow: (index: number, row: PrizeRow) => void;
  resetPrizeTable: () => void;
  resetTicketCost: () => void;
  resetSuperprice: () => void;
}

/**
 * Main hook for lottery detail page
 * Handles lottery selection and EV calculation
 */
export function useLotteryDetail(lotteryId: string): UseLotteryDetailReturn {
  const {
    selectedLottery,
    currentSuperprice,
    currentTicketCost,
    currentPrizeTable,
    updateSuperprice,
    updateTicketCost,
    selectLottery,
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

  return {
    lottery: selectedLottery,
    ticketCost: currentTicketCost,
    superprice: currentSuperprice,
    prizeTable: currentPrizeTable,
    evCalculation,
    defaultTicketCost: selectedLottery.defaultTicketCost,
    defaultSuperprice: selectedLottery.defaultSuperprice,
    updateTicketCost,
    updateSuperprice,
    updatePrizeRow,
    resetPrizeTable: resetPrizeTableToDefaults,
    resetTicketCost: resetTicketCostToDefault,
    resetSuperprice: resetSuperpriceToDefault,
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
