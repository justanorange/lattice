/**
 * Probability Calculations
 * Core probability functions for lottery analysis
 */

/**
 * Calculate binomial coefficient C(n, k) = n! / (k! * (n-k)!)
 * Also known as "n choose k"
 *
 * @param n - Total items
 * @param k - Items to choose
 * @returns Binomial coefficient
 */
export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n - k) k = n - k; // Optimize by using smaller k

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }

  return Math.round(result);
}

/**
 * Calculate factorial n!
 *
 * @param n - Number
 * @returns Factorial
 */
export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;

  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
}

/**
 * Calculate probability of matching exactly m numbers out of n drawn from pool of t total
 * P(m) = C(n, m) * C(t-n, total-m) / C(t, total)
 *
 * @param t - Total numbers in pool
 * @param n - Numbers selected by player
 * @param drawn - Numbers drawn in lottery
 * @param m - Numbers to match
 * @returns Probability as decimal (0-1)
 */
export function probabilityOfMatch(
  t: number,
  n: number,
  drawn: number,
  m: number
): number {
  if (m > n || m > drawn || n > t || drawn > t) {
    return 0;
  }

  const numerator =
    binomial(n, m) * binomial(t - n, drawn - m);
  const denominator = binomial(t, drawn);

  return numerator / denominator;
}

/**
 * Calculate total possible combinations for a lottery field
 * C(from, count) = "from choose count"
 *
 * @param from - Total numbers available
 * @param count - Numbers to choose
 * @returns Number of combinations
 */
export function totalCombinations(from: number, count: number): number {
  return binomial(from, count);
}

/**
 * Calculate two-field lottery combinations
 * Total = C(from1, count1) * C(from2, count2)
 *
 * @param from1 - Total numbers in field 1
 * @param count1 - Numbers to choose from field 1
 * @param from2 - Total numbers in field 2
 * @param count2 - Numbers to choose from field 2
 * @returns Total combinations
 */
export function twoFieldCombinations(
  from1: number,
  count1: number,
  from2: number,
  count2: number
): number {
  return binomial(from1, count1) * binomial(from2, count2);
}

/**
 * Calculate odds (inverse of probability)
 * Odds = 1 / probability
 *
 * @param probability - Probability (0-1)
 * @returns Odds (how many tries until expected win)
 */
export function odds(probability: number): number {
  if (probability <= 0) return Infinity;
  return 1 / probability;
}

/**
 * Calculate odds ratio for comparison
 * e.g., "1 in X" format
 *
 * @param probability - Probability (0-1)
 * @returns Denominator for "1 in X" format
 */
export function oddsFormat(probability: number): number {
  if (probability <= 0) return Infinity;
  return Math.round(1 / probability);
}

/**
 * Calculate cumulative probability of at least m matches
 * P(X >= m) = sum of P(X = k) for k = m to n
 *
 * @param t - Total numbers
 * @param n - Selected numbers
 * @param drawn - Drawn numbers
 * @param m - Minimum matches
 * @returns Cumulative probability
 */
export function cumulativeProbability(
  t: number,
  n: number,
  drawn: number,
  m: number
): number {
  let total = 0;

  for (let k = m; k <= Math.min(n, drawn); k++) {
    total += probabilityOfMatch(t, n, drawn, k);
  }

  return total;
}

/**
 * Calculate expected value of a single ticket
 * EV = sum(prize * probability) - ticket_cost
 *
 * @param prizesByMatches - Object mapping match count to prize amount
 * @param ticketCost - Cost of ticket
 * @param t - Total numbers
 * @param n - Selected numbers
 * @param drawn - Drawn numbers
 * @returns Expected value in rubles
 */
export function expectedValuePerTicket(
  prizesByMatches: Record<number, number>,
  ticketCost: number,
  t: number,
  n: number,
  drawn: number
): number {
  let ev = 0;

  for (const matchStr in prizesByMatches) {
    const m = parseInt(matchStr);
    const prize = prizesByMatches[m];
    const prob = probabilityOfMatch(t, n, drawn, m);

    ev += prize * prob;
  }

  ev -= ticketCost;
  return ev;
}

/**
 * Calculate probability distribution for all possible match counts
 * Returns object with match count as key, probability as value
 *
 * @param t - Total numbers
 * @param n - Selected numbers
 * @param drawn - Drawn numbers
 * @returns Object with match -> probability mapping
 */
export function probabilityDistribution(
  t: number,
  n: number,
  drawn: number
): Record<number, number> {
  const distribution: Record<number, number> = {};

  const maxMatches = Math.min(n, drawn);
  for (let m = 0; m <= maxMatches; m++) {
    distribution[m] = probabilityOfMatch(t, n, drawn, m);
  }

  return distribution;
}

/**
 * Calculate probability of at least one win across multiple tickets
 * P(at least 1 win) = 1 - (1 - p)^n
 *
 * @param singleTicketProbability - Probability of win on single ticket
 * @param ticketCount - Number of tickets
 * @returns Probability of at least one win
 */
export function multiTicketProbability(
  singleTicketProbability: number,
  ticketCount: number
): number {
  return 1 - Math.pow(1 - singleTicketProbability, ticketCount);
}

/**
 * Calculate how many tickets needed for given probability of win
 * n = log(1 - P) / log(1 - p)
 *
 * @param singleTicketProbability - Probability on single ticket
 * @param targetProbability - Target overall probability (0-1)
 * @returns Number of tickets needed
 */
export function ticketsForProbability(
  singleTicketProbability: number,
  targetProbability: number
): number {
  if (singleTicketProbability <= 0 || targetProbability >= 1) {
    return Infinity;
  }

  const numerator = Math.log(1 - targetProbability);
  const denominator = Math.log(1 - singleTicketProbability);

  return Math.ceil(numerator / denominator);
}
