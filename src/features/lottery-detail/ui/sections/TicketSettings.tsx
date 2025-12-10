/**
 * Ticket Settings Section
 * Ticket cost and superprice inputs
 */

import { Card, CardBody, Input } from '@/shared/ui';

interface TicketSettingsProps {
  ticketCost: number;
  superprice: number;
  onTicketCostChange: (value: number) => void;
  onSuperpriceChange: (value: number) => void;
}

const SUPERPRICE_MIN = 0;
const SUPERPRICE_MAX = 500_000_000;
const SUPERPRICE_STEP = 1_000_000;

export const TicketSettings: React.FC<TicketSettingsProps> = ({
  ticketCost,
  superprice,
  onTicketCostChange,
  onSuperpriceChange,
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

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardBody className="space-y-4">
          <Input
            type="text"
            label="Цена (₽)"
            value={ticketCost.toString()}
            onChange={handleTicketCostChange}
            helper="Введите стоимость одного билета в рублях"
          />
          <Input
            type="text"
            label="Суперприз (₽)"
            value={superprice.toString()}
            onChange={handleSuperpriceChange}
            min={SUPERPRICE_MIN}
            max={SUPERPRICE_MAX}
            step={SUPERPRICE_STEP}
            helper={`Мин: ${(SUPERPRICE_MIN / 1_000_000).toLocaleString()} млн ₽`}
          />
        </CardBody>
      </Card>
    </div>
  );
};
