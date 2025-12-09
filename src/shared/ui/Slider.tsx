/**
 * Slider Component (shadcn/ui style)
 * Range input for numeric values
 */

import * as React from "react";
import { cn } from "../lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helper?: string;
}

/**
 * Slider component for numeric input
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      helper,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(e.target.value);
      onValueChange?.(newValue);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value ?? min}
            onChange={handleChange}
            className={cn(
              "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer",
              "accent-amber-500 hover:accent-amber-600",
              "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
              className
            )}
            {...props}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-right">
            {value ?? min}
          </span>
        </div>
        {helper && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

