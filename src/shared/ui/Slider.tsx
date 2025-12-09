/**
 * Slider Component (shadcn/ui style)
 * Range slider using Radix UI
 */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../lib/utils";

export interface SliderProps {
  value?: number | number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helper?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Slider component using Radix UI
 * Supports single value or range
 */
export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
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
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Normalize value to array for Radix UI
    const sliderValue = Array.isArray(value)
      ? value
      : value !== undefined
        ? [value]
        : [min];

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {label}
          </label>
        )}
        <div className="flex items-center gap-4">
          <SliderPrimitive.Root
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onValueChange={onValueChange}
            disabled={disabled}
            className={cn(
              "relative flex items-center w-full h-10 touch-none select-none",
              disabled && "opacity-50",
              className
            )}
            {...props}
          >
            <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <SliderPrimitive.Range className="absolute h-full bg-amber-500 dark:bg-amber-600" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className={cn(
                "block h-5 w-5 rounded-full border-2 border-amber-500 bg-white dark:bg-gray-800",
                "shadow-md transition-shadow",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-offset-gray-950",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            />
          </SliderPrimitive.Root>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-12 text-right">
            {sliderValue[0]}
          </span>
        </div>
        {helper && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helper}</p>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

