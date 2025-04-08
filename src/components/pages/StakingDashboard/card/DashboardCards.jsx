import React, { useMemo } from 'react';
import { calculateROIProgress } from '../../../../utils/RoiCalculations';
import AnimationProvider from '../../../animation/AnimationProvider';
import StakingStatusCard from './StakingStatusCard';
import RewardsCard from './RewardsCard';
import PoolMetricsCard from './PoolMetricsCard';
import StakingActionsCard from './StakingActionsCard';
import ROICard from './ROICard';
import TreasuryCard from './TreasuryCard';
import { m } from 'framer-motion'; // Cambiado de 'motion' a 'm'

// Contenedor optimizado para las tarjetas con carga secuencial
const SequentialFadeIn = ({ children, index }) => (
  <m.div // Cambiado de motion.div a m.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.25,
      delay: index * 0.1, // Carga secuencial por índice
      ease: "easeOut"
    }}
    style={{ 
      willChange: "opacity, transform",
      transform: "translateZ(0)"
    }}
  >
    {children}
  </m.div>
);

const DashboardCards = ({
    account,
    network,
    depositAmount,
    availableRewards,
    totalPoolBalance, 
    treasuryBalance,
    totalWithdrawn,
    firstDepositTime,
    onDepositSuccess,
    onFetchData,
    showToast
}) => {
    const roiProgress = useMemo(() => {
        console.log('DashboardCards ROI calculation:', { depositAmount, totalWithdrawn });
        return calculateROIProgress(depositAmount, totalWithdrawn);
    }, [depositAmount, totalWithdrawn]);

    return (
        <AnimationProvider>
            <div className="grid grid-cols-12 gap-5">
                {/* First row - 4 equal cards */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <SequentialFadeIn index={0}>
                        <StakingStatusCard {...{account, depositAmount, network}} />
                    </SequentialFadeIn>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <SequentialFadeIn index={1}>
                        <ROICard 
                            roiProgress={roiProgress}
                            totalWithdrawn={totalWithdrawn}
                            firstDepositTime={firstDepositTime}
                            depositAmount={depositAmount}
                        />
                    </SequentialFadeIn>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <SequentialFadeIn index={2}>
                        <PoolMetricsCard {...{totalPoolBalance}} />
                    </SequentialFadeIn>
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <SequentialFadeIn index={3}>
                        <TreasuryCard treasuryBalance={treasuryBalance} />
                    </SequentialFadeIn>
                </div>

                {/* Second row - 2 equal cards */}
                <div className="col-span-12 md:col-span-6">
                    <SequentialFadeIn index={4}>
                        <StakingActionsCard 
                            onDeposit={onDepositSuccess}
                            onWithdraw={onFetchData}
                            showToast={showToast}
                        />
                    </SequentialFadeIn>
                </div>
                <div className="col-span-12 md:col-span-6">
                    <SequentialFadeIn index={5}>
                        <RewardsCard 
                            availableRewards={availableRewards}
                            onClaim={onFetchData}
                            showToast={showToast}
                        />
                    </SequentialFadeIn>
                </div>
            </div>
        </AnimationProvider>
    );
};

export default DashboardCards;