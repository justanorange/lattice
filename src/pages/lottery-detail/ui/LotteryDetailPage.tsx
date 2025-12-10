/**
 * Lottery Detail Page
 * FSD Page layer - composes features and widgets
 */

import { LotteryDetailFeature } from '@/features/lottery-detail';

export interface LotteryDetailPageProps {
  lotteryId: string;
  onNext?: () => void;
  onBack?: () => void;
}

export const LotteryDetailPage: React.FC<LotteryDetailPageProps> = ({
  lotteryId,
  onNext,
  onBack,
}) => {
  return (
    <LotteryDetailFeature
      lotteryId={lotteryId}
      onNext={onNext}
      onBack={onBack}
    />
  );
};
