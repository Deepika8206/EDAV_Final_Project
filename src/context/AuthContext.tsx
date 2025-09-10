import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { User, Hospital } from '../types';

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  userType: 'patient' | 'hospital' | null;
  login: (firebaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => Promise<void>; // Modified login
  logout: () => void;
  isAuthenticated: boolean;
  loadingAuth: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supabaseUser = session.user;
        let fetchedUserType: 'patient' | 'hospital' | null = null;
        let fetchedUserData: User | Hospital | null = null;

        try {
          // Check if user is a patient
          const { data: patientData } = await supabase
            .from('patients')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (patientData) {
            fetchedUserData = patientData as User;
            fetchedUserType = 'patient';
          } else {
            // Check if user is a hospital
            const { data: hospitalData } = await supabase
              .from('hospitals')
              .select('*')
              .eq('id', supabaseUser.id)
              .single();

            if (hospitalData) {
              fetchedUserData = hospitalData as Hospital;
              fetchedUserType = 'hospital';
            }
          }

          if (fetchedUserData && fetchedUserType) {
            if (fetchedUserType === 'patient') {
              setUser(fetchedUserData as User);
              setHospital(null);
            } else {
              setHospital(fetchedUserData as Hospital);
              setUser(null);
            }
            setUserType(fetchedUserType);
            setIsAuthenticated(true);
            localStorage.setItem('userType', fetchedUserType);
          } else {
            setUser({ id: supabaseUser.id, email: supabaseUser.email || '', name: supabaseUser.user_metadata?.name || 'Unknown User' });
            setHospital(null);
            setUserType(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser({ id: supabaseUser.id, email: supabaseUser.email || '', name: 'Error User' });
          setHospital(null);
          setUserType(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setHospital(null);
        setUserType(null);
        setIsAuthenticated(false);
        localStorage.clear();
      }
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (supabaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => {
    try {
      if (type === 'patient') {
        await supabase.from('patients').upsert({ ...userData, id: supabaseUid });
        setUser(userData as User);
        setHospital(null);
      } else {
        await supabase.from('hospitals').upsert({ ...userData, id: supabaseUid });
        setHospital(userData as Hospital);
        setUser(null);
      }
      setUserType(type);
      setIsAuthenticated(true);
      localStorage.setItem('userType', type);
    } catch (error) {
      console.error('Error saving user data during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hospital,
        userType,
        login,
        logout,
        isAuthenticated,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};