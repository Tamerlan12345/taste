import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on initial load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await axios.get('/api/auth-status');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const login = async (password) => {
    try {
      await axios.post('/api/login', { password });
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      throw new Error('Invalid password');
    }
  };

  const logout = () => {
    // We would also call a /api/logout endpoint here
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
