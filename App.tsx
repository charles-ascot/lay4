
import React from 'react';
import { AppProvider, useApp } from './store';
import { AppView } from './types';
import { Navigation } from './components/Navigation';
import { DashboardPage } from './components/DashboardPage';
import { ConfigPage } from './components/ConfigPage';
import { StrategyPage } from './components/StrategyPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AIVoiceInterface } from './components/AIVoiceInterface';

const ViewContainer: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <DashboardPage />;
      case AppView.CONFIG: return <ConfigPage />;
      case AppView.STRATEGY: return <StrategyPage />;
      case AppView.ANALYTICS: return <AnalyticsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-background-dark border-x border-white/5">
      {renderView()}
      <Navigation />
      <AIVoiceInterface />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ViewContainer />
    </AppProvider>
  );
};

export default App;
