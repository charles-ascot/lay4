
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Bet, RiskConfig, StrategyConfig, AppView, RaceData } from './types';
import { GoogleGenAI } from "@google/genai";

interface AppContextType {
  state: AppState;
  currentView: AppView;
  setView: (view: AppView) => void;
  toggleLive: () => void;
  updateRisk: (updates: Partial<RiskConfig>) => void;
  updateStrategy: (updates: Partial<StrategyConfig>) => void;
  addLogMessage: (msg: string, type?: string) => void;
  logMessages: { time: string; text: string; type: string }[];
  refreshRaces: () => Promise<void>;
  placeLayBet: (bet: Omit<Bet, 'id' | 'status'>) => void;
}

const DEFAULT_RISK: RiskConfig = {
  maxLiabilityPerRace: 100,
  dailyStopLoss: 500,
  targetProfit: 200,
  minOdds: 2.0,
  maxOdds: 6.0,
};

const DEFAULT_STRATEGY: StrategyConfig = {
  volumeMin: 1000,
  volumeMax: 1000000,
  trackSurfaces: ['Turf'],
  raceTypes: ['Handicap'],
  executionTiming: 'PRE_RACE',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<AppView>(AppView.DASHBOARD);
  const [logMessages, setLogMessages] = useState<{ time: string; text: string; type: string }[]>([]);
  const [state, setState] = useState<AppState>({
    isLive: false,
    totalPnL: 0,
    activeLiability: 0,
    todayProfit: 0,
    bets: [],
    risk: DEFAULT_RISK,
    strategy: DEFAULT_STRATEGY,
    isLoadingData: false,
  });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const addLogMessage = useCallback((text: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogMessages(prev => [{ time, text, type }, ...prev].slice(0, 50));
  }, []);

  const toggleLive = useCallback(() => {
    setState(prev => {
      const newLive = !prev.isLive;
      addLogMessage(newLive ? 'Automation sequence initiated' : 'Automation suspended', newLive ? 'success' : 'warning');
      return { ...prev, isLive: newLive };
    });
  }, [addLogMessage]);

  const updateRisk = useCallback((updates: Partial<RiskConfig>) => {
    setState(prev => ({ ...prev, risk: { ...prev.risk, ...updates } }));
    addLogMessage(`Risk parameters updated: ${Object.keys(updates).join(', ')}`, 'info');
  }, [addLogMessage]);

  const updateStrategy = useCallback((updates: Partial<StrategyConfig>) => {
    setState(prev => ({ ...prev, strategy: { ...prev.strategy, ...updates } }));
    addLogMessage(`Strategy logic updated`, 'info');
  }, [addLogMessage]);

  const placeLayBet = useCallback((betData: Omit<Bet, 'id' | 'status'>) => {
    const newBet: Bet = {
      ...betData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PROCESSING'
    };
    setState(prev => ({
      ...prev,
      bets: [newBet, ...prev.bets],
      activeLiability: prev.activeLiability + (betData.stake * (betData.odds - 1))
    }));
    
    // Simulate API execution
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        bets: prev.bets.map(b => b.id === newBet.id ? { ...b, status: 'MATCHED' } : b)
      }));
      addLogMessage(`Lay bet matched: ${betData.horse} @ ${betData.odds}`, 'success');
    }, 2000);
  }, [addLogMessage]);

  const refreshRaces = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingData: true }));
    addLogMessage('Searching for live race markets in UK & Ireland...', 'info');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Find today's horse racing fixtures for UK and Ireland. List the next 5 upcoming races with venue, time, and current top 3 runners with their approximate decimal odds. Return as a clean list.",
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "No data found.";
      addLogMessage('Real-time market data synchronized', 'success');
      
      // We parse the text and update our internal tracking if we had a more complex parser,
      // but for "real" demo purposes we'll log it and let the AI agent handle it.
      console.log("RACING DATA:", text);
    } catch (error) {
      console.error(error);
      addLogMessage('Error synchronizing live data', 'error');
    } finally {
      setState(prev => ({ ...prev, isLoadingData: false }));
    }
  }, [addLogMessage]);

  useEffect(() => {
    refreshRaces();
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      currentView,
      setView,
      toggleLive,
      updateRisk,
      updateStrategy,
      logMessages,
      addLogMessage,
      refreshRaces,
      placeLayBet
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
