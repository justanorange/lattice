/**
 * Combinatorics Tests
 */

import { combinations, unique, intersection } from './combinatorics';

export function testCombinations(): void {
  console.log('Testing: Combinations');
  const combs = combinations([1, 2, 3, 4], 2);
  console.assert(combs.length === 6);
  console.log('✓ Combinations correct');
}

export function testUnique(): void {
  console.log('Testing: Unique');
  const u = unique([1, 2, 2, 3, 3, 3]);
  console.assert(u.length === 3);
  console.log('✓ Unique correct');
}

export function testIntersection(): void {
  console.log('Testing: Intersection');
  const inter = intersection([1, 2, 3, 4], [3, 4, 5, 6]);
  console.assert(inter.includes(3) && inter.includes(4));
  console.log('✓ Intersection correct');
}

export function runAllCombinatoricsTests(): void {
  console.log('\n=== Combinatorics Tests ===\n');
  testCombinations();
  testUnique();
  testIntersection();
  console.log('\n=== Done ===\n');
}
