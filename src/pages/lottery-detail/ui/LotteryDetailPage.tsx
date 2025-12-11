/**
 * Lottery Detail Page
 * FSD Page layer - owns layout, header, navigation
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Container, PageHeader, Button } from '@/shared/ui';
import { useLotteryDetail, clampSuperprice } from '@/features/lottery-detail/model';
import {
  TicketSettings,
  AdditionalSettingsSection,
  PrizeTableSection,
  EVDisplay,
  EVChart,
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
    selectedVariant,
    secondaryPrize,
    defaultSecondaryPrize,
    averagePool,
    defaultAveragePool,
    updateTicketCost,
    updateSuperprice,
    updateSecondaryPrize,
    updateAveragePool,
    selectVariant,
    updatePrizeRow,
    resetPrizeTable,
    resetTicketCost,
    resetSuperprice,
    resetSecondaryPrize,
    resetAveragePool,
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

      <div className="space-y-5 mb-6">
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

        <AdditionalSettingsSection
          lottery={lottery}
          selectedVariant={selectedVariant}
          secondaryPrize={secondaryPrize}
          averagePool={averagePool}
          defaultSecondaryPrize={defaultSecondaryPrize}
          defaultAveragePool={defaultAveragePool}
          onVariantChange={selectVariant}
          onSecondaryPrizeChange={updateSecondaryPrize}
          onAveragePoolChange={updateAveragePool}
          onResetSecondaryPrize={resetSecondaryPrize}
          onResetAveragePool={resetAveragePool}
        />

        <PrizeTableSection
          lottery={lottery}
          prizeTable={prizeTable}
          superprice={superprice}
          secondaryPrize={secondaryPrize}
          averagePool={averagePool}
          ticketCost={ticketCost}
          onUpdateRow={updatePrizeRow}
          onReset={resetPrizeTable}
        />

        <EVDisplay
          ticketCost={ticketCost}
          evCalculation={evCalculation}
        />

        <EVChart
          lottery={lottery}
          prizeTable={prizeTable}
          ticketCost={ticketCost}
          currentSuperprice={superprice}
        />

        <Button onClick={handleNext} variant="primary" className="w-full">
          Выбрать стратегию
        </Button>
      </div>
    </Container>
  );
};
