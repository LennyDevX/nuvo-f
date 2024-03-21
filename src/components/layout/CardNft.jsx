import React from 'react';
import 'bulma/css/bulma.css';
import '../../Styles/CardNft.css'; // Importa los estilos CSS
import LaserGun from "/LaserGun.jpeg";
import nuvoStartImage from "/NuvoBot4.jpeg"; // Importa la imagen para Nuvo Start
import nuvoEliteImage from "/NuvoBot3.jpeg"; // Importa la imagen para Nuvo Elite

const ArkarisCard = () => {
  return (
    <div className="card ">
      <img src={nuvoStartImage} alt="Test" />
      <div className="card-text">
        
        <button className="button button-card ">ARKARIS</button> {/* Aplica las clases de estilo y animación */}

      </div>
    </div>
  );
};

const Laser = () => {
  return (
    <div className="card laser ">
      <img src={LaserGun} alt="Test" />
      <div className="card-text">
        <button className="button button-card">LSE X1</button> {/* Aplica las clases de estilo y animación */}

      </div>
    </div>
  );
};

const RiakisCard = () => {
  return (
    <div className="card ">
      <img src={nuvoEliteImage} alt="Test" />
      <div className="card-text">
        <button className="button button-card">RIAKIS</button> {/* Aplica las clases de estilo y animación */}

      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="fade columns is-flex-wrap-wrap is-gap-2">
      <div className="column is-3">
        <ArkarisCard />
      </div>
      <div className="column is-3">
        <RiakisCard />
      </div>
      <div className='column is-3'>
        <Laser />
      </div>
    </div>
  );
};

export default App;
