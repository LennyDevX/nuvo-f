import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "../../Styles/CardNft.css";

function HeroDescription() {
  const { isDarkMode } = useContext(ThemeContext);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className={isDarkMode ? "hero-body fadedark-mode" : "hero-body"}>
      <div className="  columns m-0 p-0 is-vcentered fade">
        <p className='card column section is-5 title'>
        Earn extra comission by collecting our NFTs or holding our special Sol Coin token.        </p>
      </div>
      

      <div className="hero-section ">
        <div className="container ">
          <div className="columns">
            <div className="column is-4 is-offset-0 is-hidden-mobile">
              <img src="/SolCoin.gif" alt="NFT Image" className="image nft-img is-3by3" />
            </div>
            <div className="column is-6">
              <h1 className="title is-1 mb-3">Sol Coin Token</h1>
              <h2 className="subtitle is-3">
              Our native token to increase your power and get amazing specials within the Nuvo ecosystem              </h2>
              <p className="subtitle is-4">
                Each Stake will allow you to earn a 135% ROI, you get weekly passive returns.
              </p>
              <Link  className="button is-active is-medium">
                Coming soon!
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fade hero-content-image columns is-centered">
        <span>
          <img className="image" src="/IntoMetaverse.gif" alt="Hero" />
        </span>
        <span>
          <img className="image" src="SidAvatar1.png" alt="Hero" />
        </span>
        <span>
          <img className="image" src="IntoMetaverse4.gif" alt="Hero" />
        </span>
        <span>
          <img className="image" src="IntoMetaverse6.gif" alt="Hero" />
        </span>
      </div>
      <Slider {...settings}>
        <div>
          <img className="image" src="/IntoRetro2.gif" alt="Hero" />
        </div>
        <div>
          <img className="image" src="IntoMerge2.gif" alt="Hero" />
        </div>
        <div>
          <img className="image" src="IntoMerge6.gif" alt="Hero" />
        </div>
        <div>
          <img className="image" src="IntoMetaverse3.gif" alt="Hero" />
        </div>
        {/* Agrega más imágenes según sea necesario */}
      </Slider>
    </div>
  );
}

export default HeroDescription;
