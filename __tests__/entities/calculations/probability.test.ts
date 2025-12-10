/**
 * Probability Tests
 * Validates probability calculation functions
 */

import {
  binomial,
  factorial,
  probabilityOfMatch,
  totalCombinations,
  twoFieldCombinations,
  odds,
  cumulativeProbability,
  expectedValuePerTicket,
  probabilityDistribution,
  multiTicketProbability,
  ticketsForProbability,
} from '@/entities/calculations/probability';

/**
 * Test binomial coefficient calculation
 */
export function testBinomial(): void {
  console.log('Testing: Binomial coefficients');

  // C(6, 3) = 20
  console.assert(binomial(6, 3) === 20);
  // C(49, 7) = 85900584
  console.assert(binomial(49, 7) === 85900584);
  // C(n, 0) = 1
  console.assert(binomial(10, 0) === 1);
  // C(n, n) = 1
  console.assert(binomial(10, 10) === 1);
  // C(n, k) where k > n = 0
  console.assert(binomial(5, 10) === 0);

  console.log('✓ Binomial coefficients correct');
}

/**
 * Test factorial calculation
 */
export function testFactorial(): void {
  console.log('Testing: Factorial calculation');

  console.assert(factorial(0) === 1);
  console.assert(factorial(1) === 1);
  console.assert(factorial(5) === 120);
  console.assert(factorial(10) === 3628800);

  console.log('✓ Factorial calculation correct');
}

/**
 * Test probability of match
 */
export function testProbabilityOfMatch(): void {
  console.log('Testing: Probability of match');

  // 6 from 45: probability of matching exactly 3
  const prob = probabilityOfMatch(45, 6, 6, 3);
  console.assert(prob > 0 && prob < 1);

  // Matching all selected numbers should be rare
  const allMatch = probabilityOfMatch(45, 6, 6, 6);
  console.assert(allMatch < 0.01);

  console.log('✓ Probability of match correct');
}

/**
 * Test total combinations
 */
export function testTotalCombinations(): void {
  console.log('Testing: Total combinations');

  // C(45, 6) should be large
  const total = totalCombinations(45, 6);
  console.assert(total > 1000000);

  // 6 from 45 is 8145060
  console.assert(totalCombinations(45, 6) === 8145060);

  console.log('✓ Total combinations correct');
}

/**
 * Test two-field combinations
 */
export function testTwoFieldCombinations(): void {
  console.log('Testing: Two-field combinations');

  // 8 from 20 + 1 from 4
  const total = twoFieldCombinations(20, 8, 4, 1);
  const expected = binomial(20, 8) * binomial(4, 1);
  console.assert(total === expected);

  console.log('✓ Two-field combinations correct');
}

/**
 * Test odds calculation
 */
export function testOdds(): void {
  console.log('Testing: Odds calculation');

  // 1/2 probability = odds of 2 (1 in 2)
  console.assert(odds(0.5) === 2);

  // 1/1000000 probability = odds of 1000000
  const oddsValue = odds(0.000001);
  console.assert(oddsValue > 900000 && oddsValue < 1100000);

  console.log('✓ Odds calculation correct');
}

/**
 * Test cumulative probability
 */
export function testCumulativeProbability(): void {
  console.log('Testing: Cumulative probability');

  // P(X >= 0) should be 1.0
  const cum = cumulativeProbability(45, 6, 6, 0);
  console.assert(cum > 0.99 && cum <= 1.0);

  // P(X >= 7) for 6 selected should be 0
  const cum2 = cumulativeProbability(45, 6, 6, 7);
  console.assert(cum2 === 0);

  console.log('✓ Cumulative probability correct');
}

/**
 * Test expected value calculation
 */
export function testExpectedValuePerTicket(): void {
  console.log('Testing: Expected value per ticket');

  const prizes: Record<number, number> = {
    6: 1000000,
    5: 10000,
    4: 1000,
  };

  const ev = expectedValuePerTicket(prizes, 100, 45, 6, 6);
  
  // EV should be negative (house edge)
  console.assert(ev < 0);

  console.log('✓ Expected value per ticket correct');
}

/**
 * Test probability distribution
 */
export function testProbabilityDistribution(): void {
  console.log('Testing: Probability distribution');

  const dist = probabilityDistribution(45, 6, 6);
  
  // Should have entries from 0 to 6 matches
  console.assert(Object.keys(dist).length <= 7);
  
  // Sum of probabilities should be ~1.0
  const sum = Object.values(dist).reduce((a, b) => a + b, 0);
  console.assert(sum > 0.99 && sum <= 1.01);

  console.log('✓ Probability distribution correct');
}

/**
 * Test multi-ticket probability
 */
export function testMultiTicketProbability(): void {
  console.log('Testing: Multi-ticket probability');

  // Single 50% chance ticket
  const prob1 = multiTicketProbability(0.5, 1);
  console.assert(Math.abs(prob1 - 0.5) < 0.01);

  // Two 50% chance tickets
  const prob2 = multiTicketProbability(0.5, 2);
  console.assert(Math.abs(prob2 - 0.75) < 0.01);

  // Probability increases with tickets
  console.assert(prob2 > prob1);

  console.log('✓ Multi-ticket probability correct');
}

/**
 * Test tickets for probability
 */
export function testTicketsForProbability(): void {
  console.log('Testing: Tickets for target probability');

  // Need 1 ticket for 50% single-ticket probability to reach 50%
  const tickets1 = ticketsForProbability(0.5, 0.5);
  console.assert(tickets1 === 1);

  // Need more tickets for higher target
  const tickets2 = ticketsForProbability(0.1, 0.5);
  console.assert(tickets2 > 1);

  console.log('✓ Tickets for probability correct');
}

/**
 * Run all probability tests
 */
export function runAllProbabilityTests(): void {
  console.log('\n=== Running Probability Tests ===\n');

  testBinomial();
  testFactorial();
  testProbabilityOfMatch();
  testTotalCombinations();
  testTwoFieldCombinations();
  testOdds();
  testCumulativeProbability();
  testExpectedValuePerTicket();
  testProbabilityDistribution();
  testMultiTicketProbability();
  testTicketsForProbability();

  console.log('\n=== Probability Tests Complete ===\n');
}
