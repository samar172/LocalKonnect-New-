import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext({
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  user: null,
  login: (phone) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const login = useCallback((phone) => {
    setUser({ phone });
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
