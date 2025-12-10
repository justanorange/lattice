/**
 * LotteryDetailFeature Component
 * Display lottery details, editable superprice, prize table, EV calculation
 * Refactored to use section components
 */

import React from 'react';
import { Container } from '@/shared/ui';
import { useLotteryDetail, clampSuperprice } from '../model';
import {
  DetailHeader,
  TicketSettings,
  PrizeTableSection,
  EVDisplay,
  NavigationSection,
} from './sections';

export interface LotteryDetailFeatureProps {
  lotteryId: string;
  onNext?: () => void;
  onBack?: () => void;
}

/**
 * Lottery Detail Feature Component
 * Shows lottery info, superprice editor, prize table, EV calculation
 */
export const LotteryDetailFeature: React.FC<LotteryDetailFeatureProps> = ({
  lotteryId,
  onNext,
  onBack,
}) => {
  const {
    lottery,
    ticketCost,
    superprice,
    prizeTable,
    evCalculation,
    updateTicketCost,
    updateSuperprice,
    updatePrizeRow,
    resetPrizeTable,
  } = useLotteryDetail(lotteryId);

  const handleSuperpriceChange = React.useCallback(
    (value: number) => {
      updateSuperprice(clampSuperprice(value));
    },
    [updateSuperprice]
  );

  const handleTicketCostChange = React.useCallback(
    (value: number) => {
      if (value > 0) {
        updateTicketCost(value);
      }
    },
    [updateTicketCost]
  );

  return (
    <Container>
      <DetailHeader
        lottery={lottery}
        onBack={onBack}
      />

      <TicketSettings
        ticketCost={ticketCost}
        superprice={superprice}
        onTicketCostChange={handleTicketCostChange}
        onSuperpriceChange={handleSuperpriceChange}
      />

      <PrizeTableSection
        lottery={lottery}
        prizeTable={prizeTable}
        onUpdateRow={updatePrizeRow}
        onReset={resetPrizeTable}
      />

      <EVDisplay
        ticketCost={ticketCost}
        evCalculation={evCalculation}
      />

      {onNext && (
        <NavigationSection onContinue={onNext} />
      )}
    </Container>
  );
};
