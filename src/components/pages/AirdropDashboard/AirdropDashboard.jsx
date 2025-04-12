// src/components/layout/AirdropDashboard/AirdropDashboard.jsx
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../../../context/WalletContext';
import { useAirdropData } from '../../../hooks/useAirdropData';
import { FaGift, FaTimes } from 'react-icons/fa';
import SpaceBackground from '../../effects/SpaceBackground';

// Componentes modulares
import AirdropHeroSection from './AirdropHeroSection';
import AirdropProcessSteps from './AirdropProcessSteps';
import AirdropInfoTabs from './AirdropInfoTabs';
import AirdropRegistrationSection from './AirdropRegistrationSection';
import AirdropForm from './AirdropForm/AirdropForm';

const AirdropDashboard = () => {
  const { account } = useContext(WalletContext);
  const { airdropData } = useAirdropData(account);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  
  const formatAddress = (address) => {
    if (!address) return 'Not Connected';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="min-h-screen bg-nuvo-gradient pt-24 pb-16">
      <SpaceBackground customClass="" />
      
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sección Hero */}
        <AirdropHeroSection 
          setActiveTab={setActiveTab} 
        />

        {/* Tarjetas de Airdrop */}
        

        {/* Pasos del Proceso */}
        <AirdropProcessSteps />

        {/* Pestañas de Información */}
        <AirdropInfoTabs />

        {/* Sección de Registro */}
        <AirdropRegistrationSection />
      </div>
    </div>
  );
};

export default AirdropDashboard;