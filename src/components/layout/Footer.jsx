// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTelegramPlane, FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-purple-500/60 ">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/staking" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Staking
                </Link>
              </li>
              <li>
                <Link to="/tokenomics" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Tokenomics
                </Link>
              </li>
              <li>
                <Link to="/airdrops" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Airdrops
                </Link>
              </li>
            </ul>
          </div>

          {/* Development */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Development</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/roadmap" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/LennyDevX/nuvo-f" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link to="/about#team" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Team
                </Link>
              </li>
              <li>
              <Link 
                  to="/game" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Game
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  About
                </Link>
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
            BETA v1.5 - USE AT YOUR OWN RISK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;