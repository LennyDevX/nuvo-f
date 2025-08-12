import { FaClock, FaChartLine, FaShieldAlt } from 'react-icons/fa';

export const stakingInfo = {
  features: [
    {
      title: "Hourly Rewards",
      description: "Earn 0.024% per day (0.001% per hour), automatically credited to your account",
      iconType: "clock"
    },
    {
      title: "Linear Rewards",
      description: "Contract verified 8.76% annual APY with transparent calculations",
      iconType: "chart"
    },
    {
      title: "Security First",
      description: "Audited smart contracts with emergency withdrawal system",
      iconType: "shield"
    }
  ],
  details: {
    minStake: "0.05 POL",
    maxStake: "10 POL",
    baseAPR: "8.76%",
    commission: "10%"
  }
};
