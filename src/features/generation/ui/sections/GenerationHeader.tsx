/**
 * Generation Header Section
 * Page header with back navigation
 */

import { ChevronLeft } from 'lucide-react';
import { STRINGS } from '@/shared/constants';
import type { Lottery } from '@/entities/lottery/types';

interface GenerationHeaderProps {
  lottery: Lottery;
  onBack?: () => void;
}

export const GenerationHeader: React.FC<GenerationHeaderProps> = ({
  lottery,
  onBack,
}) => {
  return (
    <header className="fixed inset-x-16 top-0 z-20 flex h-[72px] flex-col items-center justify-center">
      {onBack && (
        <div className="absolute inset-y-0 -left-8 flex items-center">
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
      <h1 className="text-center text-base font-semibold leading-tight text-gray-900 dark:text-white">
        {STRINGS.generation_title}
      </h1>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Сгенерированные билеты для {lottery.name}
      </p>
    </header>
  );
};
