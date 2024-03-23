import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "../../Styles/CardNft.css";

function HeroDescription() {
  const { isDarkMode } = useContext(ThemeContext);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Mostrar tres imágenes a la vez
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className={isDarkMode ? "hero-body  fadedark-mode" : "hero-body"}>
      <div className="hero-text fade">
        <h1 className='title section '>Is not just a Image</h1>
        <p className='title '>Explore How We Improve NFTs</p>
        <p className='subtitle'>The images are just the representation of your passport to the Blockchain! Nuvo develops utilities with Intelligent Contracts, without limits, your NFT can be whatever you want to be.</p>
      </div>
      <div className=" fade hero-content-image columns">
        <span className=''>
          <img className="image" src="/IntoMetaverse.gif" alt="Hero" />
        </span>
        <span className=''>
          <img className="image" src="SidAvatar1.png" alt="Hero" />
        </span>
        <span className=''>
          <img className="image" src="IntoMetaverse4.gif" alt="Hero" />
        </span>
        <span className=''>
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
