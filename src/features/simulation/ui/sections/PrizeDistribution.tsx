/**
 * Prize Distribution Section
 * Shows statistics by prize category and superprice wins
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { Trophy, Award } from 'lucide-react';
import type { SimulationResult, PrizeTable } from '@/entities/lottery/types';

interface PrizeDistributionProps {
  result: SimulationResult;
  superprice: number;
  prizeTable: PrizeTable;
}

export const PrizeDistribution: React.FC<PrizeDistributionProps> = ({
  result,
  superprice,
  prizeTable,
}) => {
  const { prizeDistribution } = result.statistics;

  // Find superprice match pattern from prize table
  const superprizeRow = prizeTable.rows.find(row => row.prize === 'Суперприз');
  const superprizeCategory = superprizeRow?.matches.join('+');

  // Sort categories by prize table order (jackpot first)
  const sortedCategories = Object.entries(prizeDistribution)
    .filter(([, count]) => count > 0)
    .sort((a, b) => {
      // Get index in prize table (lower index = higher priority)
      const getTableIndex = (cat: string) => {
        const matches = cat.split('+').map(Number);
        return prizeTable.rows.findIndex(row => 
          row.matches.length === matches.length &&
          row.matches.every((m, i) => m === matches[i])
        );
      };
      const indexA = getTableIndex(a[0]);
      const indexB = getTableIndex(b[0]);
      // If not found in table, put at end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  // Count actual superprice wins - scan rounds for exact superprice wins
  // prizeDistribution counts by category like "8+1", but we need wins with superprice value
  let jackpotWins = 0;
  for (const round of result.rounds) {
    for (const match of round.matches) {
      if (match.prizeCategory === superprizeCategory && match.prizeWon === superprice) {
        jackpotWins++;
      }
    }
  }
  const totalSuperpriceWon = jackpotWins * superprice;

  // Calculate total winning occurrences
  const totalWinOccurrences = Object.values(prizeDistribution).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalRounds = result.roundsCount;
  const totalTickets = result.tickets.length;
  const totalTicketChecks = totalRounds * totalTickets;

  return (
    <>
      {/* Superprice Statistics */}
      <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Суперприз
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Выигрышей суперприза
              </p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {jackpotWins}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Сумма суперпризов
              </p>
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {totalSuperpriceWon.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
          {jackpotWins === 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              За {totalRounds.toLocaleString('ru-RU')} тиражей ({totalTickets} билетов × {totalRounds} тиражей) суперприз не выпал. 
              Это нормально — шанс очень мал.
            </p>
          )}
          {jackpotWins > 0 && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Повезло! Суперприз выпал {jackpotWins} раз(а) за {totalRounds.toLocaleString('ru-RU')} тиражей.
            </p>
          )}
        </CardBody>
      </Card>

      {/* Prize Distribution by Category */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="size-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Статистика по комбинациям
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Всего {totalWinOccurrences.toLocaleString('ru-RU')} выигрышных комбинаций из {totalTicketChecks.toLocaleString('ru-RU')} проверок
          </p>

          {sortedCategories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Ни одного выигрыша. Увеличьте количество тиражей или билетов.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedCategories.map(([category, count]) => {
                const percent = (count / totalTicketChecks) * 100;
                const isJackpot = category === superprizeCategory;

                return (
                  <PrizeCategoryRow
                    key={category}
                    category={category}
                    count={count}
                    percent={percent}
                    isJackpot={isJackpot}
                  />
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

interface PrizeCategoryRowProps {
  category: string;
  count: number;
  percent: number;
  isJackpot: boolean;
}

const PrizeCategoryRow: React.FC<PrizeCategoryRowProps> = ({
  category,
  count,
  percent,
  isJackpot,
}) => {
  // Cap the visual bar at 100%
  const barWidth = Math.min(percent * 5, 100); // Scale up for visibility

  return (
    <div
      className={`rounded-lg p-3 ${
        isJackpot
          ? 'bg-amber-100 dark:bg-amber-900/30'
          : 'bg-gray-50 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-sm ${
            isJackpot
              ? 'font-bold text-amber-700 dark:text-amber-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {category}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {count.toLocaleString('ru-RU')} ({percent.toFixed(4)}%)
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all ${
            isJackpot ? 'bg-amber-500' : 'bg-orange-400 dark:bg-orange-500'
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
};
