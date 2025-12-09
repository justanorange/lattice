/**
 * LotterySelectionPage Component
 * Main lottery selection page
 */

import React from "react";
import { LOTTERIES_ARRAY } from "../../entities/lottery/config";
import { STRINGS } from "../../shared/constants";
import { Grid, Container } from "../../shared/ui";
import { LotteryCard } from "./LotteryCard";

/**
 * MVP: Only first lottery (8+1) is available
 */
export const LOTTERY_AVAILABILITY: Record<string, boolean> = {
  lottery_8_1: true, // MVP: Only this lottery is active
  lottery_4_20: false,
  lottery_12_24: false,
  lottery_5_36_1: false,
  lottery_6_45: false,
  lottery_7_49: false,
};

export interface LotteryListItem {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export const buildLotteryList = (source = LOTTERIES_ARRAY): LotteryListItem[] =>
  source.map((lottery) => ({
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    available: LOTTERY_AVAILABILITY[lottery.id] ?? false,
  }));

export interface LotterySelectionPageProps {
  onSelect: (lotteryId: string) => void;
  isLoading?: boolean;
}

export const LotterySelectionPage: React.FC<LotterySelectionPageProps> = ({
  onSelect,
  isLoading = false,
}) => {
  const lotteryItems = buildLotteryList();

  return (
    <Container>
      <div className="mb-8 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-100">
          {STRINGS.lottery_select_title}
        </span>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
          {STRINGS.lottery_select_desc}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Выберите лотерею для расчёта вероятностей, стратегий и генерации билетов.
        </p>
      </div>

      <Grid cols={2} gap="md">
        {lotteryItems.map((lottery) => (
          <LotteryCard
            key={lottery.id}
            id={lottery.id}
            name={lottery.name}
            description={lottery.description}
            available={lottery.available && !isLoading}
            onSelect={onSelect}
          />
        ))}
      </Grid>
    </Container>
  );
};
