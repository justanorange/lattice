import { useState } from 'react';
import { STRINGS } from '../shared/constants';
import { Container, Grid, Card, CardHeader, CardBody, Button, Spinner, Alert } from '../shared/ui';
import { LOTTERIES_ARRAY } from '../entities/lottery/config';
import { useLotteryStore } from '../entities/lottery/store';
import { LotteryDetailPage } from '../features/lottery-detail/LotteryDetailPage';
import { StrategySelectionPage } from '../features/strategy-selection/StrategySelectionPage';
import { GenerationPage } from '../features/generation/GenerationPage';
import { SimulationPage } from '../features/simulation/SimulationPage';
import './styles/App.css';
import { ThemeMode } from '@/widgets/theme-mode/ui/ThemeMode';

/**
 * MVP: Only first lottery (8+1) is available
 */
const LOTTERY_AVAILABILITY: Record<string, boolean> = {
  lottery_8_1: true, // MVP: Only this lottery is active
  lottery_4_20: false,
  lottery_12_24: false,
  lottery_5_36_1: false,
  lottery_6_45: false,
  lottery_7_49: false,
};

function App() {
  const [currentPage, setCurrentPage] = useState<'lottery' | 'detail' | 'strategy' | 'generation' | 'simulation'>('lottery');
  const [selectedLotteryId, setSelectedLotteryId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('max_coverage');
  const [selectedStrategyParams, setSelectedStrategyParams] = useState<Record<string, unknown>>({ budget: 1000 });
  const [selectedStrategyTicketCount, setSelectedStrategyTicketCount] = useState<number>(10);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectLottery } = useLotteryStore();

  const lotteries = LOTTERIES_ARRAY.map((lottery) => ({
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    available: LOTTERY_AVAILABILITY[lottery.id] ?? false,
  }));

  const handleSelectLottery = (lotteryId: string) => {
    selectLottery(lotteryId);
    setSelectedLotteryId(lotteryId);
    setCurrentPage('detail');
    setError(null);
  };

  const handleNextPage = () => {
    if (currentPage === 'detail') {
      setCurrentPage('strategy');
    } else if (currentPage === 'strategy') {
      setCurrentPage('generation');
    }
  };

  const handlePrevPage = () => {
    if (currentPage === 'simulation') {
      setCurrentPage('generation');
    } else if (currentPage === 'generation') {
      setCurrentPage('strategy');
    } else if (currentPage === 'strategy') {
      setCurrentPage('detail');
    } else if (currentPage === 'detail') {
      setCurrentPage('lottery');
      setSelectedLotteryId(null);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-end p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
        <ThemeMode></ThemeMode>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Container>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : currentPage === 'lottery' ? (
            // Page: Lottery Selection
            <>
              <header className="h-[72px] inset-x-16 top-0 z-20 flex flex-col items-center justify-center fixed">
                <h1 className="text-center text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                  {STRINGS.lottery_select_title}
                </h1>
              </header>
              <div>
                <Grid cols={2} gap="md">
                  {lotteries.map((lottery) => (
                    <Card
                      key={lottery.id}
                      className={`cursor-pointer transition-all ${
                        !lottery.available ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
                      }`}
                    >
                      <CardHeader>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {lottery.name}
                        </h3>
                        {!lottery.available && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                            {STRINGS.lottery_coming_soon}
                          </span>
                        )}
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
              </div>
            </>
          ) : currentPage === 'detail' ? (
            // Page: Lottery Detail
            selectedLotteryId && (
              <LotteryDetailPage
                lotteryId={selectedLotteryId}
                onNext={handleNextPage}
                onBack={handlePrevPage}
              />
            )
          ) : currentPage === 'strategy' ? (
            // Page: Strategy Selection
            <StrategySelectionPage
              onNext={(strategyId: string, params: Record<string, unknown>, ticketCount: number) => {
                setSelectedStrategyId(strategyId);
                setSelectedStrategyParams(params);
                setSelectedStrategyTicketCount(ticketCount);
                setCurrentPage('generation');
              }}
              onBack={handlePrevPage}
            />
          ) : currentPage === 'generation' ? (
            // Page: Generation
            selectedLotteryId && (
              <GenerationPage
                strategyId={selectedStrategyId}
                strategyParams={selectedStrategyParams}
                ticketCount={selectedStrategyTicketCount}
                onBack={handlePrevPage}
              />
            )
          ) : (
            // Page: Simulation
            <SimulationPage
              onBack={handlePrevPage}
            />
          )}
        </Container>
      </main>

    </div>
  );
}

export default App;
