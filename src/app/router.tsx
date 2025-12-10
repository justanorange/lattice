/**
 * Application Router
 * React Router configuration with all routes
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import {
  LotterySelectionPage,
  LotteryDetailPage,
  StrategySelectionPage,
  GenerationPage,
  SimulationPage,
} from '@/pages';

/**
 * Get base path from env (set during build)
 */
const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Route paths as constants for type safety
 */
export const ROUTES = {
  HOME: '/',
  LOTTERY_DETAIL: '/lottery/:lotteryId',
  STRATEGY: '/lottery/:lotteryId/strategy',
  GENERATION: '/lottery/:lotteryId/generation',
  SIMULATION: '/lottery/:lotteryId/simulation',
} as const;

/**
 * Helper function to build routes with params
 */
export const buildRoute = {
  lotteryDetail: (lotteryId: string) => `/lottery/${lotteryId}`,
  strategy: (lotteryId: string) => `/lottery/${lotteryId}/strategy`,
  generation: (lotteryId: string) => `/lottery/${lotteryId}/generation`,
  simulation: (lotteryId: string) => `/lottery/${lotteryId}/simulation`,
};

/**
 * Application router configuration
 */
export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <LotterySelectionPage />,
        },
        {
          path: 'lottery/:lotteryId',
          element: <LotteryDetailPage />,
        },
        {
          path: 'lottery/:lotteryId/strategy',
          element: <StrategySelectionPage />,
        },
        {
          path: 'lottery/:lotteryId/generation',
          element: <GenerationPage />,
        },
        {
          path: 'lottery/:lotteryId/simulation',
          element: <SimulationPage />,
        },
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ],
  {
    basename: BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH,
  }
);
