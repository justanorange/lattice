/**
 * Strategy Selection Page
 * FSD Page layer - owns layout, header, navigation
 */

import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, PageHeader, Button } from '@/shared/ui';
import { useStrategySelection } from '@/features/strategy-selection/model';
import {
  StrategyList,
  StrategyParameters,
  CalculationResult,
  ProbabilityTable,
} from '@/features/strategy-selection/ui/sections';
import { useStrategyStore } from '@/entities/strategies/store';
import { useLotteryStore } from '@/entities/lottery/store';
import { buildRoute } from '@/app/router';

export const StrategySelectionPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { setStrategy } = useStrategyStore();
  const { selectedLottery } = useLotteryStore();
  const parametersRef = useRef<HTMLDivElement>(null);

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const {
    lottery,
    ticketCost,
    prizeTable,
    superprice,
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

  const handleBack = () => navigate(buildRoute.lotteryDetail(lotteryId));

  const handleGenerate = () => {
    if (selectedStrategy) {
      setStrategy(selectedStrategy.id, params, effectiveTicketCount);
      navigate(buildRoute.generation(lotteryId));
    }
  };

  const handleStrategySelect = (strategyId: string) => {
    selectStrategy(strategyId);
    // Scroll to parameters section after selection
    setTimeout(() => {
      parametersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <Container>
      <PageHeader
        title="Выберите стратегию"
        subtitle={`для ${selectedLottery.name}`}
        onBack={handleBack}
      />

      <StrategyList
        strategies={strategies}
        selectedId={selectedStrategyId}
        onSelect={handleStrategySelect}
      />

      {selectedStrategy && (
        <>
          <div ref={parametersRef}>
            <StrategyParameters
              strategy={selectedStrategy}
              params={params}
              onParamChange={updateParam}
            />
          </div>

          <CalculationResult
            calculatedTicketCount={calculatedTicketCount}
            effectiveTicketCount={effectiveTicketCount}
            effectiveBudget={effectiveBudget}
            ticketCost={ticketCost}
            customTicketCount={customTicketCount}
            onTicketCountChange={setCustomTicketCount}
            onBudgetChange={setBudget}
          />

          <ProbabilityTable
            lottery={lottery}
            prizeTable={prizeTable}
            ticketCount={effectiveTicketCount}
            superprice={superprice}
          />

          <div className="mb-6">
            <Button onClick={handleGenerate} variant="primary" className="w-full">
              Сгенерировать билеты
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};
