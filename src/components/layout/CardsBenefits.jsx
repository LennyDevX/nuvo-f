import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/CardsBenefits.css';

const BulmaCard = () => {
  const { isDarkMode } = useContext(ThemeContext);

  const getCardColorClass = () => {
    return isDarkMode ? 'has-dark-background' : 'has-light-background';
  }; 

 

  return (
    <div className="columns">

      <div id='card-one' className="column  is-half-desktop is-full-mobile">
        <div className="card card-benefits ">
          <div className="card-image">
            <figure className="image is-3by4">
              <img src="/Holograma4.avif" type="image/png" alt="Placeholder image" />
            </figure>
          </div>
          <div className={`card-content ${getCardColorClass()}`}>
            <div className="media">
              <div className="media-left">
                <figure className="image is-48x48">
                  <img src="/NuvoLogo.avif" className='is-rounded' alt="Placeholder image" />
                </figure>
              </div>
              <div clas >
                <p className="title is-4">The Wall</p>
                <p className="subtitle is-6">@NuvoNFT</p>
              </div>
            </div>


            <div className="content"> 
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris. <a>@bulmaio</a>.
              <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1 time">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
        </div>
      </div>
      <div className="column is-half-desktop is-full-mobile">
        <div className="card card-benefits ">
          <div className="card-image">
            <figure className="image is-3by4">
              <img src="/Holograma4.avif" type="image/png" alt="Placeholder image" />
            </figure>
          </div>
          <div className={`card-content ${getCardColorClass()}`}>
            <div className="media">
              <div className="media-left">
                <figure className="image is-48x48">
                  <img src="/NuvoLogo.avif" className='is-rounded' alt="Placeholder image" />
                </figure>
              </div>
              <div >
                <p className="title is-4">The Wall</p>
                <p className="subtitle is-6">@NuvoNFT</p>
              </div>
            </div>


            <div className="content">              
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris. <a>@bulmaio</a>.
              <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
        </div>
      </div>


      

      <div className="column is-half-desktop is-full-mobile">
        <div className="card card-benefits ">
          <div className="card-image">
            <figure className="image is-3by4">
              <img src="/Holograma4.avif" type="image/png" alt="Placeholder image" />
            </figure>
          </div>
          <div className={`card-content ${getCardColorClass()}`}>
            <div className="media">
              <div className="media-left">
                <figure className="image is-48x48">
                  <img src="/NuvoLogo.avif" className='is-rounded' alt="Placeholder image" />
                </figure>
              </div>
              <div >
                <p className="title is-4 ">The Wall</p>
                <p className="subtitle is-6 ">@NuvoNFT</p>
              </div>
            </div>

            <div className="content">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris. <a>@bulmaio</a>.
              <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
        </div>
      </div>

      <div className="column is-half-desktop is-full-mobile">
        <div className="card card-benefits ">
          <div className="card-image">
            <figure className="image is-3by4">
              <img src="/Holograma4.avif" type="image/png" alt="Placeholder image" />
            </figure>
          </div>
          <div className={`card-content ${getCardColorClass()}`}>
            <div className="media">
              <div className="media-left">
                <figure className="image is-48x48">
                  <img src="/NuvoLogo.avif" className='is-rounded' alt="Placeholder image" />
                </figure>
              </div>
              <div >
                <p className="title is-4">The Wall</p>
                <p className="subtitle is-6 ">@NuvoNFT</p>
              </div>
            </div>

            <div className="content">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Phasellus nec iaculis mauris. <a>@bulmaio</a>.
              <a href="#">#css</a> <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1 texto">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulmaCard;
