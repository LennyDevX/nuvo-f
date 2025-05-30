import React, { useMemo } from 'react'; // Import useMemo
import { m, useReducedMotion } from 'framer-motion';
import { 
  FaCode, 
  FaCoins, 
  FaPuzzlePiece, 
  FaRocket, 
  FaCheckCircle, 
  FaClock,
  FaMobileAlt,
  FaGamepad
} from 'react-icons/fa';
import { containerFadeIn } from '../../../utils/animations/animationVariants'; // Removed unused fadeIn

const Features = ({ showSkeletonIfLoading }) => {
  const prefersReducedMotion = useReducedMotion();

  // Memoize the features data array
  const featuresData = useMemo(() => [
    {
      icon: <FaCoins />,
      iconColor: "text-amber-400", // Unique color
      bgColor: "bg-amber-500/10", // Background color based on icon
      title: "POL Staking",
      status: "LIVE",
      statusColor: "bg-green-500",
      description: "Earn passive income with our battle-tested staking protocol.",
      features: [
        "Competitive APY", // Updated text slightly
        "Bonus rewards",
        "Smart Staking contracts",
        "Real-time rewards tracking"
      ]
    },
    {
      icon: <FaPuzzlePiece />,
      iconColor: "text-indigo-400", // Unique color
      bgColor: "bg-indigo-500/10",
      title: "NFT Ecosystem",
      status: "COMING SOON",
      statusColor: "bg-yellow-500",
      description: "Exclusive NFT collections with real utility and benefits.",
      features: [
        "Governance rights",
        "Revenue sharing",
        "Platform perks",
        "Community access"
      ]
    },
    {
      icon: <FaCode />,
      iconColor: "text-sky-400", // Unique color
      bgColor: "bg-sky-500/10",
      title: "Core Development",
      status: "COMING SOON", // Changed status
      statusColor: "bg-yellow-500", // Changed status color
      description: "Open-source platform for blockchain developers.",
      features: [
        "Contribute to protocols",
        "Earn development rewards",
        "Access to tools & SDKs",
        "Community support"
      ]
    },
    {
      icon: <FaRocket />,
      iconColor: "text-rose-400", // Unique color
      bgColor: "bg-rose-500/10",
      title: "Nuvos Token",
      status: "COMING SOON",
      statusColor: "bg-yellow-500", // Consistent color for coming soon
      description: "Native token powering the entire ecosystem.",
      features: [
        "Governance voting",
        "Platform fees",
        "Staking rewards",
        "Exclusive benefits"
      ]
    },
    {
      icon: <FaMobileAlt />,
      iconColor: "text-emerald-400", // Unique color
      bgColor: "bg-emerald-500/10", // Background color based on icon
      title: "Nuvos APP",
      status: "COMING SOON",
      statusColor: "bg-yellow-500",
      description: "Mini-apps within the Nuvos ecosystem for seamless interaction.",
      features: [
        "Product integration",
        "Simple user interface",
        "Cross-platform support",
        "Real-time notifications"
      ]
    },
    {
      icon: <FaGamepad />,
      iconColor: "text-purple-400", // Unique color
      bgColor: "bg-purple-500/10", // Background color based on icon
      title: "Game Platform",
      status: "COMING SOON",
      statusColor: "bg-yellow-500",
      description: "Earn Nuvos tokens through fun mini-games within our ecosystem.",
      features: [
        "NFT-powered gameplay",
        "Daily rewards system",
        "Competitive leaderboards",
        "Play-to-earn mechanics"
      ]
    }
  ], []); // Empty dependency array ensures this runs only once
  
  // Skeleton loading (simple placeholder)
  if (showSkeletonIfLoading) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-8 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="nuvos-card animate-pulse h-40 bg-gray-800/40 rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-2 py-8 sm:py-20">
      <m.div
        initial={prefersReducedMotion ? {} : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerFadeIn}
        className="text-center mb-8 sm:mb-16"
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
          Building the Future of <span className=" text-transparent bg-clip-text bg-nuvo-gradient-text">DeFi</span>
        </h2>
        <p className="text-gray-200 text-sm sm:text-lg max-w-3xl mx-auto px-2 sm:px-4">
          Explore our growing ecosystem of innovative blockchain products and services designed for real utility.
        </p>
      </m.div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 lg:gap-8">
        {featuresData.map((product, index) => (
          <m.div
            key={product.title} 
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative nuvos-card rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300" 
          >
            {/* Content */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* Larger Icon with unique color */}
              <div className={`p-3 ${product.bgColor} rounded-lg text-2xl sm:text-3xl ${product.iconColor} 
                group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                {product.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-1.5">{product.title}</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-2.5 sm:mb-3">{product.description}</p>
                
                {/* Features List */}
                <ul className="space-y-1 sm:space-y-1.5">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-gray-400 text-[11px] sm:text-xs flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 ${product.iconColor} opacity-50 rounded-full flex-shrink-0`}></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Status Badge - Moved to bottom center */}
            <div className="flex justify-center mt-3 sm:mt-4">
              <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${product.statusColor} 
                text-white text-[9px] sm:text-xs font-medium flex items-center gap-1 shadow-sm`}
              >
                {product.status === "LIVE" ? <FaCheckCircle className="text-[9px] sm:text-[11px]" /> : <FaClock className="text-[9px] sm:text-[11px]" />}
                {product.status}
              </div>
            </div>

            {/* Hover Effect Gradient - Adjusted */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-purple-600/10 to-purple-600/0 
              opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-xl sm:rounded-2xl pointer-events-none" />
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
