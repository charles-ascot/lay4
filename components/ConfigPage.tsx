
import React from 'react';
import { useApp } from '../store';

export const ConfigPage: React.FC = () => {
  const { state, updateRisk } = useApp();

  return (
    <div className="flex flex-col flex-1 pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Configuration</h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">API Connected</span>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* API Credentials */}
        <section className="bg-surface-dark rounded-xl border border-surface-border p-5 shadow-sm shadow-gold-glow/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">api</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Betfair API</h2>
              <p className="text-xs text-gray-400">Secure connection credentials</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-primary/80 ml-1">Application Key</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 material-symbols-outlined text-[20px]">vpn_key</span>
                <input 
                  type="password" 
                  value="KwJi9G78H12345678" 
                  readOnly
                  className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary text-sm font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-primary/80 ml-1">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 material-symbols-outlined text-[20px]">person</span>
                <input 
                  type="text" 
                  placeholder="Betfair Username"
                  className="block w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary text-sm"
                />
              </div>
            </div>
            <button className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">link</span>
              Reconnect Account
            </button>
          </form>
        </section>

        {/* Risk Controls */}
        <section className="bg-surface-dark rounded-xl border border-surface-border p-5 shadow-sm shadow-gold-glow/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined">shield</span>
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Risk Controls</h2>
                <p className="text-xs text-gray-400">Safety limits & stops</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked readOnly />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-8">
            {/* Liability Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-300">Max Liability / Race</label>
                <span className="text-primary font-mono font-bold text-xl">£{state.risk.maxLiabilityPerRace}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="10"
                value={state.risk.maxLiabilityPerRace}
                onChange={(e) => updateRisk({ maxLiabilityPerRace: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>£0</span>
                <span>£1000</span>
              </div>
            </div>

            {/* Daily Stop Loss Slider */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-300">Daily Stop Loss</label>
                <span className="text-red-400 font-mono font-bold text-xl">-£{state.risk.dailyStopLoss}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50"
                value={state.risk.dailyStopLoss}
                onChange={(e) => updateRisk({ dailyStopLoss: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>£0</span>
                <span>£2000</span>
              </div>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Target Profit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 italic">£</span>
                  <input 
                    type="number" 
                    value={state.risk.targetProfit}
                    onChange={(e) => updateRisk({ targetProfit: Number(e.target.value) })}
                    className="block w-full pl-7 pr-3 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary text-sm font-mono text-right"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Min Odds</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={state.risk.minOdds}
                  onChange={(e) => updateRisk({ minOdds: Number(e.target.value) })}
                  className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary text-sm font-mono text-right"
                />
              </div>
            </div>
          </div>
        </section>

        <p className="text-[10px] text-center text-gray-600 mt-2">
          Encrypted connection. Keys are stored locally in your browser.
        </p>
      </main>
    </div>
  );
};
