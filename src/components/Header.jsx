import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Menu, X, User, LogOut } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import LocationModal from './LocationModal';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { selectedLocation, setSelectedLocation } = useEvents();
  const { openAuthModal, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const isHome = location.pathname === '/';
  const profileRef = React.useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    if (user) {
      setIsProfileOpen(!isProfileOpen);
    } else {
      openAuthModal();
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'For you', path: '/for-you' },
    { name: 'Dining', path: '/dining' },
    { name: 'Events', path: '/events' },
    { name: 'Movies', path: '/movies' },
    { name: 'Activities', path: '/activities' },
  ];

  return (
    <>
      <header className={`absolute w-full top-0 left-0 z-50 ${isHome ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
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
            
            {/* Mobile Location - only on Home */}
            {isHome && (
              <div className="md:hidden">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center space-x-1 text-white hover:text-gray-900 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{selectedLocation}</span>
                </button>
              </div>
            )}

            {/* Mobile Location - on non-home pages (left) */}
            {!isHome && (
              <div className="md:hidden">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center space-x-1 text-gray-800 hover:text-gray-900 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{selectedLocation}</span>
                </button>
              </div>
            )}

            {/* Desktop Location - only on Home */}
            {isHome && (
              <div className="hidden md:block">
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center space-x-1 text-white hover:text-gray-900 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{selectedLocation}</span>
                </button>
              </div>
            )}

            {/* Center: Navigation - only on Home */}
            {isHome && (
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
            )}
            
            {/* Right Side: Search, Profile & Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search for events..."
                  className="w-64 pl-9 pr-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
              {/* Profile greeting (desktop) */}
              <div className={`hidden md:flex items-center gap-2 ${isHome ? 'text-white' : 'text-gray-800'}`} ref={profileRef}>
                <div className="relative">
                  <button
                    aria-label="Profile"
                    onClick={handleProfileClick}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isHome
                        ? 'bg-white/20 border border-white/40 hover:bg-white/30'
                        : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <User className={`w-5 h-5 ${isHome ? '' : 'text-gray-700'}`} />
                  </button>
                  
                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && user && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name || `+91-${user.phone}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email || 'Welcome back!'}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="font-medium">
                  {user ? 
                    (user.name ? `Hi, ${user.name.split(' ')[0]}` : 
                    (user.phone ? `Hi, +91-${user.phone}` : 'Hi, User')) : 
                    'Hi, Guest'}
                </span>
              </div>
              {/* Profile button (mobile) */}
              <div className="md:hidden relative" ref={profileRef}>
                <button
                  aria-label="Profile"
                  onClick={handleProfileClick}
                  className={`p-2 ${isHome ? 'text-white' : 'text-gray-800'}`}
                >
                  <User className="w-6 h-6" />
                </button>
                
                {/* Mobile Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || `+91-${user.phone}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email || 'Welcome back!'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isHome && (
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-white"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - only on Home */}
        {isHome && isMenuOpen && (
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
