import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import "../../Styles/HeroSection.css"

const HeroSection = () => {

  const { isDarkMode } = useContext(ThemeContext);

  const InfoTexts = () => (
    <div className={` fade text-container${isDarkMode ? ' text-container-dark' : ''}`}>
      <h1 className="title is-1">
           Nuvos NFT
      </h1>
      <h2 className=" m-3 p-2 subtitle is-3">
        Mint a NFT and embrace the future of digital art. Earn income from NFT sales, auto-trading, passive income and much more...
      </h2>
      <p className="m-1 subitle is-4  ">
        Join our platform to gain access to a wide range of financial products, allowing you to diversify your investment portfolio and maximize your returns.
      </p>
      <Link to="/nft" className="mt-4 button  ">Early Access</Link>
    </div>
  );  

  return (
    <section className={`hero-section${isDarkMode ? ' hero-section-dark' : ''}`}>
      <InfoTexts />
    </section>
  );
};

export default HeroSection;