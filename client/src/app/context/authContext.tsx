'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  registerUser: (formData: Record<string, unknown>) => Promise<void>;
  loginUser: (formData: Record<string, unknown>) => Promise<void>;
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
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Inside the AuthProvider component
    useEffect(() => {
    const urlToken = searchParams.get('token');

    if (urlToken) {
        // Priority 1: Handle token from Google redirect
        localStorage.setItem('authToken', urlToken);
        setToken(urlToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
        router.replace('/dashboard'); // Clean the URL
    } else {
        // Priority 2: Handle existing token from a previous session
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }
    }, [searchParams, router]);


  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const registerUser = async (formData: Record<string, unknown>) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      router.push('/dashboard'); // Redirect to dashboard after successful registration
    } catch (error) {
      console.error('Registration failed:', error);

      // Here I would typically set an error state to show to the user
      
    }
  };

  const loginUser = async (formData: Record<string, unknown>) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };
  
  const contextValue = { token, registerUser, loginUser, logoutUser };

  return (
    <AuthContext.Provider value={contextValue}>
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