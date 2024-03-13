import React from 'react';
import Card from '../layout/CardProp';

const App = () => {
  return (
    <div className="columns is-flex-wrap-wrap is-gap-2">
      <div className="column is-3">
        <Card 
          title="Nuvo Start" 
          subtitle="Basic Nuvo Bot for passive income, up to 1% ROI, collect 5 levels to enhance performance" 
          price="50 USDT"
          button="Coming soon"
          user="John Doe"
        />
      </div>
      <div className="column is-3">
        <Card 
          title="Nuvo Elite" 
          subtitle="Advanced Nuvo Bot with highly accurate predictions, up to 2.5% ROI, collect 10 levels to unlock premium features" 
          price="125 USDT"
          button="Coming soon"
          user="Jane Smith"
        />
      </div>
      <div className="column is-3">
        <Card 
          title="Nuvo X1" 
          subtitle="Top-of-the-line Nuvo Bot with cutting-edge algorithms, up to 5% ROI, collect 15 levels to access exclusive perks" 
          price="300 USDT"
          button="Coming soon"
          user="Robert Johnson"
        />
      </div>
    </div>
  );
};

export default App;