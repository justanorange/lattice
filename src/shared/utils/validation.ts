/**
 * Validation Utilities
 * Input validation and error handling
 */

/**
 * Validate lottery ID
 */
export function isValidLotteryId(id: string): boolean {
  const valid = ['8_20_1', '4_20_2', '12_24', '5_36_1', '6_45', '6_49'];
  return valid.includes(id);
}

/**
 * Validate strategy ID
 */
export function isValidStrategyId(id: string): boolean {
  const valid = ['min_risk', 'coverage', 'full_wheel', 'key_wheel', 'guaranteed_win', 'budget_optimizer'];
  return valid.includes(id);
}

/**
 * Validate number is in range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate array of numbers are unique
 */
export function areUnique(numbers: number[]): boolean {
  return new Set(numbers).size === numbers.length;
}

/**
 * Validate array of numbers are in range
 */
export function areInRange(numbers: number[], min: number, max: number): boolean {
  return numbers.every((n) => n >= min && n <= max);
}

/**
 * Validate ticket (array of numbers)
 */
export function isValidTicket(
  field1: number[],
  field1Max: number,
  field1Count: number,
  field2?: number[],
  field2Max?: number,
  field2Count?: number
): boolean {
  // Validate field1
  if (!Array.isArray(field1) || field1.length !== field1Count) {
    return false;
  }
  if (!areInRange(field1, 1, field1Max) || !areUnique(field1)) {
    return false;
  }

  // Validate field2 if provided
  if (field2) {
    if (!Array.isArray(field2) || field2.length !== (field2Count ?? 0)) {
      return false;
    }
    if (!field2Max) return false;
    if (!areInRange(field2, 1, field2Max) || !areUnique(field2)) {
      return false;
    }
  }

  return true;
}

/**
 * Validate budget
 */
export function isValidBudget(budget: number): boolean {
  return budget > 0 && budget <= 1000000 && Number.isFinite(budget);
}

/**
 * Validate ticket count
 */
export function isValidTicketCount(count: number): boolean {
  return Number.isInteger(count) && count >= 1 && count <= 10000;
}
