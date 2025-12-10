import { useState } from 'react';
import { Container, Spinner, Alert } from '@/shared/ui';
import {
  LotterySelectionPage,
  LotteryDetailPage,
  StrategySelectionPage,
  GenerationPage,
  SimulationPage,
} from '@/pages';
import { ThemeMode } from '@/widgets/theme-mode/ui/ThemeMode';
import './styles/App.css';

type PageType = 'lottery' | 'detail' | 'strategy' | 'generation' | 'simulation';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('lottery');
  const [selectedLotteryId, setSelectedLotteryId] = useState<string | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('max_coverage');
  const [selectedStrategyParams, setSelectedStrategyParams] = useState<Record<string, unknown>>({ budget: 1000 });
  const [selectedStrategyTicketCount, setSelectedStrategyTicketCount] = useState<number>(10);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectLottery = (lotteryId: string) => {
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

  const handleStrategyNext = (
    strategyId: string,
    params: Record<string, unknown>,
    ticketCount: number
  ) => {
    setSelectedStrategyId(strategyId);
    setSelectedStrategyParams(params);
    setSelectedStrategyTicketCount(ticketCount);
    setCurrentPage('generation');
  };

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header
        className="
          fixed inset-x-0 top-0 z-10
          flex items-center justify-end
          p-4
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-md
        "
      >
        <ThemeMode />
      </header>

      {/* Main Content */}
      <main className="pt-20">
        <Container>
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {currentPage === 'lottery' && (
                <LotterySelectionPage
                  onSelectLottery={handleSelectLottery}
                />
              )}

              {currentPage === 'detail' && selectedLotteryId && (
                <LotteryDetailPage
                  lotteryId={selectedLotteryId}
                  onNext={handleNextPage}
                  onBack={handlePrevPage}
                />
              )}

              {currentPage === 'strategy' && (
                <StrategySelectionPage
                  onNext={handleStrategyNext}
                  onBack={handlePrevPage}
                />
              )}

              {currentPage === 'generation' && selectedLotteryId && (
                <GenerationPage
                  strategyId={selectedStrategyId}
                  strategyParams={selectedStrategyParams}
                  ticketCount={selectedStrategyTicketCount}
                  onBack={handlePrevPage}
                />
              )}

              {currentPage === 'simulation' && (
                <SimulationPage
                  onBack={handlePrevPage}
                />
              )}
            </>
          )}
        </Container>
      </main>
    </div>
  );
}

export default App;
