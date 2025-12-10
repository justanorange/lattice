/**
 * Lottery Detail Header Section
 * Title and back navigation
 */

import { ChevronLeft } from 'lucide-react';
import type { Lottery } from '@/entities/lottery/types';

interface DetailHeaderProps {
  lottery: Lottery;
  onBack?: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({ lottery, onBack }) => {
  return (
    <header
      className="
        fixed inset-x-16 top-0 z-20
        h-[72px]
        flex flex-col items-center justify-center
      "
    >
      {onBack && (
        <div className="absolute inset-y-0 -left-8 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="
              flex items-center gap-2
              text-gray-500 dark:text-gray-400
              transition-colors active:scale-95
            "
            aria-label="Go back"
          >
            <ChevronLeft className="size-7" />
          </button>
        </div>
      )}
      <h1 className="text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
        {lottery.name}
      </h1>
      <p className="text-center text-base text-gray-600 dark:text-gray-400">
        {lottery.description}
      </p>
    </header>
  );
};
