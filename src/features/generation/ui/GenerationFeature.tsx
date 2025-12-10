/**
 * GenerationFeature Component
 * Display generated tickets from strategy execution
 * Refactored to use section components
 */

import React from 'react';
import { Container } from '@/shared/ui';
import { useGeneration } from '../model';
import {
  GenerationHeader,
  GenerationLoading,
  GenerationError,
  GenerationStats,
  TicketsGrid,
} from './sections';

export interface GenerationFeatureProps {
  strategyId?: string;
  strategyParams?: Record<string, unknown>;
  ticketCount?: number;
  onBack?: () => void;
}

/**
 * Generation Feature Component
 * Shows generated tickets from strategy execution
 */
export const GenerationFeature: React.FC<GenerationFeatureProps> = ({
  strategyId = 'max_coverage',
  strategyParams = { budget: 1000 },
  ticketCount = 10,
  onBack,
}) => {
  const { lottery, result, isGenerating, error } = useGeneration({
    strategyId,
    strategyParams,
    ticketCount,
  });

  return (
    <Container>
      <GenerationHeader lottery={lottery} onBack={onBack} />

      {isGenerating && <GenerationLoading />}

      {error && <GenerationError error={error} />}

      {result && !isGenerating && (
        <>
          <GenerationStats result={result} />
          <TicketsGrid result={result} lottery={lottery} />
        </>
      )}
    </Container>
  );
};
