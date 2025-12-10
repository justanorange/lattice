/**
 * Simulation Page
 * FSD Page layer - composes features
 */

import { SimulationFeature } from '@/features/simulation';

export interface SimulationPageProps {
  onBack?: () => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  onBack,
}) => {
  return (
    <SimulationFeature
      onBack={onBack}
    />
  );
};
