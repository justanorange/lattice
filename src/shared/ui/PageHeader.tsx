/**
 * PageHeader Component
 * Reusable page header with back navigation
 * Used by pages to provide consistent layout
 */

import { ChevronLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
}) => {
  return (
    <header className="fixed inset-x-16 top-0 z-20 flex h-[72px] flex-col items-center justify-center">
      {onBack && (
        <div className="absolute inset-y-0 -left-12 flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 transition-colors active:scale-95 dark:text-gray-400"
            aria-label="Назад"
          >
            <ChevronLeft className="size-7" />
          </button>
        </div>
      )}
      <h1 className="text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="text-center text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </header>
  );
};
