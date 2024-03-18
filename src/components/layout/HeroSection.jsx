import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/HeroSection.css"

const HeroSection = () => {

  const { isDarkMode } = useContext(ThemeContext);

  const InfoTexts = () => (
    <div className={`text-container${isDarkMode ? ' text-container-dark' : ''}`}>
      <h1 className="title title-gradient">
           Nuvo NFT
      </h1>
      <h2 className="subtitle texto">
        Mint your Nuvo Bot and embrace the future of digital art! Earn income from NFT sales, auto-trading, passive income and much more...
      </h2>
      <p className="description texto">
        Join our platform to gain access to a wide range of financial products, allowing you to diversify your investment portfolio and maximize your returns.
      </p>
      <button className="button">View Collection</button>
    </div>
  );  

  return (
    <section className={`hero-section${isDarkMode ? ' hero-section-dark' : ''}`}>
      <InfoTexts />
    </section>
  );
};

export default HeroSection;