/**
 * Strategy Selection Page
 * Allow users to choose lottery strategy and configure parameters
 * Each strategy shows minimum ticket requirements and expected value
 */

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Button, Container, Input, Slider, Select, Grid } from '../../shared/ui';
import { useLotteryStore } from '../../entities/lottery/store';
import { getStrategiesForLottery, getStrategyGuarantee } from '../../entities/strategies/config';
import { calculateEV } from '../../entities/lottery/calculation';

export interface StrategySelectionPageProps {
  onNext?: (strategyId: string, params: Record<string, unknown>, ticketCount: number) => void;
  onBack?: () => void;
}

/**
 * Strategy Selection Component
 */
export const StrategySelectionPage: React.FC<StrategySelectionPageProps> = ({
  onNext,
  onBack,
}) => {
  const { selectedLottery, currentTicketCost, currentSuperprice, currentPrizeTable } = useLotteryStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('max_coverage');
  const [params, setParams] = useState<Record<string, unknown>>({
    budget: 1000,
  });
  const [customTicketCount, setCustomTicketCount] = useState<number | null>(null);

  const availableStrategies = getStrategiesForLottery(selectedLottery.id);
  const strategy = availableStrategies.find((s) => s.id === selectedStrategy);

  const handleParamChange = (key: string, value: unknown) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate guarantee for current strategy
  const guarantee = useMemo(() => {
    if (!strategy) return null;
    return getStrategyGuarantee(strategy, selectedLottery, params);
  }, [strategy, selectedLottery, params]);

  // Calculate expected value
  const evInfo = useMemo(() => {
    const ticketCount = customTicketCount ?? guarantee?.ticketCount ?? 1;
    const ev = calculateEV(
      selectedLottery,
      currentSuperprice,
      currentPrizeTable,
      currentTicketCost
    );
    return {
      ...ev,
      totalCost: ticketCount * currentTicketCost,
      evTotal: ev.expectedValue * ticketCount,
    };
  }, [guarantee?.ticketCount, customTicketCount, selectedLottery, currentSuperprice, currentPrizeTable, currentTicketCost]);

  const handleNext = () => {
    if (onNext && strategy && guarantee) {
      const ticketCount = customTicketCount ?? guarantee.ticketCount;
      onNext(strategy.id, params, ticketCount);
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
                onClick={() => {
                  setSelectedStrategy(strat.id);
                  setCustomTicketCount(null);
                }}
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
                      onValueChange={(value) => handleParamChange(param.key, value[0])}
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

      {/* Strategy Guarantee & EV */}
      {strategy && guarantee && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Расчет стратегии
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Minimum Requirements */}
              <div className="pb-4 border-b border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Минимально для выполнения:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Билетов</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {guarantee.ticketCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Стоимость</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {guarantee.ticketCount * currentTicketCost} ₽
                    </p>
                  </div>
                </div>
              </div>

              {/* Expected Value */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ожидаемый возврат:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">EV на билет</p>
                    <p className={`text-lg font-bold ${evInfo.expectedValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {evInfo.expectedValue >= 0 ? '+' : ''}{evInfo.expectedValue.toFixed(0)} ₽
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">EV%</p>
                    <p className={`text-lg font-bold ${evInfo.evPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {evInfo.evPercent >= 0 ? '+' : ''}{evInfo.evPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Custom Ticket Count */}
      {guarantee && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Количество билетов (опционально)
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                По умолчанию: {guarantee.ticketCount} (по расчету стратегии)
              </p>
              <Input
                type="number"
                label="Сгенерировать билетов"
                value={customTicketCount?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  setCustomTicketCount(val);
                }}
                min={1}
                max={1000}
                placeholder={guarantee.ticketCount.toString()}
                helper="Оставьте пусто для использования рекомендуемого количества"
              />
              {customTicketCount && customTicketCount !== guarantee.ticketCount && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Вы изменили количество билетов. Это может повлиять на гарантию стратегии.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

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
