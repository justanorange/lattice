import { useNavigate } from 'react-router-dom';
import { STRINGS } from '@/shared/constants';
import { Container, Grid, LotteryGrid } from '@/shared/ui';
import { LOTTERIES_ARRAY } from '@/entities/lottery/config';
import { useLotteryStore } from '@/entities/lottery/store';
import { buildRoute } from '@/app/router';
import { cn } from '@/shared/lib/utils';

/**
 * MVP: Only first lottery (8+1) is available
 */
const LOTTERY_AVAILABILITY: Record<string, boolean> = {
  lottery_8_1: true,
  lottery_4_20: false,
  lottery_12_24: false,
  lottery_5_36_1: false,
  lottery_6_45: false,
  lottery_7_49: false,
};

export const LotterySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectLottery } = useLotteryStore();

  const lotteries = LOTTERIES_ARRAY.map((lottery) => ({
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    available: LOTTERY_AVAILABILITY[lottery.id] ?? false,
  }));

  const handleSelectLottery = (lotteryId: string) => {
    selectLottery(lotteryId);
    navigate(buildRoute.lotteryDetail(lotteryId));
  };

  return (
    <>
      <header
        className="
          h-[72px] inset-x-16 top-0 z-20
          flex flex-col items-center justify-center
          fixed
        "
      >
        <h1
          className="
            text-center text-xl font-semibold leading-tight
            text-gray-900 dark:text-white
          "
        >
          {STRINGS.lottery_select_title}
        </h1>
      </header>
      <Container>
        <Grid cols={2} gap="md">
          {lotteries.map((lottery) => (
            <button
              key={lottery.id}
              type="button"
              onClick={() => lottery.available && handleSelectLottery(lottery.id)}
              disabled={!lottery.available}
              className={cn(
                'w-full rounded-2xl p-5 text-left transition-all',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800 shadow-card',
                lottery.available && 'hover:border-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer',
                !lottery.available && 'opacity-60 cursor-not-allowed'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lottery.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lottery.description}
                  </p>
                </div>
                {!lottery.available && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    {STRINGS.lottery_coming_soon}
                  </span>
                )}
              </div>

              {/* Visual grid representation */}
              <div className="flex justify-center py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4">
                <LotteryGrid lotteryId={lottery.id} size="sm" />
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  lottery.available ? 'bg-amber-500' : 'bg-gray-400'
                )} />
                <span>{lottery.available ? 'Доступна для расчётов' : 'Скоро станет доступна'}</span>
              </div>
            </button>
          ))}
        </Grid>
      </Container>
    </>
  );
};
