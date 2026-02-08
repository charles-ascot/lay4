
import React from 'react';
import { useApp } from '../store';
import { AppView } from '../types';

export const Navigation: React.FC = () => {
  const { currentView, setView, state } = useApp();

  const navItems = [
    { view: AppView.DASHBOARD, icon: 'dashboard', label: 'Dash' },
    { view: AppView.ANALYTICS, icon: 'candlestick_chart', label: 'Analytics' },
    { view: AppView.STRATEGY, icon: 'tune', label: 'Auto' },
    { view: AppView.CONFIG, icon: 'settings', label: 'Config' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-dark border-t border-white/10 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ view, icon, label }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
              currentView === view ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <span className={`material-symbols-outlined ${currentView === view ? 'fill-current' : ''}`}>
              {icon}
            </span>
            <span className="text-[10px] mt-1 font-medium">{label}</span>
            {view === AppView.CONFIG && state.isLive && (
              <div className="absolute top-2 right-6 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(249,212,6,0.6)]"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
