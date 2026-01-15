import React, { useState } from 'react';
import Sidebar from './components/shared/Sidebar';
import LandingPage from './components/shared/LandingPage';
import Login from './components/shared/Login';
import Reports from './components/M_M/Reports';
import SmartFactoryChecksheet from './components/M_M/SmartFactoryChecksheet';
import RatingScales from './components/M_M/RatingScales';
import Matrices from './components/M_M/Matrices';
import ApiDiagnostics from './components/ApiDiagnostics';

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Reports');

  // Check URL for diagnostics mode
  const isDiagnosticsMode = window.location.search.includes('diagnostics');

  // Show diagnostics page if requested
  if (isDiagnosticsMode) {
    return <ApiDiagnostics />;
  }

  // Show landing page first
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Then show login
  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Finally show main app

  return (
    <div className="min-h-screen bg-[#F0F5FA] font-sans text-slate-900 selection:bg-blue-100">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black italic flex items-center justify-center">S</div>
          <div>
            <p className="text-sm font-bold text-slate-800">STRAT.IQ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setShowLanding(true);
            }}
            className="ml-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="pt-16">
        <div className="flex">
          <Sidebar active={activeTab} setActive={setActiveTab} />
          <main className="ml-64 flex-1 p-10 relative">
            {/* M & M Menu Items */}
            {activeTab === 'Reports' && <Reports />}
            {activeTab === 'Smart Factory Checksheet' && <SmartFactoryChecksheet />}
            {activeTab === 'Rating Scales' && <RatingScales />}
            {activeTab === 'Matrices' && <Matrices />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
