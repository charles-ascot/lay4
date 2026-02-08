
import React from 'react';
import { useApp } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { state } = useApp();

  // Dynamically generate chart data from actual session bets if available, or just the current trend
  const CHART_DATA = [
    { name: 'Start', pnl: 0 },
    ...state.bets.filter(b => b.status === 'WON' || b.status === 'LOST').map((b, i) => ({
      name: `Bet ${i+1}`,
      pnl: b.pnl || 0
    }))
  ];

  // Fallback for visual display if no bets settled yet
  const displayData = CHART_DATA.length > 1 ? CHART_DATA : [
    { name: '09:00', pnl: 0 },
    { name: '10:00', pnl: 0 },
    { name: '11:00', pnl: 0 },
    { name: '12:00', pnl: 0 },
  ];

  const winRate = state.bets.length > 0 
    ? (state.bets.filter(b => b.status === 'WON').length / state.bets.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex flex-col flex-1 pb-24">
      <header className="flex-none bg-surface-dark border-b border-white/5 pt-10 pb-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-black tracking-widest text-white uppercase">Performance Desk</h1>
          <div className="text-[9px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
            SESSION: {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {/* Performance Overview */}
        <section className="bg-surface-dark pt-6 pb-10 px-5 rounded-b-[2.5rem] shadow-2xl mb-8">
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Net Equity Curve</p>
          <div className="flex items-baseline gap-2 mb-8">
            <h2 className={`text-4xl font-mono font-bold tracking-tighter ${state.totalPnL >= 0 ? 'text-primary' : 'text-red-400'}`}>
              {state.totalPnL >= 0 ? '+' : ''}£{state.totalPnL.toFixed(2)}
            </h2>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f9d406" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f9d406" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#f9d406' }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="pnl" 
                  stroke="#f9d406" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPnl)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Stats Matrix */}
        <div className="px-4 grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'WIN RATE', val: `${winRate}%`, sub: 'Matched Trades' },
            { label: 'TURNOVER', val: `£${state.bets.reduce((acc, b) => acc + b.stake, 0)}`, sub: 'Total Stakes' },
            { label: 'ROI', val: '0.0%', sub: 'Session Return' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-dark rounded-2xl p-4 border border-white/5 shadow-lg">
              <div className="text-gray-600 text-[8px] uppercase font-black mb-1 tracking-widest">{stat.label}</div>
              <div className="text-white text-base font-mono font-bold">{stat.val}</div>
              <div className="text-[8px] font-bold text-gray-500 mt-1 uppercase">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Audit Log */}
        <section className="px-4 pb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Audit</h3>
            <span className="text-[9px] font-bold text-primary">{state.bets.length} ACTIVE</span>
          </div>
          <div className="space-y-2">
            {state.bets.length === 0 ? (
              <div className="text-center py-10 opacity-20 italic text-xs">No transactions recorded</div>
            ) : (
              state.bets.map((log, i) => (
                <div key={i} className="bg-surface-dark/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined text-[18px]">history</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">{log.horse}</p>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">{log.venue} • LAY @ {log.odds}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-gray-400">£{log.stake.toFixed(2)}</p>
                    <p className="text-[9px] text-primary uppercase font-bold mt-0.5">{log.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
