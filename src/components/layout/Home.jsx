import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="hero-body is-fullheight background-image"> {/* Agrega la clase "background-image" */}
      <div className=" fade flex">
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

      <div className="hero-section ">
        <div className="section ">
          <div className="columns">
            <div className="column is-4 is-offset-0 is-hidden-mobile">
              <img src="/SolCoin.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
            <div className="column is-6">
              <h1 className="title is-1 mb-3">Nuvo Staking V1</h1>
              <h2 className="subtitle is-3">
              Deposit matic into our protocol and earn up to a juicy 2.5% ROI within 49 weeks.
               Enjoy passive income and build your future! 
                 </h2>
              <p className="subtitle is-4">
              Earn up to 1% extra, holding our NFTs Tokens
                  </p>
              <Link to="staking"  className="button is-active is-medium">
                STAKE NOW!
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-section">
        <div className="hero">
          <div className="columns">
          <div className="column is-4 mr-5 is-offset-1">
              <h1 className="title is-1 mb-3">
                Governance Contract v1
              </h1>
              <h2 className="subtitle is-3">
              Secure, Efficient, Powerful, Decentralized
                </h2>
              <p className="subtitle is-4">
              Our first Governance contract,
               where all users regardless of their level will be able to vote in our decision-making and be part of what is happening behind the scenes. Block Matic & Win Votes              </p>
              <Link to="/governance" className="button">
                Get Votes!
              </Link>
            </div>
            <div className="column mr-5 is-4 is-hidden-mobile">
              <img src="/Chip2.png" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
            
          </div>
        </div>
      </div>

      <div className="hero-section">
        <div className="hero">
          <div className="columns">
            
            <div className="columns mr-5 is-4 is-offset-2 is-hidden-mobile">
              <img src="/ChipZ.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
            <div className="column is-4">
              <h1 className="title is-1 mb-3">
                Secured By Blockchain
              </h1>
              <h2 className="subtitle is-3">
              Fast, direct, safe and cheap    
                        </h2>
              <p className="subtitle is-4">
              Blockchain is the technology that uses all of our smart contracts, enabling flexibility, security, privacy, and efficiency in person-to-person transactions. All your movements are safe and immutable with this technology              </p>
              <Link to="/about" className="button">
                Learn more about Blockchain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
