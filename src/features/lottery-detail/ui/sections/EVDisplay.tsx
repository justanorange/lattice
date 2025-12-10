/**
 * EV Display Section
 * Expected Value calculation and profitability indicator
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { STRINGS } from '@/shared/constants';
import type { EVCalculation } from '@/entities/lottery/types';

interface EVDisplayProps {
  ticketCost: number;
  evCalculation: EVCalculation;
}

export const EVDisplay: React.FC<EVDisplayProps> = ({ ticketCost, evCalculation }) => {
  const { expectedValue, evPercent, isProfitable } = evCalculation;

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {STRINGS.detail_ev}
        </h2>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Ticket Cost */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Стоимость билета:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {ticketCost.toLocaleString()} ₽
            </span>
          </div>

          {/* Expected Value */}
          <EVValueRow
            label="Мат. ожидание:"
            value={`${expectedValue >= 0 ? '+' : ''}${expectedValue.toFixed(2)} ₽`}
            isProfitable={isProfitable}
          />

          {/* EV Percentage */}
          <EVValueRow
            label="EV%:"
            value={`${evPercent >= 0 ? '+' : ''}${evPercent.toFixed(2)}%`}
            isProfitable={isProfitable}
          />

          {/* Profitability Indicator */}
          <ProfitabilityIndicator isProfitable={isProfitable} />
        </div>
      </CardBody>
    </Card>
  );
};

interface EVValueRowProps {
  label: string;
  value: string;
  isProfitable: boolean;
}

const EVValueRow: React.FC<EVValueRowProps> = ({ label, value, isProfitable }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span
      className={`text-lg font-semibold ${
        isProfitable
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      {value}
    </span>
  </div>
);

interface ProfitabilityIndicatorProps {
  isProfitable: boolean;
}

const ProfitabilityIndicator: React.FC<ProfitabilityIndicatorProps> = ({ isProfitable }) => (
  <div
    className={`mt-4 rounded-lg border p-4 ${
      isProfitable
        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
    }`}
  >
    <div className="flex items-start gap-2">
      <span className="text-lg">{isProfitable ? '✅' : '❌'}</span>
      <div>
        <p
          className={`text-sm font-medium ${
            isProfitable
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}
        >
          {isProfitable ? 'Лотерея прибыльна' : 'Лотерея убыточна'}
        </p>
        <p
          className={`mt-1 text-xs ${
            isProfitable
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}
        >
          {isProfitable
            ? 'При текущих параметрах математическое ожидание положительное'
            : 'При текущих параметрах математическое ожидание отрицательное'}
        </p>
      </div>
    </div>
  </div>
);
