'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthTokenHandler } from './AuthTokenHandler';

// Define the shape of the form data for type safety
type AuthFormData = {
  email?: string;
  password?: string;
};

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  setAuthToken: (newToken: string) => void;
  registerUser: (formData: AuthFormData) => Promise<void>;
  loginUser: (formData: AuthFormData) => Promise<void>;
  logoutUser: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to set the token everywhere it's needed
  const setAuthToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // This effect now ONLY checks localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const registerUser = async (formData: AuthFormData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      const { token: newToken } = response.data;
      setAuthToken(newToken);
      router.push('/home'); 
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; // Re-throw error to be caught by the component
    }
  };

  const loginUser = async (formData: AuthFormData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token: newToken } = response.data;
      setAuthToken(newToken);
      router.push('/home');
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw error to be caught by the component
    }
  };

  const logoutUser = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };
  
  const contextValue = { token, setAuthToken, registerUser, loginUser, logoutUser };

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthTokenHandler />
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};