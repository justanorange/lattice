/**
 * Simulation Statistics Section
 * Display simulation result statistics
 */

import { Card, CardHeader, CardBody } from '@/shared/ui';
import type { SimulationResult } from '@/entities/lottery/types';

interface SimulationStatsProps {
  result: SimulationResult;
}

export const SimulationStats: React.FC<SimulationStatsProps> = ({ result }) => {
  const { statistics } = result;

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Статистика
        </h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Всего инвестировано"
            value={`${statistics.totalInvestment.toLocaleString()} ₽`}
          />
          <StatItem
            label="Всего выиграно"
            value={`${statistics.totalWon.toLocaleString()} ₽`}
            variant="success"
          />
          <StatItem
            label="Чистая прибыль"
            value={`${statistics.netReturn >= 0 ? '+' : ''}${statistics.netReturn.toLocaleString()} ₽`}
            variant={statistics.netReturn >= 0 ? 'success' : 'error'}
          />
          <StatItem
            label="ROI"
            value={`${statistics.roi >= 0 ? '+' : ''}${statistics.roi.toFixed(2)}%`}
            variant={statistics.roi >= 0 ? 'success' : 'error'}
          />
          <StatItem
            label="Тиражей без выигрыша"
            value={`${statistics.zeroWinRounds} (${statistics.zeroWinPercent.toFixed(1)}%)`}
            size="sm"
          />
          <StatItem
            label="Максимальный выигрыш"
            value={`${statistics.maxPrizeInRound.toLocaleString()} ₽`}
            variant="success"
            size="sm"
          />
        </div>
      </CardBody>
    </Card>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'error';
  size?: 'default' | 'sm';
}

const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  variant = 'default',
  size = 'default',
}) => {
  const colorClass = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
  }[variant];

  const sizeClass = size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className={`font-semibold ${sizeClass} ${colorClass}`}>{value}</p>
    </div>
  );
};
