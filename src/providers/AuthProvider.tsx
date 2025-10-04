'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, token: string) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    
    // Redirect based on current path
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/user')) {
      window.location.href = '/';
    } else {
      // Just reload the page to update UI state
      window.location.reload();
    }
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}