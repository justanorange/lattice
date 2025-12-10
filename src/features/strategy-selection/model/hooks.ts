/**
 * Strategy Selection Model Hooks
 * Custom hooks for strategy selection logic
 */

import { useState, useMemo, useCallback } from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import {
  getStrategiesForLottery,
  calculateTicketCountForStrategy,
} from '@/entities/strategies/config';
import type { Strategy, StrategyParameter } from '@/entities/strategies/types';
import type { Lottery, PrizeTable } from '@/entities/lottery/types';

export interface UseStrategySelectionReturn {
  lottery: Lottery;
  ticketCost: number;
  prizeTable: PrizeTable;
  superprice: number;
  strategies: Strategy[];
  selectedStrategy: Strategy | undefined;
  selectedStrategyId: string;
  params: Record<string, unknown>;
  calculatedTicketCount: number;
  customTicketCount: number | null;
  effectiveTicketCount: number;
  effectiveBudget: number;
  selectStrategy: (strategyId: string) => void;
  updateParam: (key: string, value: unknown) => void;
  setCustomTicketCount: (count: number | null) => void;
  setBudget: (budget: number) => void;
}

/**
 * Main hook for strategy selection
 */
export function useStrategySelection(): UseStrategySelectionReturn {
  const { selectedLottery, currentTicketCost, currentPrizeTable, currentSuperprice } = useLotteryStore();

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [customTicketCount, setCustomTicketCount] = useState<number | null>(null);

  const availableStrategies = getStrategiesForLottery(selectedLottery.id);
  const strategy = availableStrategies.find((s) => s.id === selectedStrategyId);

  // Calculated ticket count based on strategy and parameters
  const calculatedTicketCount = useMemo(() => {
    if (!strategy) return 1;
    return calculateTicketCountForStrategy(
      strategy.id,
      selectedLottery,
      params,
      currentTicketCost
    );
  }, [strategy, selectedLottery, params, currentTicketCost]);

  const effectiveTicketCount = customTicketCount ?? calculatedTicketCount;
  const effectiveBudget = effectiveTicketCount * currentTicketCost;

  const selectStrategy = useCallback((strategyId: string) => {
    setSelectedStrategyId(strategyId);
    setCustomTicketCount(null);

    // Reset params to defaults
    const strat = availableStrategies.find((s) => s.id === strategyId);
    if (strat) {
      const newParams: Record<string, unknown> = {};
      for (const param of strat.parameters) {
        newParams[param.key] = getDefaultParamValue(param);
      }
      setParams(newParams);
    }
  }, [availableStrategies]);

  const updateParam = useCallback((key: string, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setBudget = useCallback((budget: number) => {
    const tickets = Math.max(1, Math.floor(budget / currentTicketCost));
    setCustomTicketCount(tickets);
  }, [currentTicketCost]);

  return {
    lottery: selectedLottery,
    ticketCost: currentTicketCost,
    prizeTable: currentPrizeTable,
    superprice: currentSuperprice,
    strategies: availableStrategies,
    selectedStrategy: strategy,
    selectedStrategyId,
    params,
    calculatedTicketCount,
    customTicketCount,
    effectiveTicketCount,
    effectiveBudget,
    selectStrategy,
    updateParam,
    setCustomTicketCount,
    setBudget,
  };
}

/**
 * Get default value for a strategy parameter
 */
function getDefaultParamValue(param: StrategyParameter): unknown {
  if (param.type === 'text' && (!param.defaultValue || param.defaultValue === '')) {
    return '';
  }
  return param.defaultValue;
}
