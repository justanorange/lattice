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
 * Create histogram buckets for prize amounts
 */
function createHistogramBuckets(
  rounds: SimulationResult['rounds'],
  ticketCost: number,
  ticketCount: number
): { label: string; count: number; color: string }[] {
  const roundCost = ticketCost * ticketCount;
  
  // Count rounds by result type
  let zeroWins = 0;
  let smallWins = 0; // less than cost
  let breakEven = 0; // around cost
  let goodWins = 0; // 1-10x cost
  let bigWins = 0; // 10-100x cost
  let hugeWins = 0; // 100x+ cost

  for (const round of rounds) {
    const prize = round.totalPrizeThisRound;
    
    if (prize === 0) {
      zeroWins++;
    } else if (prize < roundCost * 0.5) {
      smallWins++;
    } else if (prize < roundCost * 2) {
      breakEven++;
    } else if (prize < roundCost * 10) {
      goodWins++;
    } else if (prize < roundCost * 100) {
      bigWins++;
    } else {
      hugeWins++;
    }
  }

  return [
    { label: 'Без выигрыша', count: zeroWins, color: 'bg-gray-400' },
    { label: `< ${Math.round(roundCost * 0.5)} ₽`, count: smallWins, color: 'bg-red-400' },
    { label: `~затраты`, count: breakEven, color: 'bg-yellow-400' },
    { label: `x2-10`, count: goodWins, color: 'bg-green-400' },
    { label: `x10-100`, count: bigWins, color: 'bg-blue-400' },
    { label: `x100+`, count: hugeWins, color: 'bg-purple-400' },
  ].filter(b => b.count > 0);
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
            Гистограмма выигрышей
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Распределение размера выигрышей по тиражам
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {buckets.map((bucket, index) => {
            const percent = (bucket.count / totalRounds) * 100;
            const barWidth = (bucket.count / maxCount) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {bucket.label}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {bucket.count.toLocaleString('ru-RU')} ({percent.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all ${bucket.color}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            * Категории показывают размер выигрыша за тираж относительно затрат ({(ticketCost * result.tickets.length).toLocaleString('ru-RU')} ₽ за тираж)
          </p>
        </div>
      </CardBody>
    </Card>
  );
};
