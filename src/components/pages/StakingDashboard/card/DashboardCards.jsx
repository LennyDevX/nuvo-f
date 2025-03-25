import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateROIProgress } from '../../../../utils/RoiCalculations';
import StakingStatusCard from './StakingStatusCard';
import RewardsCard from './RewardsCard';
import PoolMetricsCard from './PoolMetricsCard';
import StakingActionsCard from './StakingActionsCard';
import ROICard from './ROICard';
import TreasuryCard from './TreasuryCard';

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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
            }
        })
    };

    return (
        <div className="grid grid-cols-12 gap-5">
            {/* First row - 4 equal cards */}
            <motion.div className="col-span-12 md:col-span-6 lg:col-span-3" custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <StakingStatusCard {...{account, depositAmount, network}} />
            </motion.div>
            <motion.div className="col-span-12 md:col-span-6 lg:col-span-3" custom={1} variants={cardVariants} initial="hidden" animate="visible">
                <ROICard 
                    roiProgress={roiProgress}
                    totalWithdrawn={totalWithdrawn}
                    firstDepositTime={firstDepositTime}
                    depositAmount={depositAmount}
                />
            </motion.div>
            <motion.div className="col-span-12 md:col-span-6 lg:col-span-3" custom={2} variants={cardVariants} initial="hidden" animate="visible">
                <PoolMetricsCard {...{totalPoolBalance}} />
            </motion.div>
            <motion.div className="col-span-12 md:col-span-6 lg:col-span-3" custom={3} variants={cardVariants} initial="hidden" animate="visible">
                <TreasuryCard treasuryBalance={treasuryBalance} />
            </motion.div>

            {/* Second row - 2 equal cards */}
            <motion.div className="col-span-12 md:col-span-6" custom={4} variants={cardVariants} initial="hidden" animate="visible">
                <StakingActionsCard 
                    onDeposit={onDepositSuccess}
                    onWithdraw={onFetchData}
                    showToast={showToast}
                />
            </motion.div>
            <motion.div className="col-span-12 md:col-span-6" custom={5} variants={cardVariants} initial="hidden" animate="visible">
                <RewardsCard 
                    availableRewards={availableRewards}
                    onClaim={onFetchData}
                    showToast={showToast}
                />            
            </motion.div>
        </div>
    );
};

export default DashboardCards;