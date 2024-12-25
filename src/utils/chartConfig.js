export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#fff',
        padding: 10,
        font: {
          size: typeof window !== 'undefined' ? (window.innerWidth < 640 ? 10 : 14) : 14,
        },
      },
    },
  },
};

export const tokenDistributionData = {
  labels: ["Staking Rewards", "Treasury", "Community", "Development", "Marketing"],
  datasets: [{
    data: [40, 25, 20, 10, 5],
    backgroundColor: ["#8B5CF6", "#EC4899", "#06B6D4", "#10B981", "#F59E0B"],
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 3,
  }],
};

export const revenueStreamsData = {
  labels: [
    "Third-Party Staking",
    "DeFi Lending",
    "Algorithmic Trading",
    "Liquidity Provision",
    "Strategic Holdings",
  ],
  datasets: [{
    data: [30, 25, 20, 15, 10],
    backgroundColor: ["#7C3AED", "#DB2777", "#0891B2", "#059669", "#D97706"],
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 3,
  }],
};

export const keyMetricsData = [
  {
    title: "Total Supply",
    value: "5,000,000",
    desc: "Fixed supply, no inflation",
  },
  {
    title: "Circulating Supply",
    value: "0",
    desc: "0% in circulation",
  },
  {
    title: "Treasury Holdings",
    value: "$n/a",
    desc: "For protocol stability",
  },
];
