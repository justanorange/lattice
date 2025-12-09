import { describe, it, expect } from "vitest";
import type {
  Lottery,
  Ticket,
  GeneratedTickets,
  SimulationResult,
  LotteryState,
  EVCalculation,
  PrizeTable,
  DrawResult,
} from "./types";

describe("Lottery Types - Structure Validation", () => {
  describe("PrizeTable", () => {
    it("should allow simple prize amounts", () => {
      const table: PrizeTable = {
        rows: [
          { matches: [8, 1], prize: "Суперприз" },
          { matches: [8, 0], prize: 300000 },
        ],
        currency: "₽",
      };
      expect(table.rows).toHaveLength(2);
      expect(table.currency).toBe("₽");
    });

    it("should allow percentage-based prizes", () => {
      const table: PrizeTable = {
        rows: [
          { matches: [4, 4], prize: "Суперприз", prizePercent: 30 },
          { matches: [4, 3], prizePercent: 3.12 },
        ],
        currency: "₽",
      };
      expect(table.rows[1].prizePercent).toBe(3.12);
    });

    it("should allow mixed prize types", () => {
      const table: PrizeTable = {
        rows: [
          { matches: [4, 4], prize: "Суперприз" },
          { matches: [2, 1], prize: 400 },
          { matches: [0, 2], prizePercent: 25 },
        ],
        currency: "₽",
      };
      expect(table.rows).toHaveLength(3);
    });
  });

  describe("Lottery", () => {
    it("should define 1-field lottery (6из45, 7из49, 12/24)", () => {
      const lottery: Lottery = {
        id: "lottery_6_45",
        name: "6 из 45",
        description: "Нужно выбрать 6 из 45",
        fieldCount: 1,
        fields: [{ count: 6, from: 45 }],
        defaultTicketCost: 100,
        defaultSuperprice: 250000000,
        prizeTable: {
          rows: [
            { matches: [6], prize: "Суперприз" },
            { matches: [5], prize: 100000 },
          ],
          currency: "₽",
        },
        visualLayout: "9 columns × 5 rows",
        availableStrategies: ["min_risk", "coverage", "wheel"],
      };
      expect(lottery.fieldCount).toBe(1);
      expect(lottery.fields).toHaveLength(1);
    });

    it("should define 2-field lottery (8+1)", () => {
      const lottery: Lottery = {
        id: "lottery_8_1",
        name: "8 + 1",
        description: "8 из 20 + 1 из 4",
        fieldCount: 2,
        fields: [
          { count: 8, from: 20 },
          { count: 1, from: 4 },
        ],
        defaultTicketCost: 100,
        defaultSuperprice: 100000000,
        prizeTable: {
          rows: [
            { matches: [8, 1], prize: "Суперприз" },
            { matches: [8, 0], prize: 300000 },
          ],
          currency: "₽",
        },
        visualLayout: "5 columns × 4 rows + 1 row of 4",
        availableStrategies: ["min_risk", "coverage", "wheel", "key_wheel"],
      };
      expect(lottery.fieldCount).toBe(2);
      expect(lottery.fields).toHaveLength(2);
    });

    it("should define lottery with secondary prize (5из36+1)", () => {
      const lottery: Lottery = {
        id: "lottery_5_36_1",
        name: "5 из 36 + 1",
        description: "5 из 36 + 1 из 4",
        fieldCount: 2,
        fields: [
          { count: 5, from: 36 },
          { count: 1, from: 4 },
        ],
        defaultTicketCost: 100,
        defaultSuperprice: 500000000,
        hasSecondaryPrize: true,
        defaultSecondaryPrize: 100000000,
        prizeTable: {
          rows: [
            { matches: [5, 1], prize: "Суперприз" },
            { matches: [5, 0], prize: "Приз" },
          ],
          currency: "₽",
        },
        visualLayout: "6 × 6 grid + 1 row of 4",
        availableStrategies: ["coverage", "wheel"],
      };
      expect(lottery.hasSecondaryPrize).toBe(true);
      expect(lottery.defaultSecondaryPrize).toBe(100000000);
    });

    it("should define lottery with variants (4из20)", () => {
      const lottery: Lottery = {
        id: "lottery_4_20",
        name: "4 из 20",
        description: "4 из 20 в двух полях",
        fieldCount: 2,
        fields: [
          { count: 4, from: 20 },
          { count: 4, from: 20 },
        ],
        defaultTicketCost: 400,
        defaultSuperprice: 50000000,
        variants: [
          {
            type: "fixed",
            label: "Фиксированные выигрыши",
            prizeTable: {
              rows: [{ matches: [4, 4], prize: "Суперприз" }],
              currency: "₽",
            },
          },
          {
            type: "pool_percentage",
            label: "Процент от призового фонда",
            prizeTable: {
              rows: [{ matches: [4, 4], prizePercent: 30, prizeNote: "Суперприз" }],
              currency: "₽",
            },
            averagePool: 5000000,
          },
        ],
        visualLayout: "2 fields × 4 columns × 5 rows",
        availableStrategies: ["coverage"],
      };
      expect(lottery.variants).toHaveLength(2);
      expect(lottery.variants![0].type).toBe("fixed");
      expect(lottery.variants![1].averagePool).toBe(5000000);
    });
  });

  describe("Ticket", () => {
    it("should create 1-field ticket", () => {
      const ticket: Ticket = {
        lotteryId: "lottery_6_45",
        field1: [5, 12, 23, 34, 42, 45],
      };
      expect(ticket.field1).toHaveLength(6);
      expect(ticket.field2).toBeUndefined();
    });

    it("should create 2-field ticket", () => {
      const ticket: Ticket = {
        lotteryId: "lottery_8_1",
        field1: [1, 3, 5, 7, 9, 11, 13, 15],
        field2: [2],
      };
      expect(ticket.field1).toHaveLength(8);
      expect(ticket.field2).toHaveLength(1);
    });

    it("should create ticket with secondary field", () => {
      const ticket: Ticket = {
        lotteryId: "lottery_5_36_1",
        field1: [1, 5, 10, 20, 35],
        secondaryField: [3],
      };
      expect(ticket.field1).toHaveLength(5);
      expect(ticket.secondaryField).toHaveLength(1);
    });
  });

  describe("GeneratedTickets", () => {
    it("should represent generated ticket set with coverage", () => {
      const generated: GeneratedTickets = {
        lotteryId: "lottery_8_1",
        tickets: [
          {
            lotteryId: "lottery_8_1",
            field1: [1, 2, 3, 4, 5, 6, 7, 8],
            field2: [1],
          },
          {
            lotteryId: "lottery_8_1",
            field1: [9, 10, 11, 12, 13, 14, 15, 16],
            field2: [2],
          },
        ],
        strategy: "coverage",
        generatedAt: new Date(),
        totalCost: 200,
        coverage: {
          coverageCount: 50,
          totalCombinations: 167960,
          coveragePercent: 0.03,
        },
      };
      expect(generated.tickets).toHaveLength(2);
      expect(generated.coverage?.coveragePercent).toBeCloseTo(0.03);
    });
  });

  describe("DrawResult", () => {
    it("should represent single-field draw", () => {
      const draw: DrawResult = {
        field1: [5, 12, 23, 34, 42, 45],
      };
      expect(draw.field1).toHaveLength(6);
      expect(draw.field2).toBeUndefined();
    });

    it("should represent two-field draw", () => {
      const draw: DrawResult = {
        field1: [1, 3, 5, 7, 9, 11, 13, 15],
        field2: [2],
      };
      expect(draw.field1).toHaveLength(8);
      expect(draw.field2).toHaveLength(1);
    });
  });

  describe("SimulationResult", () => {
    it("should store complete simulation with statistics", () => {
      const simulation: SimulationResult = {
        lotteryId: "lottery_8_1",
        tickets: [
          {
            lotteryId: "lottery_8_1",
            field1: [1, 2, 3, 4, 5, 6, 7, 8],
            field2: [1],
          },
        ],
        ticketCost: 100,
        roundsCount: 1000,
        rounds: [],
        simulatedAt: new Date(),
        statistics: {
          totalInvestment: 100000,
          totalWon: 50000,
          netReturn: -50000,
          roi: -50,
          zeroWinRounds: 950,
          zeroWinPercent: 95,
          avgPrizePerRound: 50,
          maxPrizeInRound: 300000,
          minNonZeroPrize: 300,
          prizeDistribution: {
            "4+1": 30,
            "3+0": 20,
          },
        },
      };
      expect(simulation.roundsCount).toBe(1000);
      expect(simulation.statistics.roi).toBe(-50);
    });
  });

  describe("LotteryState", () => {
    it("should represent user's current lottery state", () => {
      const state: LotteryState = {
        lottery: {
          id: "lottery_8_1",
          name: "8 + 1",
          description: "8 из 20 + 1 из 4",
          fieldCount: 2,
          fields: [
            { count: 8, from: 20 },
            { count: 1, from: 4 },
          ],
          defaultTicketCost: 100,
          defaultSuperprice: 100000000,
          prizeTable: {
            rows: [{ matches: [8, 1], prize: "Суперприз" }],
            currency: "₽",
          },
          visualLayout: "5 columns × 4 rows + 1 row of 4",
          availableStrategies: ["coverage"],
        },
        superprice: 250000000,
        ticketCost: 100,
        prizeTable: {
          rows: [{ matches: [8, 1], prize: "Суперприз" }],
          currency: "₽",
        },
      };
      expect(state.superprice).toBe(250000000);
    });
  });

  describe("EVCalculation", () => {
    it("should calculate EV correctly", () => {
      const ev: EVCalculation = {
        expectedValue: -75,
        evPercent: -75,
        isProfitable: false,
      };
      expect(ev.isProfitable).toBe(false);
    });

    it("should identify profitable lotteries", () => {
      const ev: EVCalculation = {
        expectedValue: 25,
        evPercent: 25,
        isProfitable: true,
        drawsToBreakEven: 4,
      };
      expect(ev.isProfitable).toBe(true);
    });
  });
});
