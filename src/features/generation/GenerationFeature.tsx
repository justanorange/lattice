/**
 * GenerationPage Component
 * Display generated tickets from strategy execution
 */

import React, { useState, useEffect } from 'react';
import { useLotteryStore } from '@/entities/lottery/store';
import { executeStrategy } from '@/entities/strategies/generator';
import type { StrategyResult } from '@/entities/strategies/types';
import { Card, CardHeader, CardBody, Container, Spinner, TicketVisualization } from '@/shared/ui';
import { STRINGS } from '@/shared/constants';
import { ChevronLeft } from 'lucide-react';

export interface GenerationPageProps {
  strategyId?: string;
  strategyParams?: Record<string, unknown>;
  ticketCount?: number;
  onBack?: () => void;
}

/**
 * Generation Page Component
 * Shows generated tickets from strategy execution
 */
export const GenerationPage: React.FC<GenerationPageProps> = ({
  strategyId = 'max_coverage',
  strategyParams = { budget: 1000 },
  ticketCount = 10,
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
        // Pass ticketCount as part of params if not already there
        const params = {
          ...strategyParams,
          ticketCount,
        };
        const strategyResult = await executeStrategy(
          strategyId,
          selectedLottery,
          params,
          currentTicketCost
        );
        setResult(strategyResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка генерации');
      } finally {
        setIsGenerating(false);
      }
    };

    generateTickets();
  }, [strategyId, strategyParams, ticketCount, selectedLottery.id, currentTicketCost]);

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
        <h1 className="text-center text-base font-semibold leading-tight text-gray-900 dark:text-white">
          {STRINGS.generation_title}
        </h1>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Сгенерированные билеты для {selectedLottery.name}
        </p>
      </header>

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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {result.ticketCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Общая стоимость
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {result.totalCost.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tickets Visualization */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Визуализация билетов
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-screen overflow-y-auto">
                {result.tickets.map((ticket, index) => (
                  <div key={index}>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Билет #{index + 1}
                    </div>
                    <TicketVisualization
                      ticket={ticket}
                      lottery={selectedLottery}
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {/* {result && (
          <Button variant="primary">
            {STRINGS.generation_download_pdf}
          </Button>
        )} */}
      </div>
    </Container>
  );
};

