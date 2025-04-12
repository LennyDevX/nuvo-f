import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift, FaChartLine, FaQuestionCircle, FaCheckCircle, FaTimes, FaArrowRight, FaShieldAlt, FaMoneyBillWave, FaDatabase } from 'react-icons/fa';

const AirdropInfoTabs = () => {
  const [activeTab, setActiveTab] = useState('about');

  const stakingBenefits = [
    {
      icon: <FaChartLine className="text-green-400" />,
      title: "High APY",
      description: "Earn up to 125% APY on your staked NUVO tokens with our Smart Staking program."
    },
    {
      icon: <FaShieldAlt className="text-blue-400" />,
      title: "No Lock Period",
      description: "Enjoy flexible withdrawals without any lock period on your staked assets."
    },
    {
      icon: <FaMoneyBillWave className="text-amber-400" />,
      title: "Daily Rewards",
      description: "Receive staking rewards on a daily basis, automatically compounded for maximum growth."
    },
    {
      icon: <FaDatabase className="text-purple-400" />,
      title: "Governance Rights",
      description: "Staked tokens grant you voting rights in platform governance decisions."
    }
  ];

  const faqItems = [
    {
      question: "What is the NUVO Airdrop?",
      answer: "The NUVO Airdrop is a distribution of NUVO tokens to early supporters and community members. These tokens can be used for governance, staking, and accessing premium features on the Nuvos platform."
    },
    {
      question: "How many tokens will I receive?",
      answer: "Eligible participants will receive 10 NUVO tokens during the initial airdrop phase. Additional token distributions may occur in future phases based on participation and contribution to the ecosystem."
    },
    {
      question: "When will I receive my tokens?",
      answer: "Tokens will be distributed within 14 days after the end of the registration period. You'll be notified via email when your tokens are ready to be claimed."
    },
    {
      question: "What can I do with my NUVO tokens?",
      answer: "NUVO tokens can be staked to earn rewards, used to vote on governance proposals, or held as an investment in the Nuvos ecosystem. The Smart Staking program offers up to 125% APY on staked tokens."
    },
    {
      question: "How do I start staking my tokens?",
      answer: "After receiving your tokens, visit the Staking dashboard, connect your wallet, and select the amount of tokens you wish to stake. You can choose from different staking plans based on your preference."
    }
  ];

  const Tab = ({ id, label, icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-purple-600/30 text-white font-medium border border-purple-500/50' 
          : 'hover:bg-purple-600/10 text-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="border-b border-purple-500/20 last:border-b-0">
        <button
          className="flex justify-between items-center w-full py-4 text-left"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-white font-medium">{question}</h3>
          <span className={`text-purple-400 transform transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            {isOpen ? <FaTimes /> : <FaArrowRight />}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-gray-300 pb-4">{answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <section id="info-section" className="mb-24 scroll-mt-24">
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg">
        <div className="flex gap-2 p-4 border-b border-purple-500/20 overflow-x-auto">
          <Tab 
            id="about" 
            label="About Airdrop" 
            icon={<FaGift />} 
            active={activeTab === 'about'} 
          />
          <Tab 
            id="staking" 
            label="Smart Staking" 
            icon={<FaChartLine />} 
            active={activeTab === 'staking'} 
          />
          <Tab 
            id="faq" 
            label="FAQ" 
            icon={<FaQuestionCircle />} 
            active={activeTab === 'faq'} 
          />
        </div>
        
        <div className="p-6 md:p-8">
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">NUVOS Airdrop Program</h2>
              
              <div className="space-y-6">
                <div className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-medium text-white mb-4">About NUVO Tokens</h3>
                  <p className="text-gray-300 mb-4">
                    NUVO is the utility and governance token of the Nuvos ecosystem. It enables holders to participate in platform decisions, access premium features, and earn rewards through staking.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-purple-400">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Governance Voting</h4>
                        <p className="text-sm text-gray-400">Vote on key platform decisions and feature implementations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-purple-400">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Staking Rewards</h4>
                        <p className="text-sm text-gray-400">Stake tokens to earn high APY returns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-purple-400">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Fee Discounts</h4>
                        <p className="text-sm text-gray-400">Enjoy reduced fees on platform transactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-purple-400">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Premium Access</h4>
                        <p className="text-sm text-gray-400">Unlock exclusive platform features and benefits</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-black/60 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-medium text-white mb-4">Airdrop Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-1">Total Token Supply</h4>
                      <p className="text-2xl font-bold text-white">1000 POL</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-1">Airdrop Allocation</h4>
                      <p className="text-2xl font-bold text-white">100 NUVOS</p>
                    </div>
                    <div className="p-4 bg-black/20 rounded-lg">
                      <h4 className="text-purple-400 font-medium mb-1">Per Wallet</h4>
                      <p className="text-2xl font-bold text-white">10 NUVOS</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-gray-300">
                      The NUVOS airdrop is designed to distribute tokens to early supporters and community members. Each eligible wallet will receive 10 NUVO tokens, which can be staked immediately to start earning rewards at up to 125% APY.
                    </p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-6">
                  <h3 className="text-xl font-medium text-white mb-4">Eligibility Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span className="text-gray-300">Have a valid Web3 wallet (MetaMask, WalletConnect, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span className="text-gray-300">Complete the airdrop registration form with valid information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                      <span className="text-gray-300">Minimum wallet balance of 1 MATIC for transaction fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'staking' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">Smart Staking Program</h2>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-900/30 to-black/60 rounded-xl p-6 border border-green-500/20">
                  <h3 className="text-xl font-medium text-white mb-4">What is Smart Staking?</h3>
                  <p className="text-gray-300 mb-4">
                    Smart Staking is Nuvos' innovative staking program that allows NUVOS token holders to earn high yields on their holdings. By locking your tokens in the staking contract, you contribute to the security and decentralization of the network while earning rewards.
                  </p>
                  <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Smart Staking APY</h4>
                      <span className="text-2xl font-bold text-green-400">Up to 125% APY</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full" 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stakingBenefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="bg-black/40 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-900/30 rounded-full">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white mb-2">{benefit.title}</h3>
                          <p className="text-gray-300">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-b from-purple-900/30 to-black/60 rounded-xl p-6">
                  <h3 className="text-xl font-medium text-white mb-4">How to Stake Your NUVOS Tokens</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">1</div>
                      <div className="mt-0.5">
                        <h4 className="text-white font-medium">Receive your airdropped NUVOS tokens</h4>
                        <p className="text-gray-400 text-sm">After successful registration, you'll receive 10 NUVO tokens to your wallet</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">2</div>
                      <div className="mt-0.5">
                        <h4 className="text-white font-medium">Access the staking dashboard</h4>
                        <p className="text-gray-400 text-sm">Navigate to the "Staking" section in the Nuvos platform</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">3</div>
                      <div className="mt-0.5">
                        <h4 className="text-white font-medium">Connect your wallet</h4>
                        <p className="text-gray-400 text-sm">Use the same wallet where you received your airdrop tokens</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">4</div>
                      <div className="mt-0.5">
                        <h4 className="text-white font-medium">Choose your staking plan</h4>
                        <p className="text-gray-400 text-sm">Select from flexible staking or locked staking for higher APY</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">5</div>
                      <div className="mt-0.5">
                        <h4 className="text-white font-medium">Stake your tokens</h4>
                        <p className="text-gray-400 text-sm">Confirm the transaction in your wallet and start earning rewards</p>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white flex items-center justify-center gap-2"
                      onClick={() => window.location.href = '/staking'}
                    >
                      <FaChartLine /> Go to Staking Dashboard
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
              
              <div className="space-y-1 bg-black/20 rounded-xl p-6">
                {faqItems.map((item, index) => (
                  <FaqItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AirdropInfoTabs;
