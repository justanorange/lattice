/**
 * Tickets Grid Section
 * Display generated tickets visualization
 */

import { Card, CardHeader, CardBody, TicketVisualization } from '@/shared/ui';
import type { StrategyResult } from '@/entities/strategies/types';
import type { Lottery } from '@/entities/lottery/types';

interface TicketsGridProps {
  result: StrategyResult;
  lottery: Lottery;
}

export const TicketsGrid: React.FC<TicketsGridProps> = ({ result, lottery }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Визуализация билетов
        </h2>
      </CardHeader>
      <CardBody>
        <div className="grid max-h-screen grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
          {result.tickets.map((ticket, index) => (
            <div key={index}>
              <div className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                Билет #{index + 1}
              </div>
              <TicketVisualization
                ticket={ticket}
                lottery={lottery}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
