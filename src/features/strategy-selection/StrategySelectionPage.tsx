/**
 * Strategy Selection Page
 * User selects strategy and inputs parameters
 * System calculates required ticket count
 * User can then adjust tickets or budget before generation
 */

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Button, Container, Input, Slider, Grid } from '../../shared/ui';
import { useLotteryStore } from '../../entities/lottery/store';
import { getStrategiesForLottery, calculateTicketCountForStrategy } from '../../entities/strategies/config';
import { ChevronLeft } from 'lucide-react';

export interface StrategySelectionPageProps {
  onNext?: (strategyId: string, params: Record<string, unknown>, ticketCount: number) => void;
  onBack?: () => void;
}

export const StrategySelectionPage: React.FC<StrategySelectionPageProps> = ({
  onNext,
  onBack,
}) => {
  const { selectedLottery, currentTicketCost } = useLotteryStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [params, setParams] = useState<Record<string, unknown>>({});

  const availableStrategies = getStrategiesForLottery(selectedLottery.id);
  const strategy = availableStrategies.find((s) => s.id === selectedStrategy);

  // Calculated ticket count based on strategy and parameters
  const calculatedTicketCount = useMemo(() => {
    if (!strategy) return 1;
    return calculateTicketCountForStrategy(strategy.id, selectedLottery, params, currentTicketCost);
  }, [strategy, selectedLottery, params, currentTicketCost]);

  // User can override
  const [customTicketCount, setCustomTicketCount] = useState<number | null>(null);
  const effectiveTicketCount = customTicketCount ?? calculatedTicketCount;
  const effectiveBudget = effectiveTicketCount * currentTicketCost;

  const handleParamChange = (key: string, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTicketCountChange = (value: number | null) => {
    setCustomTicketCount(value);
  };

  const handleBudgetChange = (value: number) => {
    const tickets = Math.max(1, Math.floor(value / currentTicketCost));
    setCustomTicketCount(tickets);
  };

  const handleNext = () => {
    if (onNext && strategy) {
      onNext(strategy.id, params, effectiveTicketCount);
    }
  };

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
          Выберите стратегию
        </h1>
        <p className="text-center text-base text-gray-600 dark:text-gray-400">
          для {selectedLottery.name}
        </p>
      </header>

      {/* Strategy Selection */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Доступные стратегии
          </h2>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap="md">
            {availableStrategies.map((strat) => (
              <button
                key={strat.id}
                onClick={() => {
                  setSelectedStrategy(strat.id);
                  setCustomTicketCount(null);
                  // Reset params to defaults (only for non-text fields or if has meaningful default)
                  const newParams: Record<string, unknown> = {};
                  for (const param of strat.parameters) {
                    // For text fields with empty default, don't set anything
                    if (param.type === 'text' && (!param.defaultValue || param.defaultValue === '')) {
                      newParams[param.key] = '';
                    } else {
                      newParams[param.key] = param.defaultValue;
                    }
                  }
                  setParams(newParams);
                }}
                className={`text-left p-4 rounded-lg border-2 transition ${
                  selectedStrategy === strat.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {strat.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {strat.description}
                </p>
              </button>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Strategy Parameters */}
      {strategy && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Параметры
            </h2>
          </CardHeader>
          <CardBody>
            <Grid cols={1} gap="md">
              {strategy.parameters.map((param) => (
                <div key={param.key}>
                  {param.type === 'number' && (
                    <Input
                      type="text"
                      label={param.label}
                      value={params[param.key]?.toString() || param.defaultValue?.toString() || ''}
                      onChange={(e) => handleParamChange(param.key, parseInt(e.target.value))}
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      helper={param.description}
                    />
                  )}

                  {param.type === 'range' && (
                    <Slider
                      label={param.label}
                      value={(params[param.key] as number) || (param.defaultValue as number) || 0}
                      onValueChange={(value) => handleParamChange(param.key, value[0])}
                      min={param.min || 0}
                      max={param.max || 100}
                      step={param.step || 1}
                      helper={param.description}
                    />
                  )}

                  {param.type === 'text' && (
                    <Input
                      type="text"
                      label={param.label}
                      value={(params[param.key] as string) || (param.defaultValue as string) || ''}
                      onChange={(e) => {
                        // Allow only digits, commas, spaces
                        const value = e.target.value;
                        if (/^[0-9,\s]*$/.test(value) || value === '') {
                          handleParamChange(param.key, value);
                        }
                      }}
                      placeholder={param.defaultValue?.toString() || ''}
                      helper={param.description}
                    />
                  )}
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>
      )}

      {/* Calculation Result */}
      {strategy && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Расчет по стратегии
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="pb-4 border-b border-amber-200 dark:border-amber-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Рекомендуемое количество:
                </p>
                <div className="text-3xl font-semibold text-amber-600 dark:text-amber-400">
                  {calculatedTicketCount} билетов
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Стоимость: {calculatedTicketCount * currentTicketCost} ₽
                </p>
              </div>

              {/* Ticket Count Input */}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Хотите изменить количество?
                </label>
                <Input
                  type="text"
                  value={customTicketCount?.toString() || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    handleTicketCountChange(val);
                  }}
                  min={1}
                  max={1000}
                  placeholder={calculatedTicketCount.toString()}
                  helper="Оставьте пусто для рекомендуемого количества"
                />
              </div>

              {/* Budget Input - synchronized with ticket count */}
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Или установите бюджет
                </label>
                <Input
                  type="text"
                  value={effectiveBudget.toString()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      handleBudgetChange(val);
                    }
                  }}
                  min={currentTicketCost}
                  step={currentTicketCost}
                  helper="Выразится в целое число билетов"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  = {effectiveTicketCount} билетов
                </p>
              </div>

              {/* Summary */}
              <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Итого к генерации:
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Билетов</p>
                    <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                      {effectiveTicketCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Стоимость</p>
                    <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                      {effectiveBudget} ₽
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mb-6">
        {strategy && (
          <Button onClick={handleNext} variant="primary" className="flex-1">
            Сгенерировать
          </Button>
        )}
      </div>
    </Container>
  );
};
