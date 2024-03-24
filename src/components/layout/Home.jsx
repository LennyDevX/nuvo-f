import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="fade hero-body is-fullheight">
      <div className="hero-section">
        <div className="container">
          <div className="columns">
            <div className="column is-4">
              <h1 className="title is-1 mb-3">
                It's not just an image, do more with Nuvo NFT
              </h1>
              <h2 className="subtitle is-3">
                Get Your own NFT and embrace the future of digital art. Earn income from selling NFTs, auto-trading, passive income, and more...
              </h2>
              <p className="subtitle is-4">
                Join our platform to access a wide range of financial products that allow you to diversify your investment portfolio and maximize your returns.
              </p>
              <Link to="/nft" className="button">
                The NFT Gallery
              </Link>
            </div>

            <div className="column is-4 is-offset-2 is-hidden-mobile">
              <img src="/IntoMerge7.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-section">
        <div className="container">
          <div className="columns">
            <div className="column is-4 is-offset-0 is-hidden-mobile">
              <img src="/SolCoin.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
            <div className="column is-4">
              <h1 className="title is-1 mb-3">
                Nuvos Staking 1.0 is now live!
              </h1>
              <h2 className="subtitle is-3">
                Earn up to 5% weekly for your stake in our pool, earn up to 3% extra if you own NFTs from our collections.
              </h2>
              <p className="subtitle is-4">
                Each Stake will allow you to earn a 135% ROI, you get weekly passive returns.
              </p>
              <Link to="/staking" className="button">
                Stake Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-section">
        <div className="section">
          <div className="columns">
            <div className="column is-4">
              <h1 className="title is-1 mb-3">
                Secured By Blockchain
              </h1>
              <h2 className="subtitle is-3">
              Fast, direct, safe and cheap              </h2>
              <p className="subtitle is-4">
              Blockchain is the technology that uses all of our smart contracts, enabling flexibility, security, privacy, and efficiency in person-to-person transactions. All your movements are safe and immutable with this technology              </p>
              <Link to="/nft" className="button">
                Learn more about Blockchain
              </Link>
            </div>
            <div className="column is-4 is-offset-2 is-hidden-mobile">
              <img src="/ChipZ.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
