import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('ayurvaid_token') : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('ayurvaid_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('ayurvaid_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ayurvaid_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateEmail = async (newEmail) => {
    try {
      const response = await axios.put('/api/auth/update-email', { email: newEmail });
      if (response.data.success) {
        setUser({ ...user, email: response.data.email });
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update email' };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/api/auth/update-password', { currentPassword, newPassword });
      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update password' };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete('/api/auth/delete-account');
      if (response.data.success) {
        logout();
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to delete account' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateEmail,
    updatePassword,
    deleteAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};