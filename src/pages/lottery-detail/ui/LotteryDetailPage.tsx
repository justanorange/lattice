/**
 * Lottery Detail Page
 * FSD Page layer - composes features and widgets
 */

import { useParams, useNavigate } from 'react-router-dom';
import { LotteryDetailFeature } from '@/features/lottery-detail';
import { buildRoute } from '@/app/router';

export const LotteryDetailPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();

  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const handleNext = () => {
    navigate(buildRoute.strategy(lotteryId));
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <LotteryDetailFeature
      lotteryId={lotteryId}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};
