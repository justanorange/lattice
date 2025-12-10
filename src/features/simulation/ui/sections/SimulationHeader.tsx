/**
 * Simulation Header Section
 * Page header with back navigation
 */

import { ChevronLeft } from 'lucide-react';
import type { Lottery } from '@/entities/lottery/types';

interface SimulationHeaderProps {
  lottery: Lottery;
  roundsCount: number;
  onBack?: () => void;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({
  lottery,
  roundsCount,
  onBack,
}) => {
  return (
    <header className="relative z-20 mr-10 flex h-[72px] flex-col gap-2 p-4 pl-[72px] pr-10">
      <div className="absolute inset-0 z-20">
        {onBack && (
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 transition-colors active:scale-95 dark:text-gray-400"
              aria-label="Go back"
            >
              <ChevronLeft className="size-7" />
            </button>
          </div>
        )}
        <h1 className="text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
          Симуляция лотереи
        </h1>
        <p className="text-center text-base text-gray-600 dark:text-gray-400">
          Симуляция {roundsCount} тиражей для {lottery.name}
        </p>
      </div>
    </header>
  );
};
