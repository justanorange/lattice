/**
 * LotteryCard Component
 * Display lottery with visual grid and selection option
 */

import React from "react";
import { Card, CardHeader, CardBody, Button, LotteryGrid } from "../../shared/ui";

export interface LotteryCardProps {
  id: string;
  name: string;
  description: string;
  available: boolean;
  onSelect: (lotteryId: string) => void;
}

export const LotteryCard: React.FC<LotteryCardProps> = ({
  id,
  name,
  description,
  available,
  onSelect,
}) => {
  return (
    <Card
      className={`border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-card ${
        !available ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {!available && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            Скоро
          </span>
        )}
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {/* Visual grid representation */}
        <div className="flex justify-center py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <LotteryGrid lotteryId={id} size="sm" />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
          <span>{available ? "Доступна для расчётов" : "Скоро станет доступна"}</span>
        </div>
        <Button
          variant={available ? "primary" : "ghost"}
          disabled={!available}
          onClick={() => available && onSelect(id)}
          className="w-full"
        >
          {available ? "Выбрать" : "Ожидайте"}
        </Button>
      </CardBody>
    </Card>
  );
};
