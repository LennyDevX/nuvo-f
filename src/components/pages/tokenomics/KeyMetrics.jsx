import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaChartLine, FaLayerGroup, FaRocket, FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';

const KeyMetrics = () => {
  return (
    <motion.div
      className="card-purple-gradient card-purple-wrapper mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">NUVOS Token Projections</h2>
          <p className="text-gray-400 text-sm mt-1">
            Pre-listing ecosystem development and integration roadmap
          </p>
        </div>
        <div className="mt-3 sm:mt-0 bg-purple-900/30 px-3 py-1 rounded-md border border-purple-500/20">
          <span className="text-xs text-purple-300">Token Status: <span className="text-green-400 font-medium">Created</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Utility Growth */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaChartLine className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Utility Growth</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Current</span>
                <span className="text-purple-300">Platform Services</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Q1 2025</span>
                <span className="text-purple-300">Ecosystem Integration</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Q4 2027</span>
                <span className="text-purple-300">Full Adoption</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Ecosystem Services */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaLayerGroup className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Ecosystem Services</h3>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              { 
                name: "Cloud Storage & Computing", 
                status: "Active",
                date: "Current" 
              },
              { 
                name: "Developer Rewards Program", 
                status: "Coming Soon",
                date: "Q3 2025" 
              },
              { 
                name: "NFT Infrastructure", 
                status: "Planned",
                date: "Q4 2025" 
              },
              { 
                name: "DeFi Integration Suite", 
                status: "Planned",
                date: "Q2 2026" 
              },
              { 
                name: "Enterprise Solutions", 
                status: "Roadmap",
                date: "Q3 2026" 
              }
            ].map((service, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-gray-300">{service.name}</span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">{service.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    service.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                    service.status === 'Coming Soon' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                    'bg-purple-900/30 text-purple-300 border border-purple-500/30'
                  }`}>{service.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Adoption Metrics */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaUsers className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Adoption Projections</h3>
          </div>
          <div className="space-y-4 mt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Initial Services Integration</p>
                <p className="text-xl font-semibold text-white">1</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Target 2025</p>
                <p className="text-xl font-semibold text-white">3</p>
              </div>
            </div>
            <div className="h-px w-full bg-purple-500/20"></div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Holder Growth Target</p>
              <div className="flex items-center">
                <div className="relative flex items-center h-14 w-full">
                  {/* Gradient Timeline */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="h-1 w-full bg-gray-800 rounded-full"></div>
                  </div>
                  
                  {/* Timeline Points */}
                  <div className="absolute left-0 flex flex-col items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <p className="text-xs text-purple-300 mt-1 whitespace-nowrap">Now</p>
                    <p className="text-xs text-gray-500">Core Users</p>
                  </div>
                  
                  <div className="absolute left-1/4 flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <p className="text-xs text-blue-300 mt-1 whitespace-nowrap">Q4 2025</p>
                    <p className="text-xs text-gray-500">Early Adopters</p>
                  </div>
                  
                  <div className="absolute left-2/4 flex flex-col items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <p className="text-xs text-indigo-300 mt-1 whitespace-nowrap">Q1 2026</p>
                    <p className="text-xs text-gray-500">Expansion</p>
                  </div>
                  
                  <div className="absolute right-0 flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-green-300 mt-1 whitespace-nowrap">Q2 2027</p>
                    <p className="text-xs text-gray-500">Mass Adoption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Listing Roadmap */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaExchangeAlt className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Exchange Listing Roadmap</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-900/30 text-blue-400 p-1.5 rounded-full mr-3 mt-0.5">
                <FaCalendarAlt className="text-xs" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-400">Initial Liquidity Phase</p>
                <p className="text-xs text-gray-400 mt-1">Launch of first liquidity pool with initial trading pairs enabling early token discovery and distribution.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-indigo-900/30 text-indigo-400 p-1.5 rounded-full mr-3 mt-0.5">
                <FaCalendarAlt className="text-xs" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-400">Mid-Tier Exchange Listings</p>
                <p className="text-xs text-gray-400 mt-1">Following successful liquidity development, listing on established mid-tier exchanges to increase accessibility.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-purple-900/30 text-purple-400 p-1.5 rounded-full mr-3 mt-0.5">
                <FaCalendarAlt className="text-xs" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-400">Major Exchange Integration</p>
                <p className="text-xs text-gray-400 mt-1">Strategic partnerships with major exchanges aligned with ecosystem growth and adoption metrics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Distribution */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaRocket className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Integration Milestones</h3>
          </div>
          <div className="space-y-3">
            <div className="relative pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-purple-300">Developer Tools Integration</span>
                <span className="text-xs font-medium text-purple-300">50%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: "50%" }}
                ></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-blue-300">Cloud Services API</span>
                <span className="text-xs font-medium text-blue-300">10%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: "10%" }}
                ></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-indigo-300">Governance Portal</span>
                <span className="text-xs font-medium text-indigo-300">5%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: "5%" }}
                ></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-pink-300">Web3 Marketplace</span>
                <span className="text-xs font-medium text-pink-300">10%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  style={{ width: "10%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Utility Stats */}
        <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
              <FaChartLine className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Pre-Listing Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Total Supply</p>
              <p className="text-lg font-bold text-white">21,000,000</p>
              <p className="text-xs text-gray-500 mt-1">Fixed Supply Cap</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Circulation</p>
              <p className="text-lg font-bold text-white">Initial Release</p>
              <p className="text-xs text-gray-500 mt-1">Phased Distribution</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Infrastructure</p>
              <p className="text-lg font-bold text-white">Polygon</p>
              <p className="text-xs text-gray-500 mt-1">Low Gas, Fast Txs</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-3">
              <p className="text-xs text-gray-400">Smart Contract</p>
              <p className="text-lg font-bold text-white">Audited</p>
              <p className="text-xs text-gray-500 mt-1">Security Verified</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start">
          <div className="p-2 bg-blue-500/20 rounded-full mr-3">
            <FaRocket className="text-blue-400 text-sm" />
          </div>
          <div>
            <p className="text-sm text-blue-300 font-medium">Token Journey - Next Steps</p>
            <p className="text-xs text-gray-400 mt-1">
              Our token is currently in its early deployment phase. We're focused on building fundamental utility and integration within our ecosystem before pursuing exchange listings and liquidity pools. This approach ensures NUVOS token launches with genuine utility and sustainable value proposition.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KeyMetrics;
