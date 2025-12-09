/**
 * Slider Component (shadcn/ui style)
 * Range slider using Radix UI - Controlled Component
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
 * Controlled component that updates value in real-time
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
    // Keep track of internal state for controlled component
    const [internalValue, setInternalValue] = React.useState<number[]>(() => {
      if (Array.isArray(value)) {
        return value;
      }
      if (value !== undefined) {
        return [value];
      }
      return [min];
    });

    // Update internal state when external value changes
    React.useEffect(() => {
      if (Array.isArray(value)) {
        setInternalValue(value);
      } else if (value !== undefined) {
        setInternalValue([value]);
      }
    }, [value]);

    // Normalize value to array for display
    const displayValue = Array.isArray(value)
      ? value
      : value !== undefined
        ? [value]
        : internalValue;

    const handleValueChange = (newValue: number[]) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

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
            value={displayValue}
            onValueChange={handleValueChange}
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
                "shadow-md transition-shadow cursor-pointer hover:shadow-lg",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                "dark:focus-visible:ring-offset-gray-950",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            />
          </SliderPrimitive.Root>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-12 text-right">
            {displayValue[0]}
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

