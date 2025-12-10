/**
 * StrategySelectionFeature Component
 * User selects strategy and inputs parameters
 * Refactored to use section components
 */

import React from 'react';
import { Container, Button } from '@/shared/ui';
import { useStrategySelection } from '../model';
import {
  StrategyHeader,
  StrategyList,
  StrategyParameters,
  CalculationResult,
} from './sections';

export interface StrategySelectionFeatureProps {
  onNext?: (strategyId: string, params: Record<string, unknown>, ticketCount: number) => void;
  onBack?: () => void;
}

export const StrategySelectionFeature: React.FC<StrategySelectionFeatureProps> = ({
  onNext,
  onBack,
}) => {
  const {
    lottery,
    ticketCost,
    strategies,
    selectedStrategy,
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
  } = useStrategySelection();

  const handleNext = React.useCallback(() => {
    if (onNext && selectedStrategy) {
      onNext(selectedStrategy.id, params, effectiveTicketCount);
    }
  }, [onNext, selectedStrategy, params, effectiveTicketCount]);

  return (
    <Container>
      <StrategyHeader lottery={lottery} onBack={onBack} />

      <StrategyList
        strategies={strategies}
        selectedId={selectedStrategyId}
        onSelect={selectStrategy}
      />

      {selectedStrategy && (
        <>
          <StrategyParameters
            strategy={selectedStrategy}
            params={params}
            onParamChange={updateParam}
          />

          <CalculationResult
            calculatedTicketCount={calculatedTicketCount}
            effectiveTicketCount={effectiveTicketCount}
            effectiveBudget={effectiveBudget}
            ticketCost={ticketCost}
            customTicketCount={customTicketCount}
            onTicketCountChange={setCustomTicketCount}
            onBudgetChange={setBudget}
          />

          <div className="mb-6 flex gap-3">
            <Button onClick={handleNext} variant="primary" className="flex-1">
              Сгенерировать
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};
