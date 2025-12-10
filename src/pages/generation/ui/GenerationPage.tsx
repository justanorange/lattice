/**
 * Generation Page
 * FSD Page layer - composes features
 */

import { GenerationFeature } from '@/features/generation';

export interface GenerationPageProps {
  strategyId?: string;
  strategyParams?: Record<string, unknown>;
  ticketCount?: number;
  onBack?: () => void;
}

export const GenerationPage: React.FC<GenerationPageProps> = ({
  strategyId,
  strategyParams,
  ticketCount,
  onBack,
}) => {
  return (
    <GenerationFeature
      strategyId={strategyId}
      strategyParams={strategyParams}
      ticketCount={ticketCount}
      onBack={onBack}
    />
  );
};
