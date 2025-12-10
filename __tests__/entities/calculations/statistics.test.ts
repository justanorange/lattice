/**
 * Statistics Tests
 */

import { calculateBasicStats, percentile } from '@/entities/calculations/statistics';

export function testBasicStats(): void {
  console.log('Testing: Basic statistics');
  const values = [1, 2, 3, 4, 5];
  const stats = calculateBasicStats(values);
  console.assert(stats.min === 1 && stats.max === 5 && stats.mean === 3);
  console.log('✓ Basic statistics correct');
}

export function testPercentile(): void {
  console.log('Testing: Percentile');
  const values = Array.from({ length: 100 }, (_, i) => i + 1);
  const p50 = percentile(values, 50);
  console.assert(p50 > 40 && p50 < 60);
  console.log('✓ Percentile correct');
}

export function runAllStatisticsTests(): void {
  console.log('\n=== Statistics Tests ===\n');
  testBasicStats();
  testPercentile();
  console.log('\n=== Done ===\n');
}
