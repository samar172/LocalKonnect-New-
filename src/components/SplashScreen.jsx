import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">LocalKonnect</h1>
      </motion.div>
      <motion.div 
        className="absolute bottom-10 text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Discover what's happening around you.
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
