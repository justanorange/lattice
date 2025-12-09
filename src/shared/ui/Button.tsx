/**
 * Button Component
 * Reusable button with variants
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  danger: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-2xl',
};

/**
 * Button component
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, className, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          rounded font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className || ''}
        `}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? '...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
