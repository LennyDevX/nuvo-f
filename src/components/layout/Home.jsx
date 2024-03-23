import React from 'react';
import { Link } from 'react-router-dom';


const HeroSection = () => {
  return (
    <section className="hero-body is-fullheight">


      <div className="hero-section">
        <div className="container">
          <div className="columns">
            <div className="column is-4">
              <h1 className="title is-1">
                It's not just a image, do more with Nuvo NFT
              </h1>
              <h2 className="subtitle is-3">
              Get Your own  NFT and embrace the future of digital art. Earn income from selling NFTs, auto-trading, passive income, and more...
              </h2>
              <p className="subtitle is-4">
              Join our platform to access a wide range of financial products that allow you to diversify your investment portfolio and maximize your returns.
               </p>
              <Link to="/nft" className="button">
              Gallery
              </Link>
            </div>

            <div className="column is-4 is-offset-2 is-hidden-mobile">
              <img src="/IntoMerge6.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
          </div>

        </div>
        <div className="columns">
             

            
          </div>
      </div>
      <div className="columns">
            
          <div className="flex is-4">
            
              <h1 className="colum m-2 title is-1">
                Staking
              </h1>
              <h2 className="subtitle m-2 is-3">
              earn up to 5% weekly for your stake in our pool, earn up to 3% extra if you own NFTs from our collections.                  </h2>
              <p className="subtitle m-2 is-4">
              Each Stake will allow you to earn a 135% ROI, you get weekly passive returns.              </p>

              <Link to="/dashboard" className="button m-2 is-primary">
                Pool Stake 
              </Link>
            </div>
            <div className="flex p-3 ml-4 mr-4 is-hidden-mobile">
              <img src="/SolCoin.gif" alt="NFT Image" className="image-x is-4by3" />
            </div>
            
          </div>
    </section>
  );
};

export default HeroSection;
