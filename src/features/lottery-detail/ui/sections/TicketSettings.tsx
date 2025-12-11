/**
 * Ticket Settings Section
 * Ticket cost and superprice inputs with reset buttons
 */

import { useState, useEffect } from 'react';
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
  // Local state to allow empty input while typing
  const [ticketCostInput, setTicketCostInput] = useState(ticketCost.toString());
  const [superpriceInput, setSuperpriceInput] = useState(superprice.toString());

  // Sync local state when external value changes
  useEffect(() => {
    setTicketCostInput(ticketCost.toString());
  }, [ticketCost]);

  useEffect(() => {
    setSuperpriceInput(superprice.toString());
  }, [superprice]);

  const handleTicketCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTicketCostInput(inputValue);
    
    const value = Number.parseFloat(inputValue);
    if (!Number.isNaN(value) && value > 0) {
      onTicketCostChange(value);
    }
  };

  const handleTicketCostBlur = () => {
    const value = Number.parseFloat(ticketCostInput);
    if (Number.isNaN(value) || value <= 0) {
      // Reset to default if empty or invalid
      setTicketCostInput(defaultTicketCost.toString());
      onTicketCostChange(defaultTicketCost);
    }
  };

  const handleSuperpriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSuperpriceInput(inputValue);
    
    const value = Number.parseFloat(inputValue) || 0;
    const clampedValue = Math.max(SUPERPRICE_MIN, Math.min(SUPERPRICE_MAX, value));
    onSuperpriceChange(clampedValue);
  };

  const isTicketCostModified = ticketCost !== defaultTicketCost;
  const isSuperpriceModified = superprice !== defaultSuperprice;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardBody className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              label="Цена (₽)"
              value={ticketCostInput}
              onChange={handleTicketCostChange}
              onBlur={handleTicketCostBlur}
              helper={`По умолчанию: ${defaultTicketCost} ₽`}
              className="pr-10"
            />
            {isTicketCostModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetTicketCost}
                title="Сбросить к значению по умолчанию"
                className="absolute right-1 top-8"
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              type="text"
              label="Суперприз (₽)"
              value={superpriceInput}
              onChange={handleSuperpriceChange}
              min={SUPERPRICE_MIN}
              max={SUPERPRICE_MAX}
              step={SUPERPRICE_STEP}
              helper={`По умолчанию: ${defaultSuperprice.toLocaleString()} ₽`}
              className="pr-10"
            />
            {isSuperpriceModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetSuperprice}
                title="Сбросить к значению по умолчанию"
                className="absolute right-1 top-8"
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
