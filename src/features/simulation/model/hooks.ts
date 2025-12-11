/**
 * Simulation Model Hooks
 * Custom hooks for simulation feature logic
 */

import { useState, useCallback } from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import { simulateLottery } from '@/entities/lottery/simulation';
import type { SimulationResult, Ticket, Lottery } from '@/entities/lottery/types';

export interface UseSimulationReturn {
  lottery: Lottery;
  roundsCount: number;
  result: SimulationResult | null;
  isRunning: boolean;
  setRoundsCount: (count: number) => void;
  runSimulation: (tickets: Ticket[]) => void;
}

/**
 * Main hook for simulation feature
 */
export function useSimulation(): UseSimulationReturn {
  const {
    selectedLottery,
    currentTicketCost,
    currentPrizeTable,
    currentSuperprice,
    currentAveragePool,
  } = useLotteryStore();

  const [roundsCount, setRoundsCount] = useState(100);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = useCallback((tickets: Ticket[]) => {
    if (tickets.length === 0) {
      alert('Нет билетов для симуляции');
      return;
    }

    setIsRunning(true);
    setResult(null);

    // Run simulation in next tick to avoid blocking UI
    setTimeout(() => {
      try {
        const simulationResult = simulateLottery(
          selectedLottery,
          tickets,
          roundsCount,
          currentPrizeTable,
          currentSuperprice,
          currentTicketCost,
          undefined,
          currentAveragePool
        );
        setResult(simulationResult);
      } catch (err) {
        console.error('Simulation error:', err);
        alert('Ошибка симуляции: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsRunning(false);
      }
    }, 10);
  }, [selectedLottery, roundsCount, currentPrizeTable, currentSuperprice, currentTicketCost, currentAveragePool]);

  return {
    lottery: selectedLottery,
    roundsCount,
    result,
    isRunning,
    setRoundsCount,
    runSimulation,
  };
}
