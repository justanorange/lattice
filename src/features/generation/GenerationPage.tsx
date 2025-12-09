/**
 * GenerationPage Component
 * Display generated tickets from strategy execution
 */

import React, { useState, useEffect } from "react";
import { useLotteryStore } from "../../entities/lottery/store";
import { executeStrategy } from "../../entities/strategies/generator";
import type { StrategyResult } from "../../entities/strategies/types";
import { Card, CardHeader, CardBody, Button, Container, Spinner } from "../../shared/ui";
import { STRINGS } from "../../shared/constants";

export interface GenerationPageProps {
  strategyId?: string;
  strategyParams?: Record<string, unknown>;
  onBack?: () => void;
}

/**
 * Generation Page Component
 * Shows generated tickets from strategy execution
 */
export const GenerationPage: React.FC<GenerationPageProps> = ({
  strategyId = "coverage",
  strategyParams = { budget: 50 },
  onBack,
}) => {
  const {
    selectedLottery,
    currentTicketCost,
  } = useLotteryStore();

  const [result, setResult] = useState<StrategyResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateTickets = async () => {
      setIsGenerating(true);
      setError(null);
      try {
        const strategyResult = await executeStrategy(
          strategyId,
          selectedLottery,
          strategyParams,
          currentTicketCost
        );
        setResult(strategyResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка генерации");
      } finally {
        setIsGenerating(false);
      }
    };

    generateTickets();
  }, [strategyId, selectedLottery.id, currentTicketCost]);

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          {STRINGS.generation_title}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Сгенерированные билеты для {selectedLottery.name}
        </p>
      </div>

      {isGenerating && (
        <Card className="mb-6">
          <CardBody className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400">
                Генерация билетов...
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardBody>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardBody>
        </Card>
      )}

      {result && !isGenerating && (
        <>
          {/* Stats */}
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
                    Количество билетов
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.ticketCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Общая стоимость
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {result.totalCost.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tickets List */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Сгенерированные билеты
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {ticket.fields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="flex gap-1">
                            {field.numbers.map((num, numIndex) => (
                              <span
                                key={numIndex}
                                className="px-2 py-1 text-xs font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                              >
                                {num}
                              </span>
                            ))}
                            {fieldIndex < ticket.fields.length - 1 && (
                              <span className="px-1 text-gray-400">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
        {result && (
          <Button variant="primary">
            {STRINGS.generation_download_pdf}
          </Button>
        )}
      </div>
    </Container>
  );
};

