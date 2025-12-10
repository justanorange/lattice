/**
 * Simulation Page
 * FSD Page layer - owns layout, header, navigation
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Container, PageHeader, Button } from '@/shared/ui';
import { useSimulation } from '@/features/simulation/model';
import {
  SimulationControls,
  SimulationStats,
  BankrollChart,
  BankrollHistogram,
  PrizeDistribution,
} from '@/features/simulation/ui/sections';
import { useStrategyStore } from '@/entities/strategies/store';
import { useLotteryStore } from '@/entities/lottery/store';
import { buildRoute } from '@/app/router';

export const SimulationPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { generatedTickets } = useStrategyStore();
  const { selectedLottery, currentSuperprice, currentTicketCost } = useLotteryStore();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const {
    roundsCount,
    result,
    isRunning,
    setRoundsCount,
    runSimulation,
  } = useSimulation();

  const handleBack = () => navigate(buildRoute.generation(lotteryId));

  const handleRunSimulation = () => {
    runSimulation(generatedTickets);
  };

  return (
    <Container>
      <PageHeader
        title="Симуляция"
        subtitle={`${roundsCount} тиражей для ${selectedLottery.name}`}
        onBack={handleBack}
      />

      <SimulationControls
        roundsCount={roundsCount}
        onRoundsChange={setRoundsCount}
        onRun={handleRunSimulation}
        isRunning={isRunning}
        hasTickets={generatedTickets.length > 0}
      />

      {result && !isRunning && (
        <>
          <SimulationStats result={result} />
          <PrizeDistribution result={result} superprice={currentSuperprice} />
          <BankrollHistogram result={result} ticketCost={currentTicketCost} />
          <BankrollChart result={result} />
        </>
      )}

      <div className="mb-6 flex gap-3">
        <Button variant="secondary" onClick={handleBack} className="flex-1">
          К билетам
        </Button>
      </div>
    </Container>
  );
};
