import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (username, email, password, fullName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({
        username,
        email,
        password,
        fullName,
      });
      const { token: newToken } = response.data;
      const userData = {
        username,
        email,
        fullName,
      };

      setToken(newToken);
      setUser(userData);
      sessionStorage.setItem('authToken', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({
        username,
        password,
      });
      const { token: newToken, username: returnedUsername, email } = response.data;
      const userData = {
        username: returnedUsername,
        email,
      };

      setToken(newToken);
      setUser(userData);
      sessionStorage.setItem('authToken', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
