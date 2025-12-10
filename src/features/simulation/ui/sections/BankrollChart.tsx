/**
 * Bankroll Chart Section
 * Display bankroll dynamics
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import type { SimulationResult } from '@/entities/lottery/types';

interface BankrollChartProps {
  result: SimulationResult;
}

export const BankrollChart: React.FC<BankrollChartProps> = ({ result }) => {
  const finalBankroll = result.rounds[result.rounds.length - 1]?.bankroll ?? 0;
  const isProfitable = finalBankroll >= 0;

  return (
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
                isProfitable
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {finalBankroll.toLocaleString()} ₽
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
