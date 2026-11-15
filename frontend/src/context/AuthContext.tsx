import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { request } from '../services/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<boolean>;
  loginAsDemo: (role?: 'analyst' | 'user') => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chillmode_token') || localStorage.getItem('nexora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { addNotification } = useNotification();

  // Load existing session on initial mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('chillmode_token') || localStorage.getItem('nexora_token');
      if (storedToken) {
        try {
          const res = await request<{ success: boolean; user: User }>('/auth/profile');
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('chillmode_token');
          localStorage.removeItem('nexora_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.success && res.token) {
        localStorage.setItem('chillmode_token', res.token);
        setToken(res.token);
        setUser(res.user);
        closeAuthModal();
        addNotification({
          type: 'success',
          title: 'Welcome back!',
          message: `Logged in as ${res.user.name} (${res.user.role.toUpperCase()})`,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid credentials.',
      });
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string, role = 'analyst'): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: pass, role }),
      });

      if (res.success && res.token) {
        localStorage.setItem('chillmode_token', res.token);
        setToken(res.token);
        setUser(res.user);
        closeAuthModal();
        addNotification({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to CHILLMODE, ${res.user.name}! Your workspace is ready.`,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Registration Error',
        message: err.message || 'Unable to create account.',
      });
      return false;
    }
  };

  const loginAsDemo = (role: 'analyst' | 'user' = 'user') => {
    const demoUser: User = {
      id: 'demo_user_01',
      name: 'Echo Traveler',
      email: 'listener@chillmode.io',
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        defaultAudioQuality: 'high',
        enableTelemetry: false,
        autoSaveSearches: true,
      },
    };
    setUser(demoUser);
    closeAuthModal();
    addNotification({
      type: 'info',
      title: 'Demo Mode Activated',
      message: `Signed in as Demo ${role.toUpperCase()}. Full access enabled!`,
    });
  };

  const logout = () => {
    localStorage.removeItem('chillmode_token');
    localStorage.removeItem('nexora_token');
    setToken(null);
    setUser(null);
    addNotification({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been disconnected from the session.',
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        loginAsDemo,
        logout,
        updateUser,
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

