import React from 'react';

const Card = ({ children, className }) => {
  // The framer-motion animation was removed to simplify the component.
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-cyan-300/20 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
