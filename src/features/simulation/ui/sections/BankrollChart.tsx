/**
 * Bankroll Chart Section
 * Display bankroll dynamics with explanation
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { Info } from 'lucide-react';
import type { SimulationResult } from '@/entities/lottery/types';

interface BankrollChartProps {
  result: SimulationResult;
}

export const BankrollChart: React.FC<BankrollChartProps> = ({ result }) => {
  const finalBankroll = result.rounds[result.rounds.length - 1]?.bankroll ?? 0;
  const isProfitable = finalBankroll >= 0;
  const totalInvestment = result.statistics.totalInvestment;

  // Find min and max bankroll
  const bankrollValues = result.rounds.map((r) => r.bankroll);
  const minBankroll = Math.min(...bankrollValues);
  const maxBankroll = Math.max(...bankrollValues);

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Динамика банкролла
        </h2>
      </CardHeader>
      <CardBody>
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Банкролл</strong> — это ваш игровой баланс. Начинается с 0 ₽. 
            Каждый тираж вы тратите на билеты и получаете выигрыши (если есть). 
            Отрицательный банкролл означает, что вы потратили больше, чем выиграли.
          </p>
        </div>

        <div className="space-y-3 text-sm">
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
              Всего потрачено:
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              −{totalInvestment.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Минимальный баланс:
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {minBankroll.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Максимальный баланс:
            </span>
            <span
              className={`font-medium ${
                maxBankroll >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {maxBankroll.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Финальный баланс:
              </span>
              <span
                className={`text-lg font-semibold ${
                  isProfitable
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {finalBankroll.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
