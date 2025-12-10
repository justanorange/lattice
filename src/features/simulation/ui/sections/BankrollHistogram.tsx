/**
 * Bankroll Histogram Section
 * Visual histogram showing prize distribution per round
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { BarChart3 } from 'lucide-react';
import type { SimulationResult } from '@/entities/lottery/types';

interface BankrollHistogramProps {
  result: SimulationResult;
  ticketCost: number;
}

/**
 * Create histogram buckets for prize amounts per round
 * Uses actual prize ranges rather than multiples of cost
 */
function createHistogramBuckets(
  rounds: SimulationResult['rounds'],
  _ticketCost: number,
  _ticketCount: number
): { label: string; count: number; color: string; range: string }[] {
  // Define meaningful prize ranges
  const buckets: { label: string; min: number; max: number; count: number; color: string }[] = [
    { label: 'Ноль', min: 0, max: 0, count: 0, color: 'bg-gray-400' },
    { label: '1-100', min: 1, max: 100, count: 0, color: 'bg-red-300' },
    { label: '100-500', min: 100, max: 500, count: 0, color: 'bg-red-400' },
    { label: '500-1к', min: 500, max: 1000, count: 0, color: 'bg-orange-400' },
    { label: '1к-5к', min: 1000, max: 5000, count: 0, color: 'bg-yellow-400' },
    { label: '5к-10к', min: 5000, max: 10000, count: 0, color: 'bg-lime-400' },
    { label: '10к-50к', min: 10000, max: 50000, count: 0, color: 'bg-green-400' },
    { label: '50к-100к', min: 50000, max: 100000, count: 0, color: 'bg-teal-400' },
    { label: '100к-1млн', min: 100000, max: 1000000, count: 0, color: 'bg-blue-400' },
    { label: '1млн+', min: 1000000, max: Infinity, count: 0, color: 'bg-purple-500' },
  ];

  for (const round of rounds) {
    const prize = round.totalPrizeThisRound;
    
    for (const bucket of buckets) {
      if (bucket.min === 0 && prize === 0) {
        bucket.count++;
        break;
      } else if (prize > bucket.min && prize <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  // Return only non-empty buckets with range description
  return buckets
    .filter(b => b.count > 0)
    .map(b => ({
      label: b.label,
      count: b.count,
      color: b.color,
      range: b.min === 0 ? 'без выигрыша' : 
             b.max === Infinity ? `>${b.min.toLocaleString('ru-RU')}₽` :
             `${b.min.toLocaleString('ru-RU')}-${b.max.toLocaleString('ru-RU')}₽`
    }));
}

export const BankrollHistogram: React.FC<BankrollHistogramProps> = ({
  result,
  ticketCost,
}) => {
  const buckets = createHistogramBuckets(
    result.rounds,
    ticketCost,
    result.tickets.length
  );

  const maxCount = Math.max(...buckets.map(b => b.count));
  const totalRounds = result.roundsCount;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Распределение выигрышей
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Сколько тиражей попало в каждый диапазон выигрыша
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          {buckets.map((bucket, index) => {
            const percent = (bucket.count / totalRounds) * 100;
            const barWidth = (bucket.count / maxCount) * 100;

            return (
              <div key={index} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400" title={bucket.range}>
                    {bucket.label}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bucket.count.toLocaleString('ru-RU')} ({percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all ${bucket.color}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Всего {totalRounds.toLocaleString('ru-RU')} тиражей
        </div>
      </CardBody>
    </Card>
  );
};
