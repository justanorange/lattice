/**
 * Prize Table Section
 * Editable prize table with probabilities
 */

import { RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input } from '@/shared/ui';
import { STRINGS } from '@/shared/constants';
import { probabilityOfMatch } from '@/entities/calculations/probability';
import { getCombinedSymmetricDisplay } from '@/entities/lottery/utils';
import type { Lottery, PrizeTable, PrizeRow } from '@/entities/lottery/types';

interface PrizeTableSectionProps {
  lottery: Lottery;
  prizeTable: PrizeTable;
  superprice: number;
  secondaryPrize?: number;
  averagePool?: number;
  ticketCost: number;
  onUpdateRow: (index: number, row: PrizeRow) => void;
  onReset: () => void;
}

/**
 * Calculate probability for a prize row
 * For symmetric lotteries (4из20), includes both [a,b] and [b,a] combinations
 */
function calculateRowProbability(lottery: Lottery, row: PrizeRow): number {
  if (lottery.fieldCount === 1) {
    const field = lottery.fields[0];
    let prob = probabilityOfMatch(field.from, field.count, field.count, row.matches[0]);
    
    // For 12/24: complement symmetry (X matches = 12-X matches)
    if (lottery.id === 'lottery_12_24') {
      const complement = field.count - row.matches[0];
      if (complement !== row.matches[0]) {
        prob += probabilityOfMatch(field.from, field.count, field.count, complement);
      }
    }
    return prob;
  }

  if (lottery.fieldCount === 2 && row.matches.length === 2) {
    const field1 = lottery.fields[0];
    const field2 = lottery.fields[1];
    const [m1, m2] = row.matches;
    
    const prob1 = probabilityOfMatch(field1.from, field1.count, field1.count, m1);
    const prob2 = probabilityOfMatch(field2.from, field2.count, field2.count, m2);
    let prob = prob1 * prob2;
    
    // For symmetric 2-field lotteries (4из20): [a,b] and [b,a] win same prize
    if (lottery.id === 'lottery_4_20' && m1 !== m2) {
      const prob1Swap = probabilityOfMatch(field1.from, field1.count, field1.count, m2);
      const prob2Swap = probabilityOfMatch(field2.from, field2.count, field2.count, m1);
      prob += prob1Swap * prob2Swap;
    }
    
    return prob;
  }

  return 0;
}

/**
 * Format probability as "1:N"
 */
function formatProbability(probability: number): { text: string; tooltip: string } | null {
  if (probability <= 0) return null;
  const oneIn = Math.round(1 / probability);
  const percent = (probability * 100).toFixed(4);
  return { text: `1:${oneIn.toLocaleString()}`, tooltip: `${percent}%` };
}

