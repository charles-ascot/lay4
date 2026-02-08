
import React from 'react';
import { useApp } from '../store';

export const StrategyPage: React.FC = () => {
  const { state, updateStrategy, updateRisk } = useApp();

  return (
    <div className="flex flex-col flex-1 pb-24">
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="flex flex-col items-center">
          <h1 className="text-white text-base font-bold leading-tight tracking-tight uppercase">Strategy Engine</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${state.isLive ? 'text-primary' : 'text-gray-500'}`}>
              Logic System {state.isLive ? 'Online' : 'Standby'}
            </span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 overflow-y-auto no-scrollbar">
        {/* Market Scope */}
        <section className="bg-surface-dark rounded-2xl p-5 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">filter_alt</span>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-widest">Market Filters</h3>
              <p className="text-[10px] text-gray-500 font-medium">Define automation boundaries</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-3 block tracking-widest">Surface Selection</label>
              <div className="flex flex-wrap gap-2">
                {['Turf', 'All Weather', 'Dirt', 'Hurdles'].map(surface => (
                  <button
                    key={surface}
                    onClick={() => {
                      const current = state.strategy.trackSurfaces;
                      const next = current.includes(surface) 
                        ? current.filter(s => s !== surface) 
                        : [...current, surface];
                      updateStrategy({ trackSurfaces: next });
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                      state.strategy.trackSurfaces.includes(surface)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/5 border-transparent text-gray-400'
                    }`}
                  >
                    {surface}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="text-[10px] font-bold uppercase text-gray-500 mb-3 block tracking-widest">Odds Execution Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 font-bold ml-1">MIN</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={state.risk.minOdds}
                    onChange={(e) => updateRisk({ minOdds: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-600 font-bold ml-1">MAX</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={state.risk.maxOdds}
                    onChange={(e) => updateRisk({ maxOdds: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Execution Mode */}
        <section className="bg-surface-dark rounded-2xl p-5 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-widest">Execution Mode</h3>
              <p className="text-[10px] text-gray-500 font-medium">Timing and logic control</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'PRE_RACE', label: 'Early Desk', sub: 'Pre-Race Match' },
              { id: 'IN_PLAY', label: 'In-Play Sniper', sub: 'Live Execution' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => updateStrategy({ executionTiming: mode.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  state.strategy.executionTiming === mode.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-white/5 border-transparent'
                }`}
              >
                <p className={`text-xs font-bold ${state.strategy.executionTiming === mode.id ? 'text-primary' : 'text-gray-300'}`}>
                  {mode.label}
                </p>
                <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-tighter">{mode.sub}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Deployment Footer */}
        <div className="pt-4 flex flex-col gap-3">
          <button className="w-full py-4 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
            Update Logic Stream
          </button>
          <p className="text-[9px] text-center text-gray-600 uppercase font-bold tracking-widest">
            Changes will take effect on next market sync
          </p>
        </div>
      </main>
    </div>
  );
};
