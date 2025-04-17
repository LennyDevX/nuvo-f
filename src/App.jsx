import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/home/HomePage';
import SwapToken from './components/pages/SwapToken';
import DashboardStaking from './components/pages/StakingDashboard/DashboardStaking';
import ProfilePage from './components/pages/profile/ProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/swap" element={<SwapToken />} />
        <Route path="/swaptoken" element={<SwapToken />} />
        <Route path="/staking" element={<DashboardStaking />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;