import React from 'react';
import { Link } from 'react-router-dom';
import Statics from "./StaticsInvest"


const HeroSection = () => {
  return (
    <section className="hero-body is-fullheight">


      <div className="hero-section">
        <div className="container">
          <div className="columns">
            <div className="column is-4">
              <h1 className="title is-1">
                Nuvos NFT
              </h1>
              <h2 className="subtitle is-3">
                Crea un NFT y abraza el futuro del arte digital. Gana ingresos por la venta de NFTs, auto-trading, ingresos pasivos y mucho más...
              </h2>
              <p className="subtitle is-4">
                Únete a nuestra plataforma para acceder a una amplia gama de productos financieros que te permiten diversificar tu cartera de inversiones y maximizar tus retornos.
              </p>
              <Link to="/nft" className="button is-primary">
                Acceso anticipado
              </Link>
            </div>

            <div className="column is-2 is-offset-3 is-hidden-mobile">
              <img src="/SolCoin.gif" alt="NFT Image" className="image-x is-4by3" />
            </div>
          </div>
          <Statics />

        </div>
      
      </div>
    </section>
  );
};

export default HeroSection;
