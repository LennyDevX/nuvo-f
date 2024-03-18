import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import nftImage from "/NuvoLogo.avif";
import "../../Styles/CardNft.css"


const Card = ({ title, subtitle, price, button, user }) => {
  const imageSrc = 'nftImage';
  const { isDarkMode } = useContext(ThemeContext);

  const handleBuy = async () => {
    // Tu código para manejar la compra del NFT
  };

  return (
    <div className={`card-container ${isDarkMode ? 'is-dark' : 'is-light'}`}>
      <div className="card">
        <div className="card-image">
          <figure className="image is-4by3">
            <img src={nftImage} alt={title} />
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content  has-text-centered">
              <p className="title is-4">{title}</p>
              <p className="subtitle is-6">{user}</p>
            </div>
          </div>
          <div className="content has-text-centered">
            {subtitle}
            <br />
            <label>Price in Nuvo: {price} CELO</label>
          </div>
          <footer className="card-footer">
            <button className={ `button is-info mt-4`} onClick={handleBuy}>{button}</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Card;