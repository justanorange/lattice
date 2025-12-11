/**
 * Prize Table Section
 * Editable prize table with probabilities
 */

import { RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input } from '@/shared/ui';
import { STRINGS } from '@/shared/constants';
import { probabilityOfMatch } from '@/entities/calculations/probability';
import type { Lottery, PrizeTable, PrizeRow } from '@/entities/lottery/types';

interface PrizeTableSectionProps {
  lottery: Lottery;
  prizeTable: PrizeTable;
  onUpdateRow: (index: number, row: PrizeRow) => void;
  onReset: () => void;
}

/**
 * Calculate probability for a prize row
 */
function calculateRowProbability(lottery: Lottery, row: PrizeRow): number {
  if (lottery.fieldCount === 1) {
    const field = lottery.fields[0];
    return probabilityOfMatch(field.from, field.count, field.count, row.matches[0]);
  }

  if (lottery.fieldCount === 2 && row.matches.length === 2) {
    const field1 = lottery.fields[0];
    const field2 = lottery.fields[1];
    const prob1 = probabilityOfMatch(field1.from, field1.count, field1.count, row.matches[0]);
    const prob2 = probabilityOfMatch(field2.from, field2.count, field2.count, row.matches[1]);
    return prob1 * prob2;
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
              {prizeTable.rows.map((row, index) => (
                <PrizeTableRow
                  key={index}
                  row={row}
                  index={index}
                  lottery={lottery}
                  onUpdate={onUpdateRow}
                />
              ))}
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
  index: number;
  lottery: Lottery;
  onUpdate: (index: number, row: PrizeRow) => void;
}

const PrizeTableRow: React.FC<PrizeTableRowProps> = ({ row, index, lottery, onUpdate }) => {
  const isEditable = typeof row.prize === 'number' && row.prize >= 0;
  const isSuperprice = row.prize === 'Суперприз';
  const isSecondaryPrize = row.prize === 'Приз';

  const probability = calculateRowProbability(lottery, row);
  const probFormatted = formatProbability(probability);

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
        {row.matches.join(' + ')}
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
        ) : isSuperprice || isSecondaryPrize ? (
          <span className="font-medium text-amber-600 dark:text-amber-400">{row.prize}</span>
        ) : (
          <span className="font-medium text-gray-900 dark:text-white">
            {typeof row.prize === 'number' ? `${row.prize.toLocaleString()} ₽` : row.prize}
          </span>
        )}
      </td>
    </tr>
  );
};
