/**
 * Strategy List Section
 * Available strategies for selection with collapsible behavior
 */

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody, Grid } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
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
  // Auto-collapse when a strategy is selected
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedStrategy = strategies.find(s => s.id === selectedId);

  // Collapse after first selection
  useEffect(() => {
    if (selectedId) {
      setIsExpanded(false);
    }
  }, [selectedId]);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer select-none border-b-0 pb-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedStrategy ? selectedStrategy.name : 'Выберите стратегию'}
            </h2>
            {selectedStrategy && !isExpanded && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {selectedStrategy.description}
              </p>
            )}
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-gray-500 transition-transform',
              isExpanded && 'rotate-180'
            )} 
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
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
      )}
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
          : 'border-gray-200 hover:border-amber-300 dark:border-gray-800'
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
