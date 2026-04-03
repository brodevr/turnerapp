import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { setAuthToken } from '@/lib/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_record');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const user = await apiClient.auth.getUser();
          setCurrentAdmin(user);
          setIsAuthenticated(true);
          localStorage.setItem('admin_record', JSON.stringify(user));
        } catch (error) {
          setAuthToken(null);
          localStorage.removeItem('admin_record');
          setCurrentAdmin(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiClient.auth.login(email, password);
      // data = { token, record }
      setAuthToken(data.token);
      localStorage.setItem('admin_record', JSON.stringify(data.record));
      setCurrentAdmin(data.record);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch(e) {}
    setAuthToken(null);
    localStorage.removeItem('admin_record');
    setCurrentAdmin(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentAdmin,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
