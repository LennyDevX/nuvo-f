import React from 'react';
import '../../Styles/CardsBenefits.css'; // Agrega un archivo CSS personalizado para estilos adicionales si es necesario

const BulmaCard = () => {
  return (
    <div className="columns">
      <div className="column">
        <div className="card card-benefits">
          <div className="card-image">
            <figure className="image is-3by4">
              <img src="Holograma3.avif" alt="Placeholder image" />
            </figure>
          </div>
          <div className="card-content">
            <div className="media">
              <div className="media-left">
                <figure className="image is-48x48">
                  <img src="/NuvoLogo.avif" className='is-rounded' alt="Placeholder image" />
                </figure>
              </div>
              <div>
                <p className="title is-4">The Garden</p>
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
          <div className="card-content">
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
    </div>
  );
};

export default BulmaCard;
