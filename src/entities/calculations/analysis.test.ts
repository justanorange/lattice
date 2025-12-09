/**
 * Analysis Tests
 */

import { compareEV, analyzeProfitability } from './analysis';

export function testCompareEV(): void {
  console.log('Testing: EV comparison');
  const result = compareEV(10, 5);
  console.assert(result.better === 1 && result.evDifference === 5);
  console.log('✓ EV comparison correct');
}

export function testAnalyzeProfitability(): void {
  console.log('Testing: Profitability analysis');
  const prof = analyzeProfitability(50, 100);
  console.assert(prof.isProfitable === true);
  console.log('✓ Profitability analysis correct');
}

export function runAllAnalysisTests(): void {
  console.log('\n=== Analysis Tests ===\n');
  testCompareEV();
  testAnalyzeProfitability();
  console.log('\n=== Done ===\n');
}
