/**
 * Input Component
 * Text input with consistent styling
 */

import React from 'react';

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
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-xl border
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-600
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helper && !error && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
