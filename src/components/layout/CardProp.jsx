import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import nftImage from '/NuvoLogo.avif';
import "../../Styles/CardNft.css"

const Card = ({ title, subtitle, price, button, user }) => {
  const imageSrc = nftImage;
  const { isDarkMode } = useContext(ThemeContext);

  const handleBuy = async () => {
    try {
      await buyNFT(price);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="card-container">
      <div className={`card ${isDarkMode ? 'has-dark-background' : 'has-light-background'}`}>
        <div className="card-image">
          <figure className="image is-4by3">
            <img src={imageSrc} alt={title} />
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content  has-text-centered">
              <p className={`title is-4 ${isDarkMode ? 'has-light-text' : 'has-dark-text'}`}>{title}</p>
              <p className={`subtitle is-6 ${isDarkMode ? 'has-light-text' : 'has-dark-text'}`}>{user}</p>
            </div>
          </div>
          <div className={`content has-text-centered ${isDarkMode ? 'has-light-text' : 'has-dark-text'}`}>
            {subtitle}
            <br />
            <label>Price in Nuvo: {price} CELO</label>
          </div>
          <footer className="card-footer">
            <button className={ `button is-info mt-4 ${isDarkMode}`} onClick={handleBuy}>{button}</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Card;