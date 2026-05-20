import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored token and user profile on startup
    const storedToken = localStorage.getItem('cineglow_token');
    const storedUser = localStorage.getItem('cineglow_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // Save token and parse a basic profile from email
      const tokenPayload = parseJwt(data.token);
      const role = tokenPayload?.role || 'USER';
      const userProfile = { email, fullName: email.split('@')[0], role };
      
      localStorage.setItem('cineglow_token', data.token);
      localStorage.setItem('cineglow_user', JSON.stringify(userProfile));
      
      setToken(data.token);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (email, fullName, googleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, googleId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Xác thực Google thất bại');
      }

      const tokenPayload = parseJwt(data.token);
      const role = tokenPayload?.role || 'USER';
      const userProfile = { email, fullName, googleId, role };
      
      localStorage.setItem('cineglow_token', data.token);
      localStorage.setItem('cineglow_user', JSON.stringify(userProfile));
      
      setToken(data.token);
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cineglow_token');
    localStorage.removeItem('cineglow_user');
    setToken(null);
    setUser(null);
  };

  // Helper helper to run authorized API fetch requests
  const fetchWithAuth = async (url, options = {}) => {
    const activeToken = token || localStorage.getItem('cineglow_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    return fetch(fullUrl, {
      ...options,
      headers
    });
  };

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const updateUserProfile = (updatedFields) => {
    if (user) {
      const newUser = { ...user, ...updatedFields };
      setUser(newUser);
      localStorage.setItem('cineglow_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginWithGoogle, logout, fetchWithAuth, isAuthOpen, setIsAuthOpen, updateUserProfile }}>
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
