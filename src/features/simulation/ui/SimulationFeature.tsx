/**
 * SimulationFeature Component
 * Run lottery simulations and display results
 * Refactored to use section components
 */

import React from 'react';
import { Container, Button } from '@/shared/ui';
import { STRINGS } from '@/shared/constants';
import type { Ticket } from '@/entities/lottery/types';
import { useSimulation } from '../model';
import {
  SimulationHeader,
  SimulationControls,
  SimulationStats,
  BankrollChart,
} from './sections';

export interface SimulationFeatureProps {
  tickets?: Ticket[];
  onBack?: () => void;
}

/**
 * Simulation Feature Component
 * Run simulations and show statistics
 */
export const SimulationFeature: React.FC<SimulationFeatureProps> = ({
  tickets = [],
  onBack,
}) => {
  const {
    lottery,
    roundsCount,
    result,
    isRunning,
    setRoundsCount,
    runSimulation,
  } = useSimulation();

  const handleRunSimulation = React.useCallback(() => {
    runSimulation(tickets);
  }, [runSimulation, tickets]);

  return (
    <Container>
      <SimulationHeader
        lottery={lottery}
        roundsCount={roundsCount}
        onBack={onBack}
      />

      <SimulationControls
        roundsCount={roundsCount}
        onRoundsChange={setRoundsCount}
        onRun={handleRunSimulation}
        isRunning={isRunning}
        hasTickets={tickets.length > 0}
      />

      {result && !isRunning && (
        <>
          <SimulationStats result={result} />
          <BankrollChart result={result} />
        </>
      )}

      {onBack && (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>
            {STRINGS.button_back}
          </Button>
        </div>
      )}
    </Container>
  );
};
