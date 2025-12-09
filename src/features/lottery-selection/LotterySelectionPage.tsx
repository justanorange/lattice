/**
 * LotterySelectionPage Component
 * Main lottery selection page
 */

import React from 'react';
import { ALL_LOTTERIES } from '../../entities/lottery/config';
import { STRINGS } from '../../shared/constants';
import { Grid, Container } from '../../shared/ui';
import { LotteryCard } from './LotteryCard';

export interface LotterySelectionPageProps {
  onSelect: (lotteryId: string) => void;
}

export const LotterySelectionPage: React.FC<LotterySelectionPageProps> = ({
  onSelect,
}) => {
  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          {STRINGS.lottery_select_title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{STRINGS.lottery_select_desc}</p>
      </div>

      <Grid cols={2} gap="md">
        {Object.values(ALL_LOTTERIES).map((lottery) => (
          <LotteryCard
            key={lottery.id}
            id={lottery.id}
            name={lottery.name}
            description={lottery.description}
            available={true}
            onSelect={onSelect}
          />
        ))}
      </Grid>
    </Container>
  );
};
