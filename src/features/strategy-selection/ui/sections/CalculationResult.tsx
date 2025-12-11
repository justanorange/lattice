/**
 * Calculation Result Section
 * Shows calculated ticket count and allows adjustment
 */

import { Card, CardHeader, CardBody, Input } from '@/shared/ui';

interface CalculationResultProps {
  calculatedTicketCount: number;
  effectiveTicketCount: number;
  effectiveBudget: number;
  ticketCost: number;
  customTicketCount: number | null;
  onTicketCountChange: (value: number | null) => void;
  onBudgetChange: (value: number) => void;
}

export const CalculationResult: React.FC<CalculationResultProps> = ({
  calculatedTicketCount,
  effectiveTicketCount,
  effectiveBudget,
  ticketCost,
  customTicketCount,
  onTicketCountChange,
  onBudgetChange,
}) => {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Расчет по стратегии
        </h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Recommended Count */}
          <RecommendedCount
            count={calculatedTicketCount}
            cost={calculatedTicketCount * ticketCost}
          />

          {/* Ticket Count Input */}
          <TicketCountInput
            customTicketCount={customTicketCount}
            calculatedTicketCount={calculatedTicketCount}
            onChange={onTicketCountChange}
          />

          {/* Budget Input */}
          <BudgetInput
            budget={effectiveBudget}
            ticketCost={ticketCost}
            effectiveTicketCount={effectiveTicketCount}
            onChange={onBudgetChange}
          />

          {/* Summary */}
          <GenerationSummary
            ticketCount={effectiveTicketCount}
            budget={effectiveBudget}
          />
        </div>
      </CardBody>
    </Card>
  );
};

interface RecommendedCountProps {
  count: number;
  cost: number;
}

const RecommendedCount: React.FC<RecommendedCountProps> = ({ count, cost }) => (
  <div className="border-b border-amber-200 pb-4 dark:border-amber-800">
    <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
      Рекомендуемое количество:
    </p>
    <div className="text-3xl font-semibold text-amber-600 dark:text-amber-400">
      {count} билетов
    </div>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Стоимость: {cost} ₽
    </p>
  </div>
);

interface TicketCountInputProps {
  customTicketCount: number | null;
  calculatedTicketCount: number;
  onChange: (value: number | null) => void;
}

const TicketCountInput: React.FC<TicketCountInputProps> = ({
  customTicketCount,
  calculatedTicketCount,
  onChange,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
      Хотите изменить количество?
    </label>
    <Input
      type="text"
      value={customTicketCount?.toString() || ''}
      onChange={(e) => {
        const val = e.target.value ? parseInt(e.target.value) : null;
        onChange(val);
      }}
      min={1}
      max={1000}
      placeholder={calculatedTicketCount.toString()}
      helper="Оставьте пусто для рекомендуемого количества"
    />
  </div>
);

interface BudgetInputProps {
  budget: number;
  ticketCost: number;
  effectiveTicketCount: number;
  onChange: (value: number) => void;
}

const BudgetInput: React.FC<BudgetInputProps> = ({
  budget,
  ticketCost,
  effectiveTicketCount,
  onChange,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
      Или установите бюджет
    </label>
    <Input
      type="text"
      value={budget.toString()}
      onChange={(e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
          onChange(val);
        }
      }}
      min={ticketCost}
      step={ticketCost}
      helper="Выразится в целое число билетов"
    />
    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      = {effectiveTicketCount} билетов
    </p>
  </div>
);

interface GenerationSummaryProps {
  ticketCount: number;
  budget: number;
}

const GenerationSummary: React.FC<GenerationSummaryProps> = ({
  ticketCount,
  budget,
}) => (
  <div className="border-t border-amber-200 pt-3 dark:border-amber-800">
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      Итого к генерации:
    </p>
    <div className="mt-2 grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Билетов</p>
        <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
          {ticketCount}
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Стоимость</p>
        <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
          {budget} ₽
        </p>
      </div>
    </div>
  </div>
);
