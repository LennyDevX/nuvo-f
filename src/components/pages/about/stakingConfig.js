import { FaClock, FaChartLine, FaShieldAlt } from 'react-icons/fa';

export const stakingInfo = {
  features: [
    {
      title: "Hourly Rewards",
      description: "Earn 2.4% per day (0.1% per hour), automatically credited to your account",
      iconType: "clock"
    },
    {
      title: "Linear Rewards",
      description: "Contract verified 87.6% annual APY with transparent calculations",
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
    baseAPR: "87.6%",
    commission: "10%"
  }
};
