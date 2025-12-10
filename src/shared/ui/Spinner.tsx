/**
 * Loading Spinner Component (shadcn/ui style)
 * Display loading state
 */

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export type { SpinnerProps };

const sizeClasses = {
  sm: 'size-4',
  md: 'size-8',
  lg: 'size-12',
};

/**
 * Loading spinner component
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2',
          'border-gray-300 dark:border-gray-600',
          'border-t-amber-500 dark:border-t-amber-600',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
