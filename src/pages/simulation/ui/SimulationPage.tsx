/**
 * Simulation Page
 * FSD Page layer - composes features
 */

import { useParams, useNavigate } from 'react-router-dom';
import { SimulationFeature } from '@/features/simulation';
import { useStrategyStore } from '@/entities/strategies/store';
import { buildRoute } from '@/app/router';

export const SimulationPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();
  const { generatedTickets } = useStrategyStore();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate(buildRoute.generation(lotteryId));
  };

  return (
    <SimulationFeature
      tickets={generatedTickets}
      onBack={handleBack}
    />
  );
};
