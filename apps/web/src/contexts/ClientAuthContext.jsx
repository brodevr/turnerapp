import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [clientUser, setClientUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientUser = useCallback(async () => {
    try {
      const data = await apiClient.clientAuth.getUser();
      setClientUser(data);
    } catch (error) {
      console.error('Failed to fetch client user:', error);
      apiClient.clientAuth.logout(); // Clears local storage
      setClientUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('client_token')) {
      fetchClientUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchClientUser]);

  const login = async (email, password) => {
    const data = await apiClient.clientAuth.login(email, password);
    setClientUser(data.record);
    return data;
  };

  const register = async (userData) => {
    const data = await apiClient.clientAuth.register(userData);
    setClientUser(data.record);
    return data;
  };

  const googleLogin = async (googleData) => {
    const data = await apiClient.clientAuth.googleLogin(googleData);
    setClientUser(data.record);
    return data;
  };

  const logout = async () => {
    try {
      if (clientUser) {
        await apiClient.clientAuth.logout();
      }
    } catch (err) {
      console.error('Logout error', err);
    }
    setClientUser(null);
    // Token is cleared via the apiClient logout method automatically
  };

  return (
    <ClientAuthContext.Provider value={{ clientUser, isLoading, login, register, googleLogin, logout }}>
      {children}
    </ClientAuthContext.Provider>
  );
};
