import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('learnhub_token');
        const storedUser = localStorage.getItem('learnhub_user');
        
        if (token && storedUser) {
          // Verify token is still valid by fetching profile
          const profile = await api('/auth/profile');
          setUser(profile.user);
        }
      } catch (error) {
        console.log('Session invalid, clearing auth');
        localStorage.removeItem('learnhub_token');
        localStorage.removeItem('learnhub_user');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    console.log('AuthContext.login called with:', { 
      emailType: typeof email, 
      passwordType: typeof password 
    });

    // ✅ Validate inputs are strings
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Email and password must be strings');
    }

    const response = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // ✅ Send plain object with string values
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(),  // ✅ String, trimmed, lowercased
        password: password                   // ✅ String
      })
    });

    // ✅ Verify response structure
    if (!response.token || !response.user) {
      console.error('Invalid auth response:', response);
      throw new Error('Server returned invalid authentication response');
    }

    // ✅ Save to localStorage
    localStorage.setItem('learnhub_token', response.token);
    localStorage.setItem('learnhub_user', JSON.stringify(response.user));
    setUser(response.user);
  
    return response.user;
  };

  const register = async (userData) => {
    const response = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    // ✅ CRITICAL: Save BOTH token and user (same as login)
    if (response.token && response.user) {
      localStorage.setItem('learnhub_token', response.token);
      localStorage.setItem('learnhub_user', JSON.stringify(response.user));
      setUser(response.user);
      return response.user;
    }
    throw new Error('Registration failed: no token received');
  };

  const logout = () => {
    localStorage.removeItem('learnhub_token');
    localStorage.removeItem('learnhub_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('learnhub_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUser, 
      loading: loading || !initialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};