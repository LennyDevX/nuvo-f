import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/home/Home';
import Tokenomics from './components/pages/tokenomics/Tokenomics';
import DashboardStaking from './components/pages/StakingDashboard/DashboardStaking';
import Footer from './components/layout/Footer';
import './Styles/spaceBackground.css';
// ... other imports

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tokenomics" element={<Tokenomics />} />
          <Route path="/staking" element={<DashboardStaking />} />
          {/* ...other routes */}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
