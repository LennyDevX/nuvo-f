import React from 'react';

const Card = () => {
  return (
    <div className="card">
      <div className="card-image">
        <div className="media-left">
            <img className='card'
              src="/SolCoin.gif"
              alt="Placeholder image"
            />
        </div>
        <div className="media-content">
          <p className="title is-4">John Smith</p>
          <p className="subtitle is-6">@johnsmith</p>
        </div>
      </div>

      <div className="content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec
          iaculis mauris. <a href="#">@bulmaio</a>.
        </p>
        <p>
          <a href="#">#css</a>
          <a href="#">#responsive</a>
        </p>
        <p>
          <time dateTime="2016-01-01">11:09 PM - 1 Jan 2016</time>
        </p>
      </div>
    </div>
  );
};

export default Card;
