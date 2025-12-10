/**
 * useDebounce Hook
 * Debounce values and functions
 */

import { useState, useEffect } from 'react';
import { debounce as debounceUtil } from '@/shared/utils';

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to debounce a callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  return debounceUtil(callback, delay);
}
