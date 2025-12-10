import { STRINGS } from '@/shared/constants';
import { Container, Grid, Card, CardHeader, CardBody, Button } from '@/shared/ui';
import { LOTTERIES_ARRAY } from '@/entities/lottery/config';
import { useLotteryStore } from '@/entities/lottery/store';

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

interface LotterySelectionPageProps {
  onSelectLottery: (lotteryId: string) => void;
}

export const LotterySelectionPage: React.FC<LotterySelectionPageProps> = ({
  onSelectLottery,
}) => {
  const { selectLottery } = useLotteryStore();

  const lotteries = LOTTERIES_ARRAY.map((lottery) => ({
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    available: LOTTERY_AVAILABILITY[lottery.id] ?? false,
  }));

  const handleSelectLottery = (lotteryId: string) => {
    selectLottery(lotteryId);
    onSelectLottery(lotteryId);
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
            <Card
              key={lottery.id}
              className={`
                cursor-pointer transition-all
                ${!lottery.available ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}
              `}
            >
              <CardHeader>
                <h3
                  className="
                    text-xl font-semibold
                    text-gray-900 dark:text-white
                  "
                >
                  {lottery.name}
                </h3>
                {!lottery.available && (
                  <span
                    className="
                      px-2 py-1
                      bg-amber-100 dark:bg-amber-900
                      text-xs text-amber-800 dark:text-amber-200
                      rounded
                    "
                  >
                    {STRINGS.lottery_coming_soon}
                  </span>
                )}
              </CardHeader>
              <CardBody>
                <p
                  className="
                    mb-4
                    text-sm text-gray-600 dark:text-gray-400
                  "
                >
                  {lottery.description || 'Russian lottery'}
                </p>
                <Button
                  variant={lottery.available ? 'primary' : 'ghost'}
                  disabled={!lottery.available}
                  onClick={() => handleSelectLottery(lottery.id)}
                  className="w-full"
                >
                  {STRINGS.lottery_details}
                </Button>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Container>
    </>
  );
};
