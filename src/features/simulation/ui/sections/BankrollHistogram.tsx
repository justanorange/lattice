/**
 * Bankroll Histogram Section
 * Visual histogram showing prize distribution per round
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import { BarChart3 } from 'lucide-react';
import type { SimulationResult, PrizeTable } from '@/entities/lottery/types';

interface BankrollHistogramProps {
  result: SimulationResult;
  ticketCost: number;
  prizeTable: PrizeTable;
  superprice: number;
}

/**
 * Create histogram buckets based on actual prize table values
 */
function createHistogramBuckets(
  rounds: SimulationResult['rounds'],
  prizeTable: PrizeTable,
  superprice: number
): { label: string; count: number; color: string }[] {
  // Extract unique prize values from prize table
  const prizeValues = new Set<number>();
  prizeValues.add(0); // Always include zero
  
  for (const row of prizeTable.rows) {
    if (typeof row.prize === 'number') {
      prizeValues.add(row.prize);
    } else if (row.prize === 'Суперприз') {
      prizeValues.add(superprice);
    }
  }
  
  // Sort prize values ascending
  const sortedPrizes = Array.from(prizeValues).sort((a, b) => a - b);
  
  // Create buckets for each prize value
  const bucketMap = new Map<number, number>();
  for (const prize of sortedPrizes) {
    bucketMap.set(prize, 0);
  }
  
  // Count prizes per bucket - find closest prize value
  for (const round of rounds) {
    const prize = round.totalPrizeThisRound;
    
    // Find the bucket this prize belongs to
    let closestPrize = 0;
    for (const p of sortedPrizes) {
      if (prize >= p) {
        closestPrize = p;
      }
    }
    
    // If exact match exists, use it; otherwise use the lower bound
    if (bucketMap.has(prize)) {
      bucketMap.set(prize, (bucketMap.get(prize) || 0) + 1);
    } else {
      bucketMap.set(closestPrize, (bucketMap.get(closestPrize) || 0) + 1);
    }
  }
  
  // Color scale from gray (0) through orange to amber (jackpot)
  const colors = [
    'bg-gray-400',
    'bg-orange-100',
    'bg-yellow-100',
    'bg-orange-200',
    'bg-orange-300', 
    'bg-orange-400',
    'bg-orange-500',
    'bg-amber-600',
    'bg-amber-700',
    'bg-amber-800',
  ];
  
  // Format label
  const formatPrize = (value: number): string => {
    if (value === 0) return 'Ноль';
    if (value === superprice) return 'Суперприз';
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}млн`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}к`;
    return value.toString();
  };
  
  return sortedPrizes.map((prize, index) => ({
    label: formatPrize(prize),
    count: bucketMap.get(prize) || 0,
    color: colors[Math.min(index, colors.length - 1)],
  })).filter(b => b.count > 0);
}

export const BankrollHistogram: React.FC<BankrollHistogramProps> = ({
  result,
  ticketCost: _ticketCost,
  prizeTable,
  superprice,
}) => {
  const buckets = createHistogramBuckets(result.rounds, prizeTable, superprice);

  const maxCount = Math.max(...buckets.map(b => b.count));
  const totalRounds = result.roundsCount;

  return (
    <Card>
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
                  <span className="text-gray-600 dark:text-gray-400">
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
