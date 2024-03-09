import React, { useEffect } from 'react';
import '../../Styles/HeroSection.css';
import CardsBenefits from './CardsBenefits';

const HeroSection = () => {
  useEffect(() => {
    // Código adicional si es necesario
  }, []);

  const InfoTexts = () => (
    <div className="has-text-left">
      <h1 className="title is-size-1 fade">
        <span className="title-gradient">
           <br /> Nuvo NFT
        </span>
      </h1>
      <h2 className="subtitle texto fade  is-size-4 has-text-black">
        Mint your Nuvo Bot and embrace the future of digital art! 
        Earn income from NFT sales, auto-trading, passive income and much more...
      </h2>
      <p className="subtitle texto fade is-size-6 has-text-black">
        Join our platform to gain access to a wide range of 
        financial products, allowing you to diversify 
        your investment portfolio and maximize your returns.
      </p>
      <button className="button is-info is-medium fade">View Collection</button>
    </div>
  );  

  return (
    <>
      <section className="hero is-fullheight-with-navbar">
        <div id='bg-img' className="hero-section fade">
          <div className="container">
            <div className="columns is-vcentered">
              <div className="column is-half">
                <InfoTexts />
              </div>
              <div className="column is-half">
              {/* Aquí se puede agregar alguna imagen u otro elemento si es necesario */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="hero">
        <div className="hero-body fade">
          <div className="container">
            <div className="columns is-vcentered">
              <div className="column is-half">
                <CardsBenefits />
                
              </div>
              <div className="column is-half">
              {/* Aquí se puede agregar alguna imagen u otro elemento si es necesario */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;