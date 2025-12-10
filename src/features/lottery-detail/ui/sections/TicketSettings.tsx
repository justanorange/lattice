/**
 * Ticket Settings Section
 * Ticket cost and superprice inputs with reset buttons
 */

import { RotateCcw } from 'lucide-react';
import { Card, CardBody, Input, Button } from '@/shared/ui';

interface TicketSettingsProps {
  ticketCost: number;
  superprice: number;
  defaultTicketCost: number;
  defaultSuperprice: number;
  onTicketCostChange: (value: number) => void;
  onSuperpriceChange: (value: number) => void;
  onResetTicketCost: () => void;
  onResetSuperprice: () => void;
}

const SUPERPRICE_MIN = 0;
const SUPERPRICE_MAX = 500_000_000;
const SUPERPRICE_STEP = 1_000_000;

export const TicketSettings: React.FC<TicketSettingsProps> = ({
  ticketCost,
  superprice,
  defaultTicketCost,
  defaultSuperprice,
  onTicketCostChange,
  onSuperpriceChange,
  onResetTicketCost,
  onResetSuperprice,
}) => {
  const handleTicketCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      onTicketCostChange(value);
    }
  };

  const handleSuperpriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(SUPERPRICE_MIN, Math.min(SUPERPRICE_MAX, value));
    onSuperpriceChange(clampedValue);
  };

  const isTicketCostModified = ticketCost !== defaultTicketCost;
  const isSuperpriceModified = superprice !== defaultSuperprice;

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                type="text"
                label="Цена (₽)"
                value={ticketCost.toString()}
                onChange={handleTicketCostChange}
                helper={`По умолчанию: ${defaultTicketCost} ₽`}
              />
            </div>
            {isTicketCostModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetTicketCost}
                title="Сбросить к значению по умолчанию"
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                type="text"
                label="Суперприз (₽)"
                value={superprice.toString()}
                onChange={handleSuperpriceChange}
                min={SUPERPRICE_MIN}
                max={SUPERPRICE_MAX}
                step={SUPERPRICE_STEP}
                helper={`По умолчанию: ${defaultSuperprice.toLocaleString()} ₽`}
              />
            </div>
            {isSuperpriceModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetSuperprice}
                title="Сбросить к значению по умолчанию"
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
