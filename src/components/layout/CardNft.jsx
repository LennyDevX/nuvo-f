import React from 'react';
import 'bulma/css/bulma.css';
import '../../Styles/CardNft.css'; // Importa los estilos CSS
import LaserGun from "/LaserGun.jpeg";
import nuvoStartImage from "/NuvoBot4.jpeg"; // Importa la imagen para Nuvo Start
import nuvoEliteImage from "/NuvoBot3.jpeg"; // Importa la imagen para Nuvo Elite
import { ThemeContext } from '../context/ThemeContext'; // Importa el contexto del tema
import { useContext } from 'react';

const ArkarisCard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div className={`card ${isDarkMode? 'is-dark' : 'is-light'}`}>
      <img src={nuvoStartImage} alt="Test" />
      <div className="card-text">
        <button className={`button button-card ${isDarkMode? 'is-dark' : 'is-light'}`}>ARKARIS</button> 
      </div>
    </div>
  );
};

const Laser = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div className={`card laser ${isDarkMode? 'is-dark' : 'is-light'}`}>
      <img src={LaserGun} alt="Test" />
      <div className="card-text">
        <button className={`button button-card ${isDarkMode? 'is-dark' : 'is-light'}`}>LSE X1</button> 
      </div>
    </div>
  );
};

const RiakisCard = () => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div className={`card ${isDarkMode? 'is-dark' : 'is-light'}`}>
      <img src={nuvoEliteImage} alt="Test" />
      <div className="card-text">
        <button className={`button button-card ${isDarkMode? 'is-dark' : 'is-light'}`}>RIAKIS</button> 
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="fade main-container is-gap-2">
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