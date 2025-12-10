/**
 * Lottery Detail Page
 * FSD Page layer - owns layout, header, navigation
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Container, PageHeader, Button } from '@/shared/ui';
import { useLotteryDetail, clampSuperprice } from '@/features/lottery-detail/model';
import {
  TicketSettings,
  PrizeTableSection,
  EVDisplay,
} from '@/features/lottery-detail/ui/sections';
import { buildRoute } from '@/app/router';

export const LotteryDetailPage: React.FC = () => {
  const { lotteryId } = useParams<{ lotteryId: string }>();
  const navigate = useNavigate();

  // Redirect if no lotteryId
  if (!lotteryId) {
    navigate('/');
    return null;
  }

  const {
    lottery,
    ticketCost,
    superprice,
    prizeTable,
    evCalculation,
    defaultTicketCost,
    defaultSuperprice,
    updateTicketCost,
    updateSuperprice,
    updatePrizeRow,
    resetPrizeTable,
    resetTicketCost,
    resetSuperprice,
  } = useLotteryDetail(lotteryId);

  const handleBack = () => navigate('/');
  const handleNext = () => navigate(buildRoute.strategy(lotteryId));

  const handleSuperpriceChange = (value: number) => {
    updateSuperprice(clampSuperprice(value));
  };

  const handleTicketCostChange = (value: number) => {
    if (value > 0) updateTicketCost(value);
  };

  return (
    <Container>
      <PageHeader
        title={lottery.name}
        subtitle={lottery.description}
        onBack={handleBack}
      />

      <TicketSettings
        ticketCost={ticketCost}
        superprice={superprice}
        defaultTicketCost={defaultTicketCost}
        defaultSuperprice={defaultSuperprice}
        onTicketCostChange={handleTicketCostChange}
        onSuperpriceChange={handleSuperpriceChange}
        onResetTicketCost={resetTicketCost}
        onResetSuperprice={resetSuperprice}
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

      <div className="mb-6">
        <Button onClick={handleNext} variant="primary" className="w-full">
          Выбрать стратегию
        </Button>
      </div>
    </Container>
  );
};
