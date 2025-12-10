/**
 * Generation Page
 * FSD Page layer - composes features
 */

import { useParams, useNavigate } from 'react-router-dom';
import { GenerationFeature } from '@/features/generation';
import { useStrategyStore } from '@/entities/strategies/store';
import { buildRoute } from '@/app/router';

export const GenerationPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { selectedStrategyId, strategyParams, ticketCount } = useStrategyStore();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate(buildRoute.strategy(lotteryId));
  };

  return (
    <GenerationFeature
      strategyId={selectedStrategyId}
      strategyParams={strategyParams}
      ticketCount={ticketCount}
      onBack={handleBack}
    />
  );
};
