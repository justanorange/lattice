import { useState } from 'react';
import { STRINGS, LOTTERY_STRATEGIES } from '../shared/constants';
import { Container, Stack, Grid, Card, CardHeader, CardBody, Button, Spinner, Alert } from '../shared/ui';
import { useTheme } from '../shared/hooks';
import { LOTTERIES_ARRAY } from '../entities/lottery/config';
import { useLotteryStore } from '../entities/lottery/store';
import { LotterySelectionPage } from '../features/lottery-selection/LotterySelectionPage';
import { LotteryDetailPage } from '../features/lottery-detail/LotteryDetailPage';
import './styles/App.css';

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
  const { isDark, setTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<'lottery' | 'detail' | 'strategy' | 'generation'>('lottery');
  const [selectedLotteryId, setSelectedLotteryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (currentPage === 'generation') {
      setCurrentPage('strategy');
    } else if (currentPage === 'strategy') {
      setCurrentPage('detail');
    } else if (currentPage === 'detail') {
      setCurrentPage('lottery');
      setSelectedLotteryId(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <Container>
          <Stack direction="row" className="items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {STRINGS.app_title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{STRINGS.app_subtitle}</p>
            </div>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </Stack>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <Container>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : currentPage === 'lottery' ? (
            // Page: Lottery Selection
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {STRINGS.lottery_select_title}
              </h2>
              <Grid cols={2} gap="md">
                {lotteries.map((lottery) => (
                  <Card
                    key={lottery.id}
                    className={`cursor-pointer transition-all ${
                      !lottery.available ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
                    }`}
                  >
                    <CardHeader>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
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
          ) : currentPage === 'detail' ? (
            // Page: Lottery Detail
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {STRINGS.detail_prize_table}
              </h2>
              <Card>
                <CardBody>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Lottery: {selectedLotteryId}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {STRINGS.detail_cost}: 100 ₽
                  </p>
                </CardBody>
              </Card>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" onClick={handlePrevPage}>
                  {STRINGS.button_back}
                </Button>
                <Button onClick={handleNextPage}>{STRINGS.button_next}</Button>
              </div>
            </div>
          ) : currentPage === 'strategy' ? (
            // Page: Strategy Selection
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {STRINGS.strategy_title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Доступные стратегии для {selectedLotteryId}
              </p>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" onClick={handlePrevPage}>
                  {STRINGS.button_back}
                </Button>
                <Button onClick={handleNextPage}>{STRINGS.button_next}</Button>
              </div>
            </div>
          ) : (
            // Page: Generation
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {STRINGS.generation_title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Генерация билетов для {selectedLotteryId}
              </p>
              <div className="mt-6 flex gap-2">
                <Button variant="secondary" onClick={handlePrevPage}>
                  {STRINGS.button_back}
                </Button>
                <Button variant="primary">{STRINGS.generation_download_pdf}</Button>
              </div>
            </div>
          )}
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12 py-6">
        <Container>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 Lattice - Mathematical Lottery System
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
