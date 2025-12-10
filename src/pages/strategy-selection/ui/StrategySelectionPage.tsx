/**
 * Strategy Selection Page
 * FSD Page layer - composes features
 */

import { useParams, useNavigate } from 'react-router-dom';
import { StrategySelectionFeature } from '@/features/strategy-selection';
import { useStrategyStore } from '@/entities/strategies/store';
import { buildRoute } from '@/app/router';

export const StrategySelectionPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { setStrategy } = useStrategyStore();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const handleNext = (
    strategyId: string,
    params: Record<string, unknown>,
    ticketCount: number
  ) => {
    setStrategy(strategyId, params, ticketCount);
    navigate(buildRoute.generation(lotteryId));
  };

  const handleBack = () => {
    navigate(buildRoute.lotteryDetail(lotteryId));
  };

  return (
    <StrategySelectionFeature
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};
