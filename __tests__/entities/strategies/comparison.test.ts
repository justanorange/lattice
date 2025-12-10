/**
 * Strategy Comparison Tests
 */

import { compareTwo, compareMultiple, getBestStrategy, analyzeStrategy } from '@/entities/strategies/comparison';
import type { Lottery } from '@/entities/lottery/types';
import type { StrategyParams } from '@/entities/strategies/types';

// Mock lottery
const mockLottery: Lottery = {
  id: '6_49',
  name: 'Lottery 6/49',
  description: 'Standard 6/49 lottery',
  fieldCount: 2,
  fields: [
    { from: 49, count: 6 },
    { from: 10, count: 1 },
  ],
  defaultTicketCost: 2.5,
  defaultSuperprice: 10000,
  visualLayout: 'two_fields',
  availableStrategies: ['min_risk', 'coverage', 'full_wheel'],
  prizeTable: {
    rows: [
      { matches: [6, 1], prize: 5000000 },
      { matches: [6], prize: 500000 },
    ],
    currency: '₽',
  },
};

export async function testCompareTwo() {
  try {
    const params: Record<string, StrategyParams> = {
      min_risk: { ticketCount: 5 },
      coverage: { budget: 50, spreadNumbers: true },
    };

    const result = await compareTwo(
      'min_risk',
      'coverage',
      mockLottery,
      params,
      10
    );

    if (result.strategy1 === 'min_risk' && result.strategy2 === 'coverage') {
      console.log('✓ compareTwo generates valid comparison');
    } else {
      console.error('✗ compareTwo invalid structure');
    }
  } catch (e) {
    console.error('✗ compareTwo error:', e);
  }
}

export async function testCompareMultiple() {
  try {
    const params: Record<string, StrategyParams> = {
      min_risk: { ticketCount: 5 },
      coverage: { budget: 50 },
      full_wheel: { selectedNumbers: 8 },
    };

    const results = await compareMultiple(
      mockLottery,
      ['min_risk', 'coverage', 'full_wheel'],
      params,
      10
    );

    if (results.length === 3) {
      // 3 choose 2 = 3 comparisons
      console.log('✓ compareMultiple generates all pairs');
    } else {
      console.error('✗ compareMultiple incorrect pair count');
    }
  } catch (e) {
    console.error('✗ compareMultiple error:', e);
  }
}

export async function testGetBestStrategy() {
  try {
    const params: Record<string, StrategyParams> = {
      min_risk: { ticketCount: 5 },
      coverage: { budget: 100 },
      full_wheel: { selectedNumbers: 8 },
    };

    const best = await getBestStrategy(mockLottery, params, 10);

    if (best && best.strategyId && best.result) {
      console.log(`✓ getBestStrategy selected: ${best.strategyId}`);
    } else {
      console.error('✗ getBestStrategy returned null');
    }
  } catch (e) {
    console.error('✗ getBestStrategy error:', e);
  }
}

export async function testAnalyzeStrategy() {
  try {
    const params: StrategyParams = { ticketCount: 10 };

    const analysis = await analyzeStrategy('min_risk', mockLottery, params, 10);

    if (
      analysis.result &&
      Array.isArray(analysis.recommendations) &&
      Array.isArray(analysis.warnings)
    ) {
      console.log('✓ analyzeStrategy provides complete analysis');
    } else {
      console.error('✗ analyzeStrategy missing fields');
    }
  } catch (e) {
    console.error('✗ analyzeStrategy error:', e);
  }
}

// Run async tests
Promise.resolve()
  .then(() => testCompareTwo())
  .then(() => testCompareMultiple())
  .then(() => testGetBestStrategy())
  .then(() => testAnalyzeStrategy())
  .catch(console.error);
