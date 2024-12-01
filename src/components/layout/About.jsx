// About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen pt-4 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-6 text-center pt-32 pb-24">
        <div className="absolute inset-0 bg-gradient-radial from-purple-600/20 via-transparent to-transparent" />
        
        <motion.div className="relative z-10">
          <motion.span
            className="inline-block px-4 py-1 mb-6 text-sm font-medium text-purple-400 bg-purple-400/10 rounded-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Our Protocol
          </motion.span>

          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Building the Future of <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-500">DeFi Staking</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Empowering Your Crypto Investments Through Innovation, Security, and Transparency. Join a revolutionary staking protocol designed for institutional and retail investors alike.
          </motion.p>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-purple-400 mb-8">
            How Our Smart Contract Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Secure Asset Locking",
                description: "Your assets are securely locked in our audited smart contract with full transparency and control."
              },
              {
                title: "Automated Rewards",
                description: "Earn consistent returns through our automated reward distribution system."
              },
              {
                title: "Flexible Staking",
                description: "Choose your staking duration with our flexible terms and unstaking options."
              },
              {
                title: "On-Chain Verification",
                description: "All transactions and rewards are verified and tracked on the blockchain for complete transparency."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "Lead Developer",
                description: "10+ years in blockchain development"
              },
              {
                name: "Sarah Chen",
                role: "Security Expert",
                description: "Former auditor at Certik"
              },
              {
                name: "Michael Rodriguez",
                role: "DeFi Strategist",
                description: "15+ years in traditional finance"
              }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-2">{member.name}</h3>
                <p className="text-white mb-2">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Technology Stack */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">
            Our Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              "Solidity Smart Contracts",
              "Polygon Network",
              "React Frontend",
              "Automated Testing",
              "Chainlink Oracle",
              "IPFS Storage",
              "MultiSig Security",
              "Real-time Updates"
            ].map((tech, index) => (
              <motion.div
                key={tech}
                className="bg-black/30 rounded-lg p-4 text-center border border-purple-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <p className="text-gray-300">{tech}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Staking?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join our growing community of investors and start earning rewards today.
          </p>
          <Link
            to="/staking"
            className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-1"
          >
            Start Staking Now →
          </Link>
        </motion.div>
      </section>

      <style jsx global>{`
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default About;