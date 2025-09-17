import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Crosshair } from 'lucide-react';
import { popularCities, allCities } from '../assets/data/cities';

const LocationModal = ({ isOpen, onClose, setSelectedLocation }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleCitySelect = (city) => {
    setSelectedLocation(city);
    onClose();
  };

  const filteredCities = useMemo(() => {
    if (!searchTerm) {
      return allCities;
    }
    return allCities.filter(city =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const groupedCities = useMemo(() => {
    return filteredCities.reduce((acc, city) => {
      const firstLetter = city[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(city);
      return acc;
    }, {});
  }, [filteredCities]);
  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Select Location</h2>
              <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search city, area or locality"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Use Current Location */}
              <button className="flex items-center space-x-2 text-red-600 font-medium mb-6 hover:text-red-800">
                <Crosshair className="w-5 h-5" />
                <span>Use Current Location</span>
              </button>

              {/* Popular Cities */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Popular Cities</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {popularCities.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => handleCitySelect(name)}
                      className="flex flex-col items-center justify-center space-y-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                      <Icon className="w-8 h-8 text-purple-600" />
                      <span className="text-sm font-medium text-gray-800 text-center">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

             
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;
