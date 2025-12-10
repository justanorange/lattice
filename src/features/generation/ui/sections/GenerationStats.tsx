/**
 * Generation Stats Section
 * Display generation result statistics
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import type { StrategyResult } from '@/entities/strategies/types';

interface GenerationStatsProps {
  result: StrategyResult;
}

export const GenerationStats: React.FC<GenerationStatsProps> = ({ result }) => {
  return (
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
  );
};
