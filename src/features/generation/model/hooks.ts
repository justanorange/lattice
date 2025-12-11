/**
 * Generation Model Hooks
 * Custom hooks for generation feature logic
 */

import { useState, useEffect } from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import { executeStrategy } from '@/entities/strategies/generator';
import type { StrategyResult } from '@/entities/strategies/types';
import type { Lottery } from '@/entities/lottery/types';

export interface UseGenerationReturn {
  lottery: Lottery;
  result: StrategyResult | null;
  isGenerating: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

export interface UseGenerationParams {
  strategyId: string;
  strategyParams: Record<string, unknown>;
  ticketCount: number;
}

/**
 * Main hook for generation feature
 */
export function useGeneration({
  strategyId,
  strategyParams,
  ticketCount,
}: UseGenerationParams): UseGenerationReturn {
  const { selectedLottery, currentTicketCost } = useLotteryStore();

  const [result, setResult] = useState<StrategyResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTickets = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Pass ticketCount as part of params if not already there
      const params = {
        ...strategyParams,
        ticketCount,
      };
      const strategyResult = await executeStrategy(
        strategyId,
        selectedLottery,
        params,
        currentTicketCost
      );
      setResult(strategyResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateTickets();
  }, [strategyId, strategyParams, ticketCount, selectedLottery.id, currentTicketCost]);

  const regenerate = async () => {
    await generateTickets();
  };

  return {
    lottery: selectedLottery,
    result,
    isGenerating,
    error,
    regenerate,
  };
}
