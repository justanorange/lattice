/**
 * Probability Table Section
 * Shows adjusted probabilities for different match categories based on ticket count
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { multiTicketProbability, probabilityOfMatch } from '@/entities/calculations/probability';
import type { Lottery, PrizeTable, PrizeRow } from '@/entities/lottery/types';

interface ProbabilityTableProps {
  lottery: Lottery;
  prizeTable: PrizeTable;
  ticketCount: number;
  superprice: number;
}

/**
 * Calculate probability for a prize row based on lottery configuration
 */
function calculateRowProbability(lottery: Lottery, row: PrizeRow): number {
  if (lottery.fieldCount === 1) {
    const field = lottery.fields[0];
    return probabilityOfMatch(
      field.from,
      field.count,
      field.count,
      row.matches[0]
    );
  } else if (lottery.fieldCount === 2 && row.matches.length === 2) {
    const field1 = lottery.fields[0];
    const field2 = lottery.fields[1];

    const prob1 = probabilityOfMatch(
      field1.from,
      field1.count,
      field1.count,
      row.matches[0]
    );
    const prob2 = probabilityOfMatch(
      field2.from,
      field2.count,
      field2.count,
      row.matches[1]
    );

    return prob1 * prob2;
  }
  return 0;
}

/**
 * Format probability as percentage or "1 in X"
 */
function formatProbability(prob: number): string {
  if (prob === 0) return '0%';
  if (prob >= 0.01) {
    return `${(prob * 100).toFixed(2)}%`;
  } else if (prob >= 0.0001) {
    return `${(prob * 100).toFixed(4)}%`;
  } else {
    const odds = Math.round(1 / prob);
    return `1 из ${odds.toLocaleString('ru-RU')}`;
  }
}

/**
 * Format prize value for display
 */
function formatPrize(row: PrizeRow, superprice: number): string {
  if (row.prize === 'Суперприз') {
    return `${(superprice / 1_000_000).toFixed(0)} млн ₽`;
  } else if (row.prize === 'Приз') {
    return 'Приз';
  } else if (typeof row.prize === 'number') {
    return `${row.prize.toLocaleString('ru-RU')} ₽`;
  } else if (row.prizePercent !== undefined) {
    return `${row.prizePercent}% фонда`;
  }
  return '-';
}

/**
 * Format match pattern like "8+1", "5+0", etc.
 */
function formatMatches(matches: number[]): string {
  return matches.join('+');
}

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({
  lottery,
  prizeTable,
  ticketCount,
  superprice,
}) => {
  // Filter to only winning rows (rows with prizes)
  const winningRows = prizeTable.rows.filter(
    (row) => row.prize !== undefined || row.prizePercent !== undefined
  );

  if (winningRows.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Таблица вероятностей
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Шансы выиграть хотя бы один раз при покупке {ticketCount} билет(ов)
        </p>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  Совпадения
                </th>
                <th className="pb-2 text-right font-medium text-gray-600 dark:text-gray-400">
                  Приз
                </th>
                <th className="pb-2 text-right font-medium text-gray-600 dark:text-gray-400">
                  P (1 билет)
                </th>
                <th className="pb-2 text-right font-medium text-gray-600 dark:text-gray-400">
                  P ({ticketCount} билет{ticketCount > 1 ? 'ов' : ''})
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {winningRows.map((row, index) => {
                const singleProb = calculateRowProbability(lottery, row);
                const multiProb = multiTicketProbability(singleProb, ticketCount);

                return (
                  <ProbabilityRow
                    key={index}
                    matches={formatMatches(row.matches)}
                    prize={formatPrize(row, superprice)}
                    singleProbability={formatProbability(singleProb)}
                    multiProbability={formatProbability(multiProb)}
                    isJackpot={row.prize === 'Суперприз'}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};

interface ProbabilityRowProps {
  matches: string;
  prize: string;
  singleProbability: string;
  multiProbability: string;
  isJackpot?: boolean;
}

const ProbabilityRow: React.FC<ProbabilityRowProps> = ({
  matches,
  prize,
  singleProbability,
  multiProbability,
  isJackpot,
}) => (
  <tr className={isJackpot ? 'bg-amber-50 dark:bg-amber-900/20' : ''}>
    <td className="py-2 text-left font-mono text-gray-900 dark:text-white">
      {matches}
    </td>
    <td className={`py-2 text-right ${isJackpot ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
      {prize}
    </td>
    <td className="py-2 text-right text-gray-500 dark:text-gray-400">
      {singleProbability}
    </td>
    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
      {multiProbability}
    </td>
  </tr>
);
