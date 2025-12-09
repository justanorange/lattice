/**
 * Minimal tests for lottery selection list
 */
import { LOTTERIES_ARRAY } from "../../entities/lottery/config";
import { buildLotteryList, LOTTERY_AVAILABILITY } from "./LotterySelectionPage";

export function testLotteryListHasSixItems(): boolean {
  const list = buildLotteryList();
  console.assert(list.length === 6, "Должно быть 6 лотерей");
  return list.length === 6;
}

export function testLotteryAvailabilityFlags(): boolean {
  const list = buildLotteryList();
  const activeCount = list.filter((l) => l.available).length;
  const expectedActive = Object.values(LOTTERY_AVAILABILITY).filter(Boolean).length;
  console.assert(activeCount === expectedActive, "Количество активных лотерей должно совпадать");
  return activeCount === expectedActive;
}

export function testLotteryIdsMatchConfig(): boolean {
  const list = buildLotteryList();
  const configIds = new Set(LOTTERIES_ARRAY.map((l) => l.id));
  const listedIds = new Set(list.map((l) => l.id));
  const matches = list.length === LOTTERIES_ARRAY.length && [...listedIds].every((id) => configIds.has(id));
  console.assert(matches, "Список лотерей должен совпадать с конфигом");
  return matches;
}

