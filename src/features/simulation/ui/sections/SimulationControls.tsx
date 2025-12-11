/**
 * Simulation Controls Section
 * Round count slider and run button with collapsible parameters
 */

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Input, Slider } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';

interface SimulationControlsProps {
  roundsCount: number;
  onRoundsChange: (count: number) => void;
  onRun: () => void;
  isRunning: boolean;
  hasTickets: boolean;
  hasResult?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  roundsCount,
  onRoundsChange,
  onRun,
  isRunning,
  hasTickets,
  hasResult = false,
}) => {
  // Auto-collapse parameters after first simulation
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (hasResult) {
      setIsExpanded(false);
    }
  }, [hasResult]);

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Параметры симуляции
            </h2>
            {!isExpanded && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {roundsCount.toLocaleString()} тиражей
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
        <CardBody className="space-y-4">
          <Slider
            label="Количество тиражей"
            value={roundsCount}
            onValueChange={(value) => onRoundsChange(value[0])}
            min={10}
            max={10000}
            step={10}
            helper="Выберите количество тиражей для симуляции (10-10000)"
          />
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={roundsCount.toString()}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value) || 100;
                onRoundsChange(Math.max(10, Math.min(10000, value)));
              }}
              min={10}
              max={10000}
              className="w-32"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              тиражей
            </span>
          </div>
        </CardBody>
      )}
      
      <CardBody className={isExpanded ? 'pt-4' : 'pt-0'}>
        <Button
          onClick={onRun}
          disabled={isRunning || !hasTickets}
          className="w-full"
        >
          {isRunning ? 'Запуск симуляции...' : 'Симулировать'}
        </Button>
      </CardBody>
    </Card>
  );
};
