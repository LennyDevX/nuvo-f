import React, { useMemo } from 'react';
import { calculateROIProgress } from '../../../../utils/RoiCalculations';
import AnimationProvider from '../../../animation/AnimationProvider';
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

    return (
        <AnimationProvider>
            <div className="grid grid-cols-12 gap-5">
                {/* First row - 4 equal cards */}
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <StakingStatusCard {...{account, depositAmount, network}} />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <ROICard 
                        roiProgress={roiProgress}
                        totalWithdrawn={totalWithdrawn}
                        firstDepositTime={firstDepositTime}
                        depositAmount={depositAmount}
                    />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <PoolMetricsCard {...{totalPoolBalance}} />
                </div>
                <div className="col-span-12 md:col-span-6 lg:col-span-3">
                    <TreasuryCard treasuryBalance={treasuryBalance} />
                </div>

                {/* Second row - 2 equal cards */}
                <div className="col-span-12 md:col-span-6">
                    <StakingActionsCard 
                        onDeposit={onDepositSuccess}
                        onWithdraw={onFetchData}
                        showToast={showToast}
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <RewardsCard 
                        availableRewards={availableRewards}
                        onClaim={onFetchData}
                        showToast={showToast}
                    />            
                </div>
            </div>
        </AnimationProvider>
    );
};

export default DashboardCards;