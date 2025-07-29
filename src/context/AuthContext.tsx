import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Hospital } from '../types';

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  userType: 'patient' | 'hospital' | null;
  login: (userData: User | Hospital, type: 'patient' | 'hospital') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [userType, setUserType] = useState<'patient' | 'hospital' | null>(null);

  const login = (userData: User | Hospital, type: 'patient' | 'hospital') => {
    if (type === 'patient') {
      setUser(userData as User);
      setHospital(null);
    } else {
      setHospital(userData as Hospital);
      setUser(null);
    }
    setUserType(type);
  };

  const logout = () => {
    setUser(null);
    setHospital(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hospital,
        userType,
        login,
        logout,
        isAuthenticated: !!(user || hospital),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};