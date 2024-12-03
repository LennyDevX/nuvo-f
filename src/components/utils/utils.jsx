// src/utils/utils.js
export const calculateROIProgress = (depositAmount, totalWithdrawn) => {
  try {
    const depositValue = parseFloat(depositAmount) || 0;
    const withdrawnValue = parseFloat(totalWithdrawn) || 0;

    console.log("ROI Calculation:", {
      depositValue,
      withdrawnValue,
      maxPossibleReward: depositValue * 1.3
    });

    if (depositValue > 0) {
      const maxPossibleReward = depositValue * 1.3;
      const currentProgress = (withdrawnValue / maxPossibleReward) * 100;
      return Math.min(Math.max(currentProgress, 0), 130);
    }
    return 0;
  } catch (err) {
    console.error("Error calculating ROI:", err);
    return 0;
  }
};

export const getStakingDuration = (firstDepositTime, lastWithdrawalTime) => {
  const now = new Date();

  if (lastWithdrawalTime) {
    const lastWithdrawal = new Date(lastWithdrawalTime);
    const hoursElapsed = Math.floor((now - lastWithdrawal) / (1000 * 60 * 60));
    return `${hoursElapsed} hours since last withdrawal`;
  }

  if (firstDepositTime) {
    const depositDate = new Date(firstDepositTime * 1000);
    const hoursElapsed = Math.floor((now - depositDate) / (1000 * 60 * 60));
    return `${hoursElapsed} hours since last withdrawal`;
  }

  return "No withdrawals yet";
};