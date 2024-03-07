// eslint-disable-next-line

import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/HeroSection.css'

const HeroSection = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <section className={`hero is-fullheight-with-navbar ${isDarkMode ? 'is-dark' : 'is-light'}`}>
      <div className="hero-body">
        <div className="container">
          <div className="columns is-vcentered">
            <div className="column is-half">
              <div className="has-text-left">
                <h1 className="title is-size-1 has-text-primary">
                  Acquire a unique collection of AI-generated NFTs, exclusively yours.
                </h1>
                <h2 className="subtitle is-size-3 has-text-info">
                  Mint NFTs and embrace the future of digital art! Earn income from NFT sales and revenue from our portfolio.
                </h2>
                <p className='subtitle is-size-5 has-text-grey'>
                  Join our platform to gain access to a wide range of financial products, allowing you to diversify your investment portfolio and maximize your returns.
                </p>
                <button className="button is-primary is-medium is-outlined">
                  View Collection
                </button>
              </div>
            </div>
            <div className="column is-half">
              <video className="background-video" autoPlay loop muted>
                <source src="/nftLogo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;