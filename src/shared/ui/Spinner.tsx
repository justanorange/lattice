/**
 * Loading Spinner Component
 * Display loading state
 */

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export type { SpinnerProps };

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * Loading spinner component
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div
      className={`
        animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600
        border-t-amber-500 dark:border-t-amber-600
        ${sizeClasses[size]}
        ${className || ''}
      `}
    />
  );
};

Spinner.displayName = 'Spinner';