export const PrizeTableSection: React.FC<PrizeTableSectionProps> = ({
  lottery,
  prizeTable,
  superprice,
  secondaryPrize,
  averagePool,
  ticketCost,
  onUpdateRow,
  onReset,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {STRINGS.detail_prize_table}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            aria-label="Сбросить к умолчаниям"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-tighter text-gray-700 dark:text-gray-300">
                  Совп.
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-tighter text-gray-700 dark:text-gray-300">
                  Вероятн.
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-tighter text-gray-700 dark:text-gray-300">
                  Приз
                </th>
              </tr>
            </thead>
            <tbody>
              {getCombinedSymmetricDisplay(prizeTable.rows, lottery.id).map(
                ({ row, displayLabel }, index) => (
                  <PrizeTableRow
                    key={index}
                    row={row}
                    displayLabel={displayLabel}
                    index={index}
                    lottery={lottery}
                    superprice={superprice}
                    secondaryPrize={secondaryPrize}
                    averagePool={averagePool}
                    ticketCost={ticketCost}
                    onUpdate={onUpdateRow}
                  />
                )
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Примечание: Суперприз и специальные призы редактируются отдельно.
          Числовые призы можно редактировать напрямую в таблице.
          Вероятность показана в формате 1:N (один выигрыш на N попыток).
        </p>
      </CardBody>
    </Card>
  );
};

interface PrizeTableRowProps {
  row: PrizeRow;
  displayLabel: string;
  index: number;
  lottery: Lottery;
  superprice: number;
  secondaryPrize?: number;
  averagePool?: number;
  ticketCost: number;
  onUpdate: (index: number, row: PrizeRow) => void;
}

const PrizeTableRow: React.FC<PrizeTableRowProps> = ({
  row,
  displayLabel,
  index,
  lottery,
  superprice,
  secondaryPrize,
  averagePool,
  ticketCost,
  onUpdate,
}) => {
  const isEditable = typeof row.prize === 'number' && row.prize >= 0;
  const isSuperprice = row.prize === 'Суперприз' || row.prizeNote === 'Суперприз';
  const isSecondaryPrize = row.prize === 'Приз';

  const probability = calculateRowProbability(lottery, row);
  const probFormatted = formatProbability(probability);

  // Calculate displayed prize value
  let displayedPrize: number | string;
  if (isSuperprice) {
    displayedPrize = superprice;
  } else if (isSecondaryPrize) {
    displayedPrize = secondaryPrize || 0;
  } else if (typeof row.prize === 'number') {
    displayedPrize = row.prize;
  } else if (row.prizePercent !== undefined && averagePool && ticketCost > 0) {
    // Calculate prize per winner:
    // Total for category = percent × pool
    // Total tickets ≈ pool / ticketCost (approximation based on prize fund)
    // Expected winners = totalTickets × probability
    // Prize per winner = (percent × pool) / expectedWinners
    //                  = (percent × pool) / ((pool / ticketCost) × prob)
    //                  = (percent × ticketCost) / prob
    // 
    // NOTE: This assumes averagePool ≈ revenue, but actually averagePool is 
    // the PRIZE FUND which is ~50% of revenue. So we need to use pool directly.
    // Real formula: prize = (percent × pool) / ((pool / ticketCost) × prob)
    //             BUT (pool / ticketCost) underestimates tickets by ~2x
    // 
    // Simplest fix: use pool directly in numerator and estimate tickets from pool
    // expectedWinners = (averagePool / ticketCost) × probability × 2
    // (×2 because pool is ~50% of revenue, so real tickets ≈ 2× pool/ticketCost)
    
    if (probability > 0) {
      const estimatedTickets = (averagePool / ticketCost) * 2;
      const expectedWinners = estimatedTickets * probability;
      displayedPrize = Math.floor((row.prizePercent / 100 * averagePool) / expectedWinners);
    } else {
      displayedPrize = 0;
    }
  } else {
    displayedPrize = 0;
  }

  const handlePrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0;
    if (value >= 0) {
      onUpdate(index, { ...row, prize: value } as PrizeRow);
    }
  };

  const handlePrizeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === '' || value === '0') {
      onUpdate(index, { ...row, prize: 0 } as PrizeRow);
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50">
      <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
        {displayLabel}
      </td>
      <td className="px-3 py-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {probFormatted ? (
          <span title={probFormatted.tooltip}>{probFormatted.text}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-right text-sm">
        {isEditable ? (
          <div className="flex items-center justify-end gap-1">
            <Input
              type="text"
              value={typeof row.prize === 'number' ? row.prize.toString() : '0'}
              onChange={handlePrizeChange}
              onBlur={handlePrizeBlur}
              min={0}
              step={100}
              className="text-right"
            />
          </div>
        ) : isSuperprice ? (
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {typeof displayedPrize === 'number' ? `${displayedPrize.toLocaleString()} ₽` : displayedPrize}
          </span>
        ) : isSecondaryPrize ? (
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {typeof displayedPrize === 'number' ? `${displayedPrize.toLocaleString()} ₽` : displayedPrize}
          </span>
        ) : row.prizePercent !== undefined ? (
          // For percentage-based prizes, show both percentage and calculated amount
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-medium text-gray-900 dark:text-white">
              {typeof displayedPrize === 'number' ? `${displayedPrize.toLocaleString()} ₽` : '—'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.prizePercent}%
            </span>
          </div>
        ) : (
          <span className="font-medium text-gray-900 dark:text-white">
            {typeof displayedPrize === 'number' ? `${displayedPrize.toLocaleString()} ₽` : displayedPrize}
          </span>
        )}
      </td>
    </tr>
  );
};
