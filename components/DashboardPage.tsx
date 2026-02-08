
import React from 'react';
import { useApp } from '../store';

export const DashboardPage: React.FC = () => {
  const { state, toggleLive, refreshRaces } = useApp();

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-40 bg-background-dark/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">EquiLay Terminal</h1>
          <span className="text-base font-bold text-white leading-none mt-1">Live Market Desk</span>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-primary font-bold text-sm tracking-tighter">
            £{state.totalPnL.toFixed(2)}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-inner">
            <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Active Liability</p>
            <p className="text-2xl font-mono font-bold text-white">£{state.activeLiability.toFixed(2)}</p>
          </div>
          <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-inner">
            <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Session Profit</p>
            <p className={`text-2xl font-mono font-bold ${state.todayProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {state.todayProfit >= 0 ? '+' : ''}£{state.todayProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Live Market Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Incoming Markets</h3>
            <button 
              onClick={refreshRaces}
              disabled={state.isLoadingData}
              className="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[14px] ${state.isLoadingData ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {state.isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-surface-dark/40 rounded-2xl border border-dashed border-white/10">
                <div className="relative h-10 w-10">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-xs font-medium text-gray-500 italic">Accessing Betfair Cloud...</p>
              </div>
            ) : state.bets.length === 0 ? (
              <div className="py-12 text-center bg-surface-dark/40 rounded-2xl border border-dashed border-white/10">
                <p className="text-xs font-medium text-gray-500">No active trades in this session.</p>
                <button onClick={refreshRaces} className="mt-2 text-primary text-[10px] font-bold uppercase">Sync Now</button>
              </div>
            ) : (
              state.bets.map((bet) => (
                <div 
                  key={bet.id} 
                  className={`relative overflow-hidden rounded-xl bg-surface-dark p-4 shadow-xl ring-1 transition-all ${
                    bet.status === 'PROCESSING' ? 'ring-primary/40' : 'ring-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                          {bet.time}
                        </span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                          {bet.venue}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">{bet.horse}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-0.5">LAY PRICE</span>
                      <span className={`text-xl font-mono font-bold ${
                        bet.status === 'PROCESSING' ? 'text-primary animate-pulse' : 'text-white'
                      }`}>
                        {bet.odds.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        bet.status === 'PROCESSING' ? 'bg-primary animate-pulse' : 'bg-green-500'
                      }`}></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {bet.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">LIABILITY: £{(bet.stake * (bet.odds - 1)).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Console Log Preview */}
        <div className="bg-black/60 rounded-xl border border-white/10 overflow-hidden">
          <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Automation Logs</span>
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500/50"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500/50"></div>
            </div>
          </div>
          <div className="p-3 h-32 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-1">
            {state.bets.length === 0 && <div className="text-gray-700 italic">// Waiting for input...</div>}
            {state.bets.map((bet, idx) => (
              <div key={idx} className="text-primary/70">
                <span className="text-gray-600">[{bet.time}]</span> SYSTEM::PLACE_LAY_ORDER horse="{bet.horse}" venue="{bet.venue}" price={bet.odds}
              </div>
            ))}
            {state.isLive && (
              <div className="text-green-500 animate-pulse">
                <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}]</span> EXECUTION_LOOP::ACTIVE
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Primary Action Toggle */}
      <div className="fixed bottom-24 right-4 z-40">
        <button 
          onClick={toggleLive}
          className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all active:scale-95 group ${
            state.isLive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-primary text-black hover:bg-white'
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping group-hover:hidden"></div>
          <span className="material-symbols-outlined text-[36px] relative z-10">
            {state.isLive ? 'stop' : 'play_arrow'}
          </span>
        </button>
      </div>
    </div>
  );
};
