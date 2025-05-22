export const roadmapData = {
  "2024": {
    "Q1": [
      {
        title: "Protocol Development",
        icon: "🔧",
        status: "Completed",
        progress: 100,
        phase: "Foundation Phase",
        items: [
          { text: "Smart Staking Contract v1", status: "completed", date: "Jan 2024" },
          { text: "Testing & Security Audit", status: "completed", date: "Jan 2024" },
          { text: "Deployment on Polygon Network", status: "completed", date: "Feb 2024" },
          { text: "Yield Optimization Strategy", status: "completed", date: "Feb 2024" },
          { text: "Smart Contract Integration", status: "completed", date: "Mar 2024" },
          { text: "Cross-chain Bridge Research", status: "completed", date: "Mar 2024" }
        ]
      }
    ],
    "Q2": [
      {
        title: "Project Inception",
        icon: "🚀",
        status: "Completed",
        progress: 100,
        phase: "Foundation Phase",
        items: [
          { text: "Initial Planning & Research", status: "completed", date: "Apr 2024" },
          { text: "Capital Funds & Tokenomics", status: "completed", date: "Apr 2024" },
          { text: "Technical Architecture Design", status: "completed", date: "May 2024" },
          { text: "Liquidity Pool Strategy", status: "completed", date: "May 2024" },
          { text: "Token Distribution Model", status: "completed", date: "Jun 2024" },
          { text: "Governance Framework Design", status: "completed", date: "Jun 2024" }
        ]
      }
    ],
    "Q3": [
      {
        title: "Nuvo Development",
        icon: "⚡",
        status: "Completed",
        progress: 100,
        phase: "Development Phase",
        items: [
          { text: "Alpha v1.0 Platform Release", status: "completed", date: "Jul 2024" },
          { text: "Frontend Implementation", status: "completed", date: "Jul 2024" },
          { text: "Smart Contract Optimization", status: "completed", date: "Aug 2024" },
          { text: "DeFi Integration Framework", status: "completed", date: "Aug 2024" },
          { text: "Yield Aggregator Development", status: "completed", date: "Sep 2024" },
          { text: "Security Testing & Audit", status: "completed", date: "Sep 2024" }
        ]
      }
    ],
    "Q4": [
      {
        title: "Beta Live Launch",
        icon: "🌟",
        status: "completed",
        progress: 100,
        phase: "Launch Phase",
        items: [
          { text: "Beta Platform Launch", status: "completed", date: "Oct 2024" },
          { text: "Beta Mining Program", status: "completed", date: "Oct 2024" },
          { text: "Community Testing Phase", status: "completed", date: "Nov 2024" },
          { text: "Initial research Nuvos-Token", status: "completed", date: "Nov 2024" },
          { text: "Platform Optimization", status: "completed", date: "Dec 2024" },
          { text: "Fixed all bugs", status: "completed", date: "Dec 2024" }
        ]
      }
    ]
  },
  "2025": {
    "Q1": [
      {
        title: "Initial Phase",
        icon: "🏗️",
        status: "Completed",
        progress: 100,
        phase: "Initial Phase",
        items: [
          { text: "Develop core infrastructure for stability", status: "completed", date: "Jan 2025" },
          { text: "Create initial tokenomics and NFT cores", status: "completed", date: "Jan 2025" },
          { text: "Update the Style across the all app ", status: "completed", date: "Feb 2025" },
          { text: "Develop the Nuvos-Token", status: "completed", date: "Feb 2025" },
          { text: "Smart Staking 1.0 launch", status: "completed", date: "Feb 2025" },
          { text: "Review the Nuvos-Tokenomics", status: "completed", date: "Mar 2025" },
          { text: "Initial plan for the Nuvos-NFTs", status: "completed", date: "Mar 2025" },
          { text: "Better perfomance across all the web", status: "completed", date: "Mar 2025" }

        ]
      }
    ],
    "Q2": [
      {
        title: "Integration & Expansion",
        icon: "🎨",
        status: "Planned",
        progress: 25,
        phase: "Innovation Phase",
        items: [
          { text: "Launch the Nuvos-Dashboard", status: "in-progress", date: "Apr 2026" },
          { text: "Develop NFT system for digital products", status: "in-progress", date: "Apr 2025" },
          { text: "Implement enhanced UI/UX designs for mobile", status: "pending", date: "May 2025" },
          { text: "Implement chatbot with Gemini AI", status: "in-progress", date: "May 2025" },
          { text: "Integrate components with NFTs utility", status: "pending", date: "Jun 2025" },
          { text: "Implement AI-Hub for advanced features", status: "pending", date: "Jun 2025" },
          
        ]
      }
    ],
    "Q3": [
      {
        title: "Smart Staking 2.0 & AI-Hub",
        icon: "🚀",
        status: "Planned",
        progress: 0,
        phase: "Update Phase",
        items: [
          { text: "Testing Smart Staking 2.0", status: "pending", date: "Jul 2025" },
          { text: "Prepare marketing strategies", status: "pending", date: "Aug 2025" },
          { text: "Ai-Hub update ", status: "pending", date: "Sep 2025" },
          { text: "AI-Hub integration with NFTs", status: "pending", date: "Sep 2025" },
          { text: "Launch the Preview AI-Hub", status: "pending", date: "Sep 2025" },
          { text: "Implement/update new tokenomics", status: "pending", date: "Sep 2025" }
        ]
      }
    ],
    "Q4": [
      {
        title: "Purge",
        icon: "📈",
        status: "Planned",
        progress: 0,
        phase: "Growth Phase",
        items: [
          { text: "Optimize code, clean all bugs ", status: "pending", date: "Oct 2025" },
          { text: "Optimize platform after token launch", status: "pending", date: "Oct 2025" },
          { text: "Implement further tokenomics revisions", status: "pending", date: "Nov 2025" },
          { text: "Explore the NFTs-AI utility", status: "pending", date: "Nov 2025" },
          { text: "Prepare Smart Staking 2.0 for the next phase", status: "pending", date: "Dec 2025" },
          { text: "NuvOS 1.0 for better perfomance, security and utility", status: "pending", date: "Dec 2025" },
          { text: "Launch the Tokemomics 1.0", status: "pending", date: "Dec 2025" }



        ]
      }
    ]
  }
};

// More efficient metrics calculation
const calculateMetrics = (item) => {
  return {
    userEngagement: item.status === "Completed" ? "✓ Achieved" : "In Progress",
    devMilestones: item.progress + "%",
    communityGrowth: item.status === "Completed" ? "Strong" : "Growing"
  };
};

// Actualizar las métricas en los datos - optimized version with memoization
const cachedMetrics = new Map();

Object.keys(roadmapData).forEach(year => {
  Object.keys(roadmapData[year]).forEach(quarter => {
    roadmapData[year][quarter].forEach(item => {
      // Create a unique key for this item
      const itemKey = `${item.title}-${item.status}-${item.progress}`;
      
      // Check if we've already calculated metrics for this combination
      if (!cachedMetrics.has(itemKey)) {
        const metrics = calculateMetrics(item);
        cachedMetrics.set(itemKey, [
          "User Engagement: " + metrics.userEngagement,
          "Development Milestones: " + metrics.devMilestones,
          "Community Growth: " + metrics.communityGrowth,
        ]);
      }
      
      // Use cached metrics
      item.metrics = cachedMetrics.get(itemKey);
    });
  });
});
