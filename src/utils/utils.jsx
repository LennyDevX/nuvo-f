// src/utils/utils.js

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