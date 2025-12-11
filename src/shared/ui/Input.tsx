/**
 * Input Component (shadcn/ui style)
 * Text input with consistent styling
 */

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export type { InputProps };

/**
 * Input component
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            // size → padding → border
            'w-full px-3 py-2',
            'rounded-xl border border-gray-300 dark:border-gray-600',
            // background → text
            'bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-white',
            // hover → focus → disabled
            'hover:border-gray-400 dark:hover:border-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600',
            'disabled:cursor-not-allowed disabled:bg-gray-100',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
