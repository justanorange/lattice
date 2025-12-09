/**
 * LotteryDetailPage Component
 * Display lottery details, editable superprice, prize table, EV calculation
 */

import React from "react";
import { useLotteryStore } from "../../entities/lottery/store";
import { calculateEV } from "../../entities/lottery/calculation";
import { Card, CardHeader, CardBody, Input, Slider, Button, Container } from "../../shared/ui";
import type { PrizeRow } from "../../entities/lottery/types";
import { STRINGS } from "../../shared/constants";

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
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          {selectedLottery.name}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          {selectedLottery.description}
        </p>
      </div>

      {/* Superprice Input with Slider */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {STRINGS.detail_superprice}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Slider for quick adjustment */}
          <Slider
            label="Суперприз (₽)"
            value={currentSuperprice}
            onValueChange={(value) => updateSuperprice(value)}
            min={superpriceMin}
            max={superpriceMax}
            step={superpriceStep}
            helper="Используйте слайдер для быстрой настройки или введите точное значение ниже"
          />
          {/* Input for precise value */}
          <Input
            type="number"
            label="Точное значение (₽)"
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
            helper={`Минимум: ${superpriceMin.toLocaleString()} ₽, Максимум: ${superpriceMax.toLocaleString()} ₽`}
          />
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
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Математическое ожидание:
              </span>
              <span
                className={`font-semibold ${
                  evCalculation.isProfitable
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {evCalculation.expectedValue.toFixed(2)} ₽
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">EV%:</span>
              <span
                className={`font-semibold ${
                  evCalculation.isProfitable
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {evCalculation.evPercent.toFixed(2)}%
              </span>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {evCalculation.isProfitable
                  ? "✅ Лотерея прибыльна при текущих параметрах"
                  : "❌ Лотерея убыточна при текущих параметрах"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

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
            >
              Сбросить к умолчаниям
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Совпадения
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Приз
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPrizeTable.rows.map((row, index) => {
                  const isEditable =
                    typeof row.prize === "number" && row.prize > 0;
                  const isSuperprice = row.prize === "Суперприз";
                  const isSecondaryPrize = row.prize === "Приз";

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                        {row.matches.join(" + ")}
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        {isEditable ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={row.prize.toString()}
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
                            {typeof row.prize === "number"
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
          </p>
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            {STRINGS.button_back}
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext} className="flex-1">
            {STRINGS.button_next}
          </Button>
        )}
      </div>
    </Container>
  );
};

