import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { ThemeContext } from '../context/ThemeContext';
import '../../Styles/Features.css';

const Features = () => {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className={`hero-body card-container ${isDarkMode ? 'is-dark' : 'is-light'}`}>
      <div className="card">
        <div className="card-content">
          <h1 className="title">Staking Contract</h1>
          <ul className='subtitle is-4 section'>
            <li><span className="feature">Max ROI 135%</span> 💰</li>
            <li><span className="feature">Max Deposit / 10K</span> 🏧</li>
            <li><span className="feature">Weekly ROI 5%</span> 🍀</li>
            <li><span className="feature">Withdrawals fee 5%</span> 👛</li>
            <li><span className="feature">Add Balance into contract</span> 🆕</li>
            <li><span className="feature">Emergency Withdrawal</span> 🆘</li>
            <li><span className="feature">Treasury</span> 🌐</li>
            <li><span className="feature">Paused/Not Paused</span> ⚠️</li>
            <li><span className="feature">Change of Ownership</span> 👑</li>
          </ul>
          <Link to="/staking" className="button m-2 is-danger">
            Stake Now!
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h1 className="title">Swap Tokens </h1>
          <p id="texto" className='subtitle is-4 section  '>You can Buy/Sell this token</p>
          <ul className='subtitle is-4'>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> USDT</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> MATIC</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> WETH</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> DAI</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> DODO</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> USDC</span></li>
            <li><span className="feature"><FontAwesomeIcon icon={faDollarSign} /> WBTC</span></li>
          </ul>
          <Link to="/swaptoken" className="button m-2 is-warning">
            Swap tokens
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h1 className="title ">
            Powered by NFT's 🚀 
          </h1>          
          <ul className='subtitle is-4 section'>
            <li><span className="feature">Extra comissions for NFT holders</span> ✅</li>
            <li><span className="feature">Bonus for quantity of NFTs</span>✅ </li>
            <li><span className="feature">Extra Tokens</span> ✅</li>
            <li><span className="feature">Access to new features</span> ✅</li>
            <li><span className="feature">Airdrops</span> ✅</li>
            <li><span className="feature">Discounts</span> ✅</li>
            <li><span className="feature">VIP community access</span>✅</li>
          </ul>
          <Link to="/nft" className="button is-success">
            The NFT Gallery
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-content">
          <h1 className="title">Nuvo ID <FontAwesomeIcon icon={faCheckDouble} /></h1>
          <p id="texto" className="subtitle  is-3 section">A new smart contract coming soon, to verify users in the Nuvo ecosystem, allowing you to unlock new opportunities as a holder</p>
          <button className='button m-2 is-info' to="">
            COMING SOON
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;
