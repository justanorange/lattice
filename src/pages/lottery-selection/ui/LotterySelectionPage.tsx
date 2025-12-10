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
                'relative w-full rounded-2xl overflow-hidden text-left transition-all',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800 shadow-card',
                lottery.available && 'hover:border-amber-400 hover:shadow-lg active:scale-[0.98] cursor-pointer',
                !lottery.available && 'grayscale'
              )}
            >
              {/* Coming soon badge - absolute overlay */}
              {!lottery.available && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40">
                  <span className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                    {STRINGS.lottery_coming_soon}
                  </span>
                </div>
              )}

              {/* Top: Visual grid area - fixed height */}
              <div className="flex items-center justify-center h-28 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
                <LotteryGrid lotteryId={lottery.id} size="sm" />
              </div>

              {/* Bottom: Text area */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {lottery.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {lottery.description}
                </p>
              </div>
            </button>
          ))}
        </Grid>
      </Container>
    </>
  );
};
