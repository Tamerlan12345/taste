import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await api.get('/auth-status');
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const login = async (password) => {
    try {
      await api.post('/login', { password });
      setIsAuthenticated(true);
      return true;
    } catch {
      setIsAuthenticated(false);
      throw new Error('Invalid password');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

