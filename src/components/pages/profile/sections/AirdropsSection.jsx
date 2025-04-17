import React from 'react';
import { motion as m } from 'framer-motion';
import { FaGift, FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaExternalLinkAlt } from 'react-icons/fa';

const AirdropsSection = ({ account }) => {
  const upcomingAirdrops = [
    {
      id: 1,
      name: "NUVO Token Pre-Launch",
      description: "Early supporters airdrop for the NUVO token pre-launch",
      eligibility: "Whitelist members",
      status: "upcoming",
      date: "Q1 2026",
      amount: "500 NUVO",
      requirements: [
        { name: "Wallet Connected", met: true },
        { name: "Profile Completed", met: true },
        { name: "Community Participation", met: false },
        { name: "Staking Activity", met: false }
      ]
    },
    {
      id: 2,
      name: "Governance NFT",
      description: "Special NFT granting governance rights",
      eligibility: "Active stakers",
      status: "upcoming", 
      date: "Q3 2026",
      amount: "1 NFT",
      requirements: [
        { name: "Wallet Connected", met: true },
        { name: "Staking Minimum 100 POL", met: false },
        { name: "30 Days History", met: true }
      ]
    }
  ];

  const pastAirdrops = [];

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-full">
          <FaGift className="text-2xl text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Airdrops</h2>
      </div>
      
      <div className="p-8 bg-gradient-to-br from-purple-900/30 to-black/60 backdrop-blur-sm rounded-xl border border-purple-500/30 mb-8 text-center">
        <m.div 
          className="w-24 h-24 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-6"
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <FaGift className="text-4xl text-purple-400" />
        </m.div>
        <h3 className="text-2xl font-bold text-white mb-4">Upcoming Airdrops</h3>
        <div className="inline-block bg-yellow-500/20 px-4 py-2 rounded-lg mb-4">
          <p className="text-yellow-300 font-medium">NUVO Token Pre-Launch Airdrop</p>
          <p className="text-yellow-200 text-sm">Q1 2026</p>
        </div>
        <p className="text-purple-300 max-w-lg mx-auto mb-6">
          Make sure your profile is complete to be eligible for our upcoming airdrops and token events.
        </p>
        <a 
          href="/airdrops" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5"
        >
          Go to Airdrops Page <FaExternalLinkAlt size={12} />
        </a>
      </div>
      
      {/* Upcoming Airdrops */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Eligible Airdrops</h3>
        
        <div className="space-y-4">
          {upcomingAirdrops.map(airdrop => (
            <div key={airdrop.id} className="bg-black/30 border border-purple-500/20 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-purple-500/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">{airdrop.name}</h4>
                    <p className="text-sm text-purple-300">{airdrop.description}</p>
                  </div>
                  <div className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full">
                    {airdrop.date}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-y-4 gap-x-6">
                  <div className="min-w-[120px]">
                    <p className="text-xs text-purple-300 mb-1">Amount</p>
                    <p className="text-white font-medium">{airdrop.amount}</p>
                  </div>
                  <div className="min-w-[120px]">
                    <p className="text-xs text-purple-300 mb-1">Eligibility</p>
                    <p className="text-white">{airdrop.eligibility}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-black/20 border-t border-purple-500/10">
                <h5 className="text-sm font-medium text-white mb-2">Requirements</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {airdrop.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {req.met ? (
                        <FaCheckCircle className="text-green-400 flex-shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${req.met ? 'text-white' : 'text-gray-400'}`}>
                        {req.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Past Airdrops */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Past Airdrops</h3>
        
        {pastAirdrops.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {pastAirdrops.map(airdrop => (
              <div key={airdrop.id} className="bg-black/30 border border-purple-500/20 rounded-lg p-4">
                {/* Past airdrop details */}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/30 rounded-xl p-10 text-center">
            <FaQuestionCircle className="text-4xl text-purple-400/50 mx-auto mb-3" />
            <h4 className="text-white font-medium mb-1">No Past Airdrops</h4>
            <p className="text-gray-400">You haven't participated in any airdrops yet.</p>
          </div>
        )}
      </div>
    </m.div>
  );
};

export default AirdropsSection;
