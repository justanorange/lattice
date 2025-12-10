/**
 * Generation Page
 * FSD Page layer - owns layout, header, navigation
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Play } from 'lucide-react';
import { Container, PageHeader, Button, Spinner, Card, CardBody } from '@/shared/ui';
import { useGeneration } from '@/features/generation/model';
import {
  GenerationStats,
  TicketsGrid,
} from '@/features/generation/ui/sections';
import { useStrategyStore } from '@/entities/strategies/store';
import { useLotteryStore } from '@/entities/lottery/store';
import { buildRoute } from '@/app/router';
import { STRINGS } from '@/shared/constants';

export const GenerationPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { selectedStrategyId, strategyParams, ticketCount, setTickets } = useStrategyStore();
  const { selectedLottery } = useLotteryStore();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const { lottery, result, isGenerating, error } = useGeneration({
    strategyId: selectedStrategyId,
    strategyParams,
    ticketCount,
  });

  // Save generated tickets to store for simulation
  useEffect(() => {
    if (result?.tickets) {
      setTickets(result.tickets);
    }
  }, [result, setTickets]);

  const handleBack = () => navigate(buildRoute.strategy(lotteryId));
  const handleSimulate = () => navigate(buildRoute.simulation(lotteryId));

  return (
    <Container>
      <PageHeader
        title={STRINGS.generation_title}
        subtitle={`Билеты для ${selectedLottery.name}`}
        onBack={handleBack}
      />

      {isGenerating && (
        <Card className="mb-6">
          <CardBody className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400">
                Генерация билетов...
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardBody>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardBody>
        </Card>
      )}

      {result && !isGenerating && (
        <>
          <GenerationStats result={result} />
          <TicketsGrid result={result} lottery={lottery} />

          <div className="mb-6 flex gap-3">
            <Button onClick={handleSimulate} variant="primary" className="flex-1">
              <Play className="mr-2 size-4" />
              Симулировать тиражи
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};
