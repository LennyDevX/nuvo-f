import React from 'react';

const Features = () => {
  return (
    <div className="fixed-grid columns is-2 has-text-centered ">
      <div className="grid section">
        <div className="cell is-one-third"> {/* Primera columna */}
          <h1 className="title">Staking Contract</h1>
          <ul className='subtitle is-4 section'>
            <li><span className="feature">Maximum ROI</span> 💰</li>
            <li><span className="feature">Maximum Deposit</span> 🏧</li>
            <li><span className="feature">Weekly ROI</span> 🍀</li>
            <li><span className="feature">Withdrawals</span> 👛</li>
            <li><span className="feature">Add Balance</span> 🆕</li>
            <li><span className="feature">Emergency Withdrawal</span> 🆘</li>
            <li><span className="feature">Treasury</span> 🌐</li>
            <li><span className="feature">Paused/Not Paused</span> ⚠️</li>
            <li><span className="feature">Change of Ownership</span> 👑</li>
          </ul>
        </div>
        <div className="cell"> {/* Segunda columna */}
          <h1 className="title">Actions</h1>
          <ul className='subtitle is-4 section'>
            <li><span className="action">135%</span> ✅</li>
            <li><span className="action">10K Matic</span> ✅</li>
            <li><span className="action">5% passive income</span> 💤</li>
            <li><span className="action">Fee 5% deposit and withdrawal</span> 🔴</li>
            <li><span className="action">More Balance / More secure</span> 🛡️</li>
            <li><span className="action">Hacking protection</span> ⚠️</li>
            <li><span className="action">The bank of Nuvo</span> 🌐</li>
            <li><span className="action">For future updates or bug fixes</span> 🐛</li>
            <li><span className="action">New owner</span> 👑</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Features;
