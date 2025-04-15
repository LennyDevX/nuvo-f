// Detect if running on mobile for responsive chart configs
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Base chart options with mobile optimizations
export const chartOptions = {
  maintainAspectRatio: true,
  responsive: true,
  cutout: isMobile ? '60%' : '70%',
  layout: {
    padding: isMobile ? 10 : 20
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        boxWidth: isMobile ? 8 : 12,
        padding: isMobile ? 10 : 15,
        font: {
          size: isMobile ? 10 : 12
        }
      }
    },
    tooltip: {
      enabled: true,
      displayColors: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: isMobile ? 12 : 14
      },
      bodyFont: {
        size: isMobile ? 11 : 13
      },
      padding: isMobile ? 8 : 12
    }
  },
  animation: {
    duration: isMobile ? 800 : 1500
  }
};

// Token distribution data
export const tokenDistributionData = {
  labels: ["Staking Rewards", "Treasury", "Community", "Development"],
  datasets: [{
    data: [40, 25, 20, 15],
    backgroundColor: ["#8B5CF6", "#6D28D9", "#4C1D95", "#7C3AED"],
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: isMobile ? 2 : 3,
  }]
};

// Revenue streams data
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
    borderWidth: isMobile ? 2 : 3,
  }],
};

// Memoized metrics data for reuse
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
