import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { User, Hospital } from '../types';

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  userType: 'patient' | 'hospital' | null;
  login: (supabaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => Promise<void>;
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

  // Add initial session check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const supabaseUser = session.user;
        
        try {
          // Use Promise.race to timeout after 5 seconds
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
          );
          
          const patientPromise = supabase
            .from('patients')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
            
          const { data: patientData, error: patientError } = await Promise.race([
            patientPromise,
            timeoutPromise
          ]) as any;

          if (patientData && !patientError) {
            const userData = {
              id: patientData.id,
              name: patientData.name,
              email: patientData.email,
              mobile: patientData.mobile,
              dateOfBirth: patientData.date_of_birth,
              gender: patientData.gender,
              bloodGroup: patientData.blood_group,
              walletAddress: patientData.wallet_address,
              emergencyContact: patientData.emergency_contact,
              qrCode: patientData.qr_code,
            } as User;
            
            setUser(userData);
            setHospital(null);
            setUserType('patient');
            setIsAuthenticated(true);
            localStorage.setItem('userType', 'patient');
          } else {
            // Try hospital table
            const hospitalPromise = supabase
              .from('hospitals')
              .select('*')
              .eq('id', supabaseUser.id)
              .single();
              
            const { data: hospitalData, error: hospitalError } = await Promise.race([
              hospitalPromise,
              timeoutPromise
            ]) as any;

            if (hospitalData && !hospitalError) {
              setHospital(hospitalData as Hospital);
              setUser(null);
              setUserType('hospital');
              setIsAuthenticated(true);
              localStorage.setItem('userType', 'hospital');
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
          // Set authenticated anyway to prevent infinite loading
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

    // Set a maximum loading time
    const maxLoadingTimeout = setTimeout(() => {
      setLoadingAuth(false);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(maxLoadingTimeout);
    };
  }, []);

  const login = async (supabaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => {
    try {
      if (type === 'patient') {
        const { error } = await supabase.from('patients').upsert({ ...userData, id: supabaseUid });
        if (error) throw error;
        setUser(userData as User);
        setHospital(null);
      } else {
        const { error } = await supabase.from('hospitals').upsert({ ...userData, id: supabaseUid });
        if (error) throw error;
        setHospital(userData as Hospital);
        setUser(null);
      }
      setUserType(type);
      setIsAuthenticated(true);
      localStorage.setItem('userType', type);
    } catch (error) {
      console.error('Error saving user data:', error);
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