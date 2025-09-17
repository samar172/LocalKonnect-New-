import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Menu, X } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import LocationModal from './LocationModal';

const Header = () => {
  const { selectedLocation, setSelectedLocation } = useEvents();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('');

  const navItems = [
    { name: 'For you', path: '/for-you' },
    { name: 'Dining', path: '/dining' },
    { name: 'Events', path: '/events' },
    { name: 'Movies', path: '/movies' },
    { name: 'Activities', path: '/activities' },
  ];

  return (
    <>
      <header className="absolute w-full top-0 left-0 z-50 bg-transparent">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo */}
            <div className="hidden md:flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/src/assets/images/LK.png" 
                  alt="LocalKonnect Logo" 
                  className="h-14 w-auto"
                />
              </Link>
            </div>
            
            {/* Mobile Location */}
            <div className="md:hidden">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center space-x-1 text-white hover:text-gray-900 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{selectedLocation}</span>
              </button>
            </div>

            {/* Desktop Location */}
            <div className="hidden md:block">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center space-x-1 text-white hover:text-gray-900 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{selectedLocation}</span>
              </button>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 font-medium rounded-full transition-all duration-300 ${
                    activeLink === item.path || location.pathname.includes(item.path.toLowerCase())
                      ? 'text-white bg-brand-primary shadow-md'
                      : 'text-white hover:text-brand-primary hover:bg-white/20'
                  }`}
                  onMouseEnter={() => setActiveLink(item.path)}
                  onMouseLeave={() => setActiveLink('')}
                >
                  {item.name}
                  <span 
                    className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-brand-primary transition-all duration-300"
                    style={{
                      transform: `translateX(-50%) ${activeLink === item.path || location.pathname.includes(item.path.toLowerCase()) ? 'scaleX(1)' : 'scaleX(0)'}`,
                      width: activeLink === item.path || location.pathname.includes(item.path.toLowerCase()) ? '60%' : '0%'
                    }}
                  />
                </Link>
              ))}
            </nav>
            
            {/* Right Side: Search & Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for events..."
                  className="w-64 pl-9 pr-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <nav className="space-y-2 px-4 py-4 bg-white">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block py-2 px-3 rounded-lg transition-colors duration-200 ${
                    location.pathname.includes(item.path.toLowerCase())
                      ? 'font-semibold text-brand-primary bg-brand-primary/10'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        setSelectedLocation={setSelectedLocation}
      />
    </>
  );
};

export default Header;
