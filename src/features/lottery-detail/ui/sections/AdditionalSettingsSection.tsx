/**
 * Additional Settings Section
 * Variant switcher, secondary prize, average pool settings
 */

import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, CardBody, Input, Button } from '@/shared/ui';
import type { Lottery } from '@/entities/lottery/types';

interface AdditionalSettingsSectionProps {
  lottery: Lottery;
  selectedVariant?: string;
  secondaryPrize?: number;
  averagePool?: number;
  defaultSecondaryPrize?: number;
  defaultAveragePool?: number;
  onVariantChange: (variantType: string) => void;
  onSecondaryPrizeChange: (value: number) => void;
  onAveragePoolChange: (value: number) => void;
  onResetSecondaryPrize: () => void;
  onResetAveragePool: () => void;
}

const SECONDARY_PRIZE_MIN = 0;
const SECONDARY_PRIZE_MAX = 100_000_000_000; // 100 billion
const AVERAGE_POOL_MIN = 0;
const AVERAGE_POOL_MAX = 100_000_000_000; // 100 billion

export const AdditionalSettingsSection: React.FC<AdditionalSettingsSectionProps> = ({
  lottery,
  selectedVariant,
  secondaryPrize = 0,
  averagePool = 0,
  defaultSecondaryPrize = 0,
  defaultAveragePool = 0,
  onVariantChange,
  onSecondaryPrizeChange,
  onAveragePoolChange,
  onResetSecondaryPrize,
  onResetAveragePool,
}) => {
  const hasVariants = lottery.variants && lottery.variants.length > 1;
  const hasSecondaryPrize = lottery.defaultSecondaryPrize !== undefined;
  const currentVariant = lottery.variants?.find((v) => v.type === selectedVariant);
  const showAveragePool = currentVariant?.type === 'pool_percentage';

  // Local state to allow empty input while typing
  const [secondaryPrizeInput, setSecondaryPrizeInput] = useState(secondaryPrize.toString());
  const [averagePoolInput, setAveragePoolInput] = useState(averagePool.toString());

  // Sync local state when external values change
  useEffect(() => {
    setSecondaryPrizeInput(secondaryPrize.toString());
  }, [secondaryPrize]);

  useEffect(() => {
    setAveragePoolInput(averagePool.toString());
  }, [averagePool]);

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVariantChange(e.target.value);
  };

  const handleSecondaryPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSecondaryPrizeInput(inputValue);

    const value = Number.parseFloat(inputValue) || 0;
    const clampedValue = Math.max(
      SECONDARY_PRIZE_MIN,
      Math.min(SECONDARY_PRIZE_MAX, value)
    );
    onSecondaryPrizeChange(clampedValue);
  };

  const handleSecondaryPrizeBlur = () => {
    const value = Number.parseFloat(secondaryPrizeInput);
    if (Number.isNaN(value) || value < 0) {
      setSecondaryPrizeInput(defaultSecondaryPrize.toString());
      onSecondaryPrizeChange(defaultSecondaryPrize);
    }
  };

  const handleAveragePoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setAveragePoolInput(inputValue);

    const value = Number.parseFloat(inputValue) || 0;
    const clampedValue = Math.max(AVERAGE_POOL_MIN, Math.min(AVERAGE_POOL_MAX, value));
    onAveragePoolChange(clampedValue);
  };

  const handleAveragePoolBlur = () => {
    const value = Number.parseFloat(averagePoolInput);
    if (Number.isNaN(value) || value < 0) {
      setAveragePoolInput(defaultAveragePool.toString());
      onAveragePoolChange(defaultAveragePool);
    }
  };

  const isSecondaryPrizeModified = secondaryPrize !== defaultSecondaryPrize;
  const isAveragePoolModified = averagePool !== defaultAveragePool;

  // Don't show anything if lottery has no special settings
  if (!hasVariants && !hasSecondaryPrize && !showAveragePool) {
    return null;
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        {/* Variant Switcher */}
        {hasVariants && lottery.variants && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Вариант таблицы
            </label>
            <select
              value={selectedVariant || lottery.variants[0].type}
              onChange={handleVariantChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {lottery.variants.map((variant) => (
                <option key={variant.type} value={variant.type}>
                  {variant.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Average Pool (only for pool_percentage variant) */}
        {showAveragePool && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Предполагаемый размер призового фонда (₽)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={averagePoolInput}
                onChange={handleAveragePoolChange}
                onBlur={handleAveragePoolBlur}
                helper={defaultAveragePool > 0 ? `По умолчанию: ${defaultAveragePool.toLocaleString()} ₽` : undefined}
                className="flex-1"
              />
              {isAveragePoolModified && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetAveragePool}
                  title="Сбросить к значению по умолчанию"
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Secondary Prize (for 5из36+1) */}
        {hasSecondaryPrize && (
          <div className="relative">
            <Input
              type="text"
              label="Приз (₽)"
              value={secondaryPrizeInput}
              onChange={handleSecondaryPrizeChange}
              onBlur={handleSecondaryPrizeBlur}
              min={SECONDARY_PRIZE_MIN}
              max={SECONDARY_PRIZE_MAX}
              helper={`По умолчанию: ${defaultSecondaryPrize.toLocaleString()} ₽`}
              className="pr-10"
            />
            {isSecondaryPrizeModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetSecondaryPrize}
                title="Сбросить к значению по умолчанию"
                className="absolute right-1 top-8"
              >
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
