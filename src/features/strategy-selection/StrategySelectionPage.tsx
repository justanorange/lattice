/**
 * Strategy Selection Page
 * Allow users to choose lottery strategy
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Container, Input, Slider, Select, Grid } from '../../shared/ui';
import { useLotteryStore } from '../../entities/lottery/store';
import { getStrategiesForLottery } from '../../entities/strategies/config';

export interface StrategySelectionPageProps {
  onNext?: (strategyId: string, params: Record<string, unknown>) => void;
  onBack?: () => void;
}

/**
 * Strategy Selection Component
 */
export const StrategySelectionPage: React.FC<StrategySelectionPageProps> = ({
  onNext,
  onBack,
}) => {
  const { selectedLottery, currentTicketCost } = useLotteryStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('coverage');
  const [params, setParams] = useState<Record<string, unknown>>({
    budget: 500,
  });

  const availableStrategies = getStrategiesForLottery(selectedLottery.id);
  const strategy = availableStrategies.find((s) => s.id === selectedStrategy);

  const handleParamChange = (key: string, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNext = () => {
    if (onNext && strategy) {
      onNext(strategy.id, params);
    }
  };

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          Выберите стратегию
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          для {selectedLottery.name}
        </p>
      </div>

      {/* Strategy Selection */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Доступные стратегии
          </h2>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap="md">
            {availableStrategies.map((strat) => (
              <div
                key={strat.id}
                onClick={() => setSelectedStrategy(strat.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                  selectedStrategy === strat.id
                    ? 'border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-800'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {strat.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {strat.description}
                </p>
              </div>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Strategy Parameters */}
      {strategy && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Параметры стратегии
            </h2>
          </CardHeader>
          <CardBody>
            <Grid cols={1} gap="md">
              {strategy.parameters.map((param) => (
                <div key={param.key}>
                  {param.type === 'number' && (
                    <Input
                      type="number"
                      label={param.label}
                      value={params[param.key]?.toString() || param.defaultValue?.toString() || ''}
                      onChange={(e) =>
                        handleParamChange(param.key, Number.parseFloat(e.target.value))
                      }
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      helper={param.description}
                    />
                  )}

                  {param.type === 'range' && (
                    <Slider
                      label={param.label}
                      value={
                        (params[param.key] as number) || (param.defaultValue as number) || 0
                      }
                      onValueChange={(value) => handleParamChange(param.key, value)}
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      helper={param.description}
                    />
                  )}

                  {param.type === 'select' && (
                    <Select
                      label={param.label}
                      options={
                        param.options?.map((o: any) => ({
                          value: o.value,
                          label: o.label,
                        })) || []
                      }
                      value={params[param.key]?.toString() || param.defaultValue?.toString() || ''}
                      onChange={(e) => handleParamChange(param.key, e.target.value)}
                    />
                  )}

                  {param.type === 'boolean' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={param.key}
                        checked={(params[param.key] as boolean) || (param.defaultValue as boolean) || false}
                        onChange={(e) => handleParamChange(param.key, e.target.checked)}
                        className="rounded-lg w-4 h-4 accent-amber-500"
                      />
                      <label htmlFor={param.key} className="text-sm font-medium text-gray-900 dark:text-white">
                        {param.label}
                      </label>
                      {param.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
                          {param.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </Grid>
          </CardBody>
        </Card>
      )}

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Расчет
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Стоимость билета:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentTicketCost} ₽
              </span>
            </div>
            {params.budget ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Бюджет:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {String(params.budget)} ₽
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white font-semibold">
                    Приблизительно билетов:
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {Math.floor(Number(params.budget) / currentTicketCost)}
                  </span>
                </div>
              </>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 mb-6">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          Назад
        </Button>
        <Button onClick={handleNext} variant="primary" className="flex-1">
          Далее →
        </Button>
      </div>
    </Container>
  );
};
