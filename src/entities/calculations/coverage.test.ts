/**
 * Coverage Tests
 */

import { combinationsCovered, ticketOverlap } from './coverage';

export function testCombinationsCovered(): void {
  console.log('Testing: Combinations covered');
  const covered = combinationsCovered(45, 6, 3);
  console.assert(covered > 0);
  console.log('✓ Combinations covered correct');
}

export function testTicketOverlap(): void {
  console.log('Testing: Ticket overlap');
  const overlap = ticketOverlap([1, 2, 3, 4, 5, 6], [4, 5, 6, 7, 8, 9]);
  console.assert(overlap === 3);
  console.log('✓ Ticket overlap correct');
}

export function runAllCoverageTests(): void {
  console.log('\n=== Coverage Tests ===\n');
  testCombinationsCovered();
  testTicketOverlap();
  console.log('\n=== Done ===\n');
}
