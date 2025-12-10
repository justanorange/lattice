/**
 * Strategy List Section
 * Available strategies for selection
 */

import { Card, CardHeader, CardBody, Grid } from '@/shared/ui';
import type { Strategy } from '@/entities/strategies/types';

interface StrategyListProps {
  strategies: Strategy[];
  selectedId: string;
  onSelect: (strategyId: string) => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  selectedId,
  onSelect,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Доступные стратегии
        </h2>
      </CardHeader>
      <CardBody>
        <Grid cols={1} gap="md">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isSelected={selectedId === strategy.id}
              onSelect={() => onSelect(strategy.id)}
            />
          ))}
        </Grid>
      </CardBody>
    </Card>
  );
};

interface StrategyCardProps {
  strategy: Strategy;
  isSelected: boolean;
  onSelect: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={`rounded-lg border-2 p-4 text-left transition ${
        isSelected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
          : 'border-gray-200 hover:border-amber-300 dark:border-gray-700'
      }`}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {strategy.name}
      </h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {strategy.description}
      </p>
    </button>
  );
};
