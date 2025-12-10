/**
 * LotteryDetailPage Component
 * Display lottery details, editable superprice, prize table, EV calculation
 */

import React from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import { calculateEV } from '@/entities/lottery/calculation';
import { Card, CardHeader, CardBody, Input, Button, Container } from '@/shared/ui';
import type { PrizeRow } from '@/entities/lottery/types';
import { STRINGS } from '@/shared/constants';
import { probabilityOfMatch } from '@/entities/calculations/probability';
import { Undo2, ChevronLeft } from 'lucide-react';

export interface LotteryDetailPageProps {
  lotteryId: string;
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * Lottery Detail Page Component
 * Shows lottery info, superprice editor, prize table, EV calculation
 */
export const LotteryDetailPage: React.FC<LotteryDetailPageProps> = ({
  lotteryId,
  onNext,
  onBack,
}) => {
  const {
    selectedLottery,
    currentSuperprice,
    currentTicketCost,
    currentPrizeTable,
    updateSuperprice,
    updateTicketCost,
    selectLottery,
    updatePrizeRow,
    resetPrizeTableToDefaults,
  } = useLotteryStore();

  // Ensure correct lottery is selected
  React.useEffect(() => {
    if (lotteryId && lotteryId !== selectedLottery.id) {
      selectLottery(lotteryId);
    }
  }, [lotteryId, selectedLottery.id, selectLottery]);

  // Calculate EV - updates in real-time when superprice changes
  const evCalculation = React.useMemo(
    () =>
      calculateEV(
        selectedLottery,
        currentSuperprice,
        currentPrizeTable,
        currentTicketCost
      ),
    [selectedLottery, currentSuperprice, currentPrizeTable, currentTicketCost]
  );

  // Superprice range for slider (0 to 500M with 1M steps)
  const superpriceMin = 0;
  const superpriceMax = 500000000;
  const superpriceStep = 1000000;

  return (
    <Container>
      <header className="h-[72px] inset-x-16 top-0 z-20 flex flex-col items-center justify-center fixed">
        {onBack && (

          <div className="absolute inset-y-0 -left-8 flex items-center">
            <button
              type="button"
              onClick={onBack}
              className="
                flex items-center gap-2
                text-gray-500 dark:text-gray-400
                transition-colors active:scale-95
              "
              aria-label="Go back"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          </div>
        )}
        <h1 className="text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
          {selectedLottery.name}
        </h1>
        <p className="text-center text-base text-gray-600 dark:text-gray-400">
          {selectedLottery.description}
        </p>
      </header>

      {/* Ticket Cost & Superprice - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Ticket Cost Input */}
        <Card>
          <CardBody className="space-y-4">
            <Input
              type="text"
              label="Цена (₽)"
              value={currentTicketCost.toString()}
              onChange={(e) => {
                const value = Number.parseFloat(e.target.value);
                if (!Number.isNaN(value) && value > 0) {
                  updateTicketCost(value);
                }
              }}
              helper="Введите стоимость одного билета в рублях"
            />
            <Input
              type="text"
              label="Суперприз (₽)"
              value={currentSuperprice.toString()}
              onChange={(e) => {
                const value = Number.parseFloat(e.target.value) || 0;
                const clampedValue = Math.max(
                  superpriceMin,
                  Math.min(superpriceMax, value)
                );
                updateSuperprice(clampedValue);
              }}
              min={superpriceMin}
              max={superpriceMax}
              step={superpriceStep}
              helper={`Мин: ${(superpriceMin / 1000000).toLocaleString()} млн ₽`}
            />
          </CardBody>
        </Card>
      </div>

      {/* Prize Table */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {STRINGS.detail_prize_table}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetPrizeTableToDefaults}
              aria-label="Сбросить к умолчаниям"
            >
              <Undo2></Undo2>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-xs uppercase tracking-tighter font-semibold text-gray-700 dark:text-gray-300">
                    Совп.
                  </th>
                  <th className="text-center py-2 px-3 text-xs uppercase tracking-tighter font-semibold text-gray-700 dark:text-gray-300">
                    Вероятн.
                  </th>
                  <th className="text-right py-2 px-3 text-xs uppercase tracking-tighter font-semibold text-gray-700 dark:text-gray-300">
                    Приз
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPrizeTable.rows.map((row, index) => {
                  const isEditable =
                    typeof row.prize === 'number' && row.prize >= 0;
                  const isSuperprice = row.prize === 'Суперприз';
                  const isSecondaryPrize = row.prize === 'Приз';

                  // Calculate probability for this row
                  let probability = 0;
                  if (selectedLottery.fieldCount === 1) {
                    const field = selectedLottery.fields[0];
                    const matches = row.matches[0];
                    probability = probabilityOfMatch(
                      field.from,
                      field.count,
                      field.count,
                      matches
                    );
                  } else if (selectedLottery.fieldCount === 2 && row.matches.length === 2) {
                    const field1 = selectedLottery.fields[0];
                    const field2 = selectedLottery.fields[1];
                    const matches1 = row.matches[0];
                    const matches2 = row.matches[1];

                    const prob1 = probabilityOfMatch(
                      field1.from,
                      field1.count,
                      field1.count,
                      matches1
                    );
                    const prob2 = probabilityOfMatch(
                      field2.from,
                      field2.count,
                      field2.count,
                      matches2
                    );

                    probability = prob1 * prob2;
                  }

                  // Format probability
                  const probPercent = (probability * 100).toFixed(4);
                  const probOneIn = probability > 0 ? Math.round(1 / probability) : null;

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                        {row.matches.join(' + ')}
                      </td>
                      <td className="py-2 px-3 text-sm text-center text-gray-600 dark:text-gray-400">
                        {probOneIn ? (
                          <span title={`${probPercent}%`}>
                            1:{probOneIn.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        {isEditable ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="text"
                              value={typeof row.prize === 'number' ? row.prize.toString() : '0'}
                              onChange={(e) => {
                                const value =
                                  Number.parseFloat(e.target.value) || 0;
                                if (value >= 0) {
                                  updatePrizeRow(index, {
                                    ...row,
                                    prize: value,
                                  } as PrizeRow);
                                }
                              }}
                              onBlur={(e) => {
                                // Prevent empty values - set to 0 if empty
                                const value = e.target.value.trim();
                                if (value === '' || value === '0') {
                                  updatePrizeRow(index, {
                                    ...row,
                                    prize: 0,
                                  } as PrizeRow);
                                }
                              }}
                              min={0}
                              step={100}
                              className="w-32 text-right"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                              ₽
                            </span>
                          </div>
                        ) : isSuperprice || isSecondaryPrize ? (
                          <span className="font-medium text-amber-600 dark:text-amber-400">
                            {row.prize}
                          </span>
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {typeof row.prize === 'number'
                              ? `${row.prize.toLocaleString()} ₽`
                              : row.prize}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      {/* EV Display */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {STRINGS.detail_ev}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Ticket Cost */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Стоимость билета:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentTicketCost.toLocaleString()} ₽
              </span>
            </div>

            {/* Expected Value */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Мат. ожидание:
              </span>
              <span
                className={`text-lg font-semibold ${
                  evCalculation.isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {evCalculation.expectedValue >= 0 ? '+' : ''}
                {evCalculation.expectedValue.toFixed(2)} ₽
              </span>
            </div>

            {/* EV Percentage */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">EV%:</span>
              <span
                className={`text-lg font-semibold ${
                  evCalculation.isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {evCalculation.evPercent >= 0 ? '+' : ''}
                {evCalculation.evPercent.toFixed(2)}%
              </span>
            </div>

            {/* Profitability Indicator */}
            <div
              className={`mt-4 p-4 rounded-lg border ${
                evCalculation.isProfitable
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">
                  {evCalculation.isProfitable ? '✅' : '❌'}
                </span>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      evCalculation.isProfitable
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}
                  >
                    {evCalculation.isProfitable
                      ? 'Лотерея прибыльна'
                      : 'Лотерея убыточна'}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      evCalculation.isProfitable
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {evCalculation.isProfitable
                      ? 'При текущих параметрах математическое ожидание положительное'
                      : 'При текущих параметрах математическое ожидание отрицательное'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-6">
        {onNext && (
          <Button onClick={onNext} className="flex-1">
            {STRINGS.button_next}
          </Button>
        )}
      </div>
    </Container>
  );
};

