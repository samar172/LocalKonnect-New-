import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext({
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  user: null,
  login: (userData) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem('lk_auth_token');
    const userData = localStorage.getItem('lk-user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('lk_auth_token');
        localStorage.removeItem('lk-user');
      }
    }
  }, []);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback((userData) => {
    // Ensure we have all required user data
    const userWithDefaults = {
      ...userData,
      name: userData.name || `+91-${userData.phone || ''}`,
      phone: userData.phone || ''
    };
    setUser(userWithDefaults);
    localStorage.setItem('lk_auth_token', userData.token);
    localStorage.setItem('lk-user', JSON.stringify(userWithDefaults));
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lk_auth_token');
    localStorage.removeItem('lk-user');
    setIsAuthModalOpen(false);
  }, []);

  const value = useMemo(() => ({
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    user,
    login,
    logout,
  }), [isAuthModalOpen, openAuthModal, closeAuthModal, user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
