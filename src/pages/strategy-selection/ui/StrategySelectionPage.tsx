/**
 * Strategy Selection Page
 * FSD Page layer - composes features
 */

import { StrategySelectionFeature } from '@/features/strategy-selection';

export interface StrategySelectionPageProps {
  onNext?: (strategyId: string, params: Record<string, unknown>, ticketCount: number) => void;
  onBack?: () => void;
}

export const StrategySelectionPage: React.FC<StrategySelectionPageProps> = ({
  onNext,
  onBack,
}) => {
  return (
    <StrategySelectionFeature
      onNext={onNext}
      onBack={onBack}
    />
  );
};
