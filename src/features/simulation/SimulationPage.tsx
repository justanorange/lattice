/**
 * SimulationPage Component
 * Run lottery simulations and display results
 */

import React, { useState } from "react";
import { useLotteryStore } from "../../entities/lottery/store";
import { simulateLottery } from "../../entities/lottery/simulation";
import type { SimulationResult, Ticket } from "../../entities/lottery/types";
import { Card, CardHeader, CardBody, Button, Container, Input, Slider } from "../../shared/ui";
import { STRINGS } from "../../shared/constants";

export interface SimulationPageProps {
  tickets?: Ticket[];
  onBack?: () => void;
}

/**
 * Simulation Page Component
 * Run simulations and show statistics
 */
export const SimulationPage: React.FC<SimulationPageProps> = ({
  tickets = [],
  onBack,
}) => {
  const {
    selectedLottery,
    currentTicketCost,
    currentPrizeTable,
    currentSuperprice,
  } = useLotteryStore();

  const [roundsCount, setRoundsCount] = useState(100);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = () => {
    if (tickets.length === 0) {
      alert("Нет билетов для симуляции");
      return;
    }

    setIsRunning(true);
    setResult(null);

    // Run simulation in next tick to avoid blocking UI
    setTimeout(() => {
      try {
        const simulationResult = simulateLottery(
          selectedLottery,
          tickets,
          roundsCount,
          currentPrizeTable,
          currentSuperprice,
          currentTicketCost
        );
        setResult(simulationResult);
      } catch (err) {
        console.error("Simulation error:", err);
        alert("Ошибка симуляции: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsRunning(false);
      }
    }, 10);
  };

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          Симуляция лотереи
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Симуляция {roundsCount} тиражей для {selectedLottery.name}
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Параметры симуляции
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Slider
            label="Количество тиражей"
            value={roundsCount}
            onValueChange={(value) => setRoundsCount(value[0])}
            min={10}
            max={10000}
            step={10}
            helper="Выберите количество тиражей для симуляции (10-10000)"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={roundsCount.toString()}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 100;
                setRoundsCount(Math.max(10, Math.min(10000, value)));
              }}
              min={10}
              max={10000}
              className="w-32"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              тиражей
            </span>
          </div>
          <Button
            onClick={handleRunSimulation}
            disabled={isRunning || tickets.length === 0}
            className="w-full"
          >
            {isRunning ? "Запуск симуляции..." : "Запустить симуляцию"}
          </Button>
        </CardBody>
      </Card>

      {/* Results */}
      {result && !isRunning && (
        <>
          {/* Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Статистика
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Всего инвестировано
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.statistics.totalInvestment.toLocaleString()} ₽
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Всего выиграно
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {result.statistics.totalWon.toLocaleString()} ₽
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Чистая прибыль
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      result.statistics.netReturn >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.statistics.netReturn >= 0 ? "+" : ""}
                    {result.statistics.netReturn.toLocaleString()} ₽
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
                  <p
                    className={`text-2xl font-bold ${
                      result.statistics.roi >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.statistics.roi >= 0 ? "+" : ""}
                    {result.statistics.roi.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Тиражей без выигрыша
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {result.statistics.zeroWinRounds} (
                    {result.statistics.zeroWinPercent.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Максимальный выигрыш
                  </p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                    {result.statistics.maxPrizeInRound.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Bankroll Chart (simple text representation) */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Динамика банкролла
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Начальный баланс:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    0 ₽
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Финальный баланс:
                  </span>
                  <span
                    className={`font-medium ${
                      result.rounds[result.rounds.length - 1]?.bankroll >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.rounds[result.rounds.length - 1]?.bankroll.toLocaleString()}{" "}
                    ₽
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            {STRINGS.button_back}
          </Button>
        )}
      </div>
    </Container>
  );
};

