
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CONFIG = 'CONFIG',
  STRATEGY = 'STRATEGY',
  ANALYTICS = 'ANALYTICS'
}

export interface Bet {
  id: string;
  time: string;
  venue: string;
  horse: string;
  odds: number;
  stake: number;
  status: 'PENDING' | 'PLACED' | 'MATCHED' | 'WON' | 'LOST' | 'PROCESSING';
  pnl?: number;
}

export interface RiskConfig {
  maxLiabilityPerRace: number;
  dailyStopLoss: number;
  targetProfit: number;
  minOdds: number;
  maxOdds: number;
}

export interface StrategyConfig {
  volumeMin: number;
  volumeMax: number;
  trackSurfaces: string[];
  raceTypes: string[];
  executionTiming: 'PRE_RACE' | 'IN_PLAY';
}

export interface AppState {
  isLive: boolean;
  totalPnL: number;
  activeLiability: number;
  todayProfit: number;
  bets: Bet[];
  risk: RiskConfig;
  strategy: StrategyConfig;
  isLoadingData: boolean;
}

export interface RaceData {
  time: string;
  venue: string;
  runners: { name: string; odds: number }[];
}
