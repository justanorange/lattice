/**
 * Combinatorics Utilities
 * Generate and analyze combinations and permutations
 */

/**
 * Generate all combinations of k elements from array of n elements
 * C(n, k) = all unique k-sized subsets
 *
 * @param elements - Array of elements
 * @param k - Size of combinations
 * @returns Array of combinations
 */
export function combinations<T>(
  elements: T[],
  k: number
): T[][] {
  if (k === 0) return [[]];
  if (k > elements.length) return [];
  if (k === 1) return elements.map((e) => [e]);

  const result: T[][] = [];

  function generate(
    start: number,
    current: T[]
  ): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < elements.length; i++) {
      current.push(elements[i]);
      generate(i + 1, current);
      current.pop();
    }
  }

  generate(0, []);
  return result;
}

/**
 * Generate all permutations of array
 * P(n) = all unique orderings
 *
 * @param elements - Array of elements
 * @returns Array of permutations
 */
export function permutations<T>(
  elements: T[]
): T[][] {
  if (elements.length <= 1) return [elements];

  const result: T[][] = [];

  function generate(arr: T[]): void {
    if (arr.length <= 1) {
      result.push([...arr]);
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingCount = result.length;

      generate(remaining);

      // Add current element to the beginning of all new permutations
      for (let j = remainingCount; j < result.length; j++) {
        result[j] = [current, ...result[j]];
      }
    }
  }

  generate(elements);
  return result;
}

/**
 * Generate all n-permutations of r elements
 * P(n, r) = ordered selections
 *
 * @param elements - Array of elements
 * @param r - Size of permutations
 * @returns Array of r-permutations
 */
export function permutationsOfSize<T>(
  elements: T[],
  r: number
): T[][] {
  if (r === 0) return [[]];
  if (r > elements.length) return [];

  const result: T[][] = [];

  function generate(
    available: T[],
    current: T[]
  ): void {
    if (current.length === r) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < available.length; i++) {
      const element = available[i];
      const remaining = available
        .slice(0, i)
        .concat(available.slice(i + 1));

      generate(remaining, [...current, element]);
    }
  }

  generate(elements, []);
  return result;
}

/**
 * Generate cartesian product of multiple arrays
 * Result contains all combinations of one element from each array
 *
 * @param arrays - Array of arrays
 * @returns Cartesian product
 */
export function cartesianProduct<T>(
  arrays: T[][]
): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((e) => [e]);

  const result: T[][] = [];

  function generate(
    index: number,
    current: T[]
  ): void {
    if (index === arrays.length) {
      result.push([...current]);
      return;
    }

    for (const element of arrays[index]) {
      current.push(element);
      generate(index + 1, current);
      current.pop();
    }
  }

  generate(0, []);
  return result;
}

/**
 * Generate combinations with replacement
 * Elements can be repeated
 *
 * @param elements - Array of elements
 * @param k - Size of combinations
 * @returns Array of combinations with replacement
 */
export function combinationsWithReplacement<T>(
  elements: T[],
  k: number
): T[][] {
  if (k === 0) return [[]];
  if (elements.length === 0) return [];

  const result: T[][] = [];

  function generate(
    start: number,
    current: T[]
  ): void {
    if (current.length === k) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < elements.length; i++) {
      current.push(elements[i]);
      generate(i, current); // i, not i + 1 - allows repetition
      current.pop();
    }
  }

  generate(0, []);
  return result;
}

/**
 * Shuffle array randomly (Fisher-Yates)
 *
 * @param array - Array to shuffle
 * @returns Shuffled array (new instance)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Get random sample of k elements from array
 *
 * @param array - Array to sample from
 * @param k - Sample size
 * @returns Random sample
 */
export function randomSample<T>(
  array: T[],
  k: number
): T[] {
  if (k > array.length) return [];

  const shuffled = shuffle(array);
  return shuffled.slice(0, k);
}

/**
 * Generate unique random numbers in range
 *
 * @param min - Minimum (inclusive)
 * @param max - Maximum (inclusive)
 * @param count - How many to generate
 * @returns Array of unique random numbers
 */
export function uniqueRandomNumbers(
  min: number,
  max: number,
  count: number
): number[] {
  if (count > max - min + 1) {
    return [];
  }

  const numbers = Array.from(
    { length: max - min + 1 },
    (_, i) => min + i
  );

  return randomSample(numbers, count);
}

/**
 * Partition array into groups
 *
 * @param array - Array to partition
 * @param groupSize - Size of each group
 * @returns Array of groups
 */
export function partition<T>(
  array: T[],
  groupSize: number
): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += groupSize) {
    result.push(array.slice(i, i + groupSize));
  }

  return result;
}

/**
 * Flatten nested array one level
 *
 * @param array - Nested array
 * @returns Flattened array
 */
export function flatten<T>(array: T[][]): T[] {
  return array.reduce((acc, val) => acc.concat(val), []);
}

/**
 * Get unique elements from array
 *
 * @param array - Array
 * @returns Array with unique elements only
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Get intersection of two arrays
 *
 * @param a - First array
 * @param b - Second array
 * @returns Elements in both arrays
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return unique(a.filter((x) => setB.has(x)));
}

/**
 * Get difference of two arrays (a - b)
 *
 * @param a - First array
 * @param b - Second array
 * @returns Elements in a but not in b
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return unique(a.filter((x) => !setB.has(x)));
}

/**
 * Get union of two arrays
 *
 * @param a - First array
 * @param b - Second array
 * @returns All unique elements from both arrays
 */
export function union<T>(a: T[], b: T[]): T[] {
  return unique([...a, ...b]);
}

/**
 * Check if one array is subset of another
 *
 * @param subset - Potential subset
 * @param superset - Potential superset
 * @returns true if all elements of subset are in superset
 */
export function isSubset<T>(subset: T[], superset: T[]): boolean {
  const set = new Set(superset);
  return subset.every((x) => set.has(x));
}

