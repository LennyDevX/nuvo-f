// src/components/layout/Footer.jsx
import React from 'react';
import NavLink from '../navigation/NavLink'; // Import NavLink
import { FaTelegramPlane, FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="relative bg-black border-t border-purple-500/60 z-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/staking" 
                  prefetchStrategy="intent"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Staking
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/tokenomics"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Tokenomics
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/airdrops"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Airdrops
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/about"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/nfts"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  NFTs
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Development */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Development</h3>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/roadmap" 
                  prefetchStrategy="intent"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Roadmap
                </NavLink>
              </li>
              <a 
                href="https://github.com/LennyDevX/nuvo-f" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Documentation
              </a>
              <li>
                <NavLink 
                  to="/game"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Game
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/tokenize"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Tokenize Tool
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/ai"
                  prefetchStrategy="intent" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  AI-Hub
                </NavLink>
              </li>
              
            </ul>
          </div>

          {/* Social & Community */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <div className="flex space-x-4">
              <motion.a
                href="https://t.me/nuvoNFT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <FaTelegramPlane className="text-2xl" />
              </motion.a>
              <motion.a
                href="https://twitter.com/nuvo_eth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
              > 
                <FaXTwitter className="text-2xl" />
              </motion.a>
              <motion.a
                href="https://discord.gg/yourserver"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <FaDiscord className="text-2xl" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-purple-500/40 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Nuvos Cloud. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            BETA v3.1 - USE AT YOUR OWN RISK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;