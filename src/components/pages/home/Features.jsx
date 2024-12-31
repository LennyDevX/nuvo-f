import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCode, 
  FaCoins, 
  FaPuzzlePiece, 
  FaRocket, 
  FaCheckCircle, 
  FaClock 
} from 'react-icons/fa';

const Features = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Building the Future of <span className="text-purple-400">DeFi</span>
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Explore our ecosystem of innovative blockchain products and services
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            icon: <FaCoins />,
            title: "POL Staking",
            status: "LIVE",
            statusColor: "bg-green-500",
            description: "Earn passive income with our battle-tested staking protocol",
            features: [
              "25% APY",
              "Automatic compounding",
              "Secure smart contracts",
              "Real-time rewards tracking"
            ]
          },
          {
            icon: <FaPuzzlePiece />,
            title: "NFT Ecosystem",
            status: "COMING SOON",
            statusColor: "bg-yellow-500",
            description: "Exclusive NFT collections with real utility and benefits",
            features: [
              "Governance rights",
              "Revenue sharing",
              "Platform perks",
              "Community access"
            ]
          },
          {
            icon: <FaCode />,
            title: "Core Development",
            status: "COMING SOON",
            statusColor: "bg-blue-500",
            description: "Open-source platform for blockchain developers",
            features: [
              "Contribute to protocols",
              "Earn development rewards",
              "Access to tools & SDKs",
              "Community support"
            ]
          },
          {
            icon: <FaRocket />,
            title: "Nuvos Token",
            status: "COMING SOON",
            statusColor: "bg-purple-500",
            description: "Native token powering the entire ecosystem",
            features: [
              "Governance voting",
              "Platform fees",
              "Staking rewards",
              "Exclusive benefits"
            ]
          }
        ].map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="group relative bg-black/30 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
          >
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${product.statusColor} 
              text-white text-xs font-semibold flex items-center gap-1`}
            >
              {product.status === "LIVE" ? <FaCheckCircle /> : <FaClock />}
              {product.status}
            </div>

            {/* Content */}
            <div className="flex items-start gap-4">
              <div className="p-4 bg-purple-500/20 rounded-xl text-purple-400 text-2xl 
                group-hover:scale-110 transition-transform duration-300">
                {product.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{product.title}</h3>
                <p className="text-gray-300 mb-4">{product.description}</p>
                
                {/* Features List */}
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hover Effect Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
