import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import ApiConnector from '../config/ApiConnector';
import localUsers from '../data/localUsers.json';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('Attempting login with:', { email });
      const response = await ApiConnector.makeRequest(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        const userData = { id: data.user.id, email: data.user.email, name: data.user.name };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store auth data
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        return { success: true };
      } else {
        const errorData = await response.json();
        console.log('Login error:', errorData);
        return { success: false, error: errorData.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Login network error:', error);
      // Fallback to local hardcoded users for offline testing
      try {
        const local = localUsers.find(u => u.email === email && u.password === password);
        if (local) {
          const userData = { id: local.id, email: local.email, name: local.name };
          await AsyncStorage.setItem('userToken', 'local-test-token');
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true, offline: true };
        }
      } catch (e) {
        console.warn('Local fallback failed:', e);
      }

      return { success: false, error: 'Error de conexión. Verifica que el servidor esté corriendo.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      console.log('Attempting signup with:', { name, email });
      
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await ApiConnector.makeRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      clearTimeout(timeoutId);
      console.log('Signup response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Signup successful:', data);
        const userData = { id: data.user.id, email: data.user.email, name: data.user.name };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store auth data
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Error de servidor' }));
        console.log('Signup error:', errorData);
        return { success: false, error: errorData.message || 'Error al crear la cuenta' };
      }
    } catch (error) {
      console.error('Signup network error:', error);
      if (error.name === 'AbortError') {
        return { success: false, error: 'La solicitud tardó demasiado. Verifica tu conexión.' };
      }
      return { success: false, error: `Error de conexión: ${error.message}` };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.warn('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        logout,
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