/**
 * Strategy Store (Zustand)
 * Manages selected strategy, parameters, and generated tickets
 */

import { create } from 'zustand';
import type { Ticket } from '@/entities/lottery/types';

export interface StrategyStoreState {
  // Selected strategy
  selectedStrategyId: string;
  strategyParams: Record<string, unknown>;
  ticketCount: number;

  // Generated tickets (from generation page)
  generatedTickets: Ticket[];

  // Actions
  setStrategy: (strategyId: string, params: Record<string, unknown>, ticketCount: number) => void;
  setTickets: (tickets: Ticket[]) => void;
  clearTickets: () => void;
  reset: () => void;
}

const initialState = {
  selectedStrategyId: 'max_coverage',
  strategyParams: { budget: 1000 },
  ticketCount: 10,
  generatedTickets: [],
};

export const useStrategyStore = create<StrategyStoreState>((set) => ({
  ...initialState,

  setStrategy: (strategyId, params, ticketCount) => {
    set({
      selectedStrategyId: strategyId,
      strategyParams: params,
      ticketCount,
    });
  },

  setTickets: (tickets) => {
    set({ generatedTickets: tickets });
  },

  clearTickets: () => {
    set({ generatedTickets: [] });
  },

  reset: () => {
    set(initialState);
  },
}));
