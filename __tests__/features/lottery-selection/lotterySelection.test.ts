/**
 * Minimal tests for lottery selection list
 */
import { LOTTERIES_ARRAY } from '@/entities/lottery/config';

export function testLotteryListHasSixItems(): boolean {
  const list = LOTTERIES_ARRAY;
  console.assert(list.length >= 1, 'Должна быть хотя бы одна лотерея');
  return list.length >= 1;
}

export function testLotteryIdsMatchConfig(): boolean {
  const list = LOTTERIES_ARRAY;
  const hasIds = list.every((l) => l.id && l.name);
  console.assert(hasIds, 'Все лотереи должны иметь id и name');
  return hasIds;
}

