import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className }) => {
  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-md rounded-lg p-6 border border-cyan-300/20 shadow-lg ${className}`}
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
