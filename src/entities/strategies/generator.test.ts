/**
 * Strategy Generator Tests
 */

import { executeStrategy } from './generator';
import type { Lottery, Ticket } from '@/entities/lottery/types';
import type { StrategyParams } from './types';

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
  availableStrategies: ['min_risk', 'coverage', 'full_wheel', 'key_wheel', 'budget_optimizer'],
  prizeTable: {
    rows: [
      { matches: [6, 1], prize: 5000000 },
      { matches: [6], prize: 500000 },
    ],
    currency: '₽',
  },
};

export function testExecuteStrategy() {
  const params: StrategyParams = { ticketCount: 5 };
  try {
    executeStrategy('min_risk', mockLottery, params, 2.5)
      .then(() => {
        console.log('✓ executeStrategy callable');
      })
      .catch((e) => {
        console.error('✗ executeStrategy failed:', e);
      });
  } catch (e) {
    console.error('✗ executeStrategy failed:', e);
  }
}

export function testExecuteInvalidStrategy() {
  try {
    executeStrategy('invalid_strategy', mockLottery, {}, 2.5)
      .catch((e) => {
        if (e.message.includes('not found')) {
          console.log('✓ Strategy validation rejects invalid IDs');
        }
      });
  } catch (e) {
    console.log('✓ Strategy validation rejects invalid IDs');
  }
}

export function testTicketGeneration() {
  executeStrategy('min_risk', mockLottery, { ticketCount: 5 }, 2.5)
    .then((result) => {
      if (
        result.tickets &&
        result.tickets.length === 5 &&
        result.tickets.every((t: Ticket) => t.field1.length === 6)
      ) {
        console.log('✓ Tickets generated with correct structure');
      } else {
        console.error('✗ Ticket generation failed');
      }
    })
    .catch((e) => {
      console.error('✗ Ticket generation error:', e);
    });
}

export function testCoverageStrategy() {
  executeStrategy('coverage', mockLottery, { budget: 50, spreadNumbers: true }, 10)
    .then((result) => {
      if (
        result.tickets &&
        result.tickets.length === 5 &&
        result.ticketCount === 5
      ) {
        console.log('✓ Coverage strategy respects budget');
      } else {
        console.error('✗ Coverage strategy budget calculation failed');
      }
    })
    .catch((e) => {
      console.error('✗ Coverage strategy error:', e);
    });
}

export function testBudgetOptimizer() {
  executeStrategy(
    'budget_optimizer',
    mockLottery,
    { budget: 100, riskTolerance: 30 },
    5
  )
    .then((result) => {
      if (result.tickets && result.totalCost <= 100 * 5) {
        console.log('✓ Budget optimizer respects constraints');
      } else {
        console.error('✗ Budget optimizer failed');
      }
    })
    .catch((e) => {
      console.error('✗ Budget optimizer error:', e);
    });
}

// Run tests
testExecuteStrategy();
testExecuteInvalidStrategy();
testTicketGeneration();
testCoverageStrategy();
testBudgetOptimizer();
