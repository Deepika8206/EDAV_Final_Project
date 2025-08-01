import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../firebase'; // Ensure 'db' is imported here as well
import { User, Hospital } from '../types'; // Assuming these types are defined correctly

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in via Firebase Auth
        let fetchedUserType: 'patient' | 'hospital' | null = null;
        let fetchedUserData: User | Hospital | null = null;

        try {
          // Attempt to fetch patient data first
          const patientDocRef = doc(db, 'patients', firebaseUser.uid);
          const patientDocSnap = await getDoc(patientDocRef);

          if (patientDocSnap.exists()) {
            fetchedUserData = { id: firebaseUser.uid, ...patientDocSnap.data() } as User;
            fetchedUserType = 'patient';
          } else {
            // If not a patient, check if it's a hospital
            const hospitalDocRef = doc(db, 'hospitals', firebaseUser.uid);
            const hospitalDocSnap = await getDoc(hospitalDocRef);

            if (hospitalDocSnap.exists()) {
              fetchedUserData = { id: firebaseUser.uid, ...hospitalDocSnap.data() } as Hospital;
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
            // Optionally, store userType in localStorage for quicker initial load next time
            localStorage.setItem('userType', fetchedUserType);
          } else {
            // Firebase user exists, but no corresponding patient/hospital document in Firestore.
            // This can happen if a user registers but the profile data saving fails,
            // or if it's a new user and data hasn't been saved yet.
            console.warn("Firebase user exists but no profile data found in Firestore for UID:", firebaseUser.uid);
            // Fallback: Set a basic user object
            setUser({ id: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || 'Unknown User' });
            setHospital(null);
            setUserType(null); // We don't know the type without profile data
            setIsAuthenticated(false); // Or true, depending on if you consider them "authenticated" without full profile
          }

        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          // Fallback to basic Firebase user info if Firestore fails
          setUser({ id: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || 'Error User' });
          setHospital(null);
          setUserType(null);
          setIsAuthenticated(false);
        }

      } else {
        // User is NOT logged in
        setUser(null);
        setHospital(null);
        setUserType(null);
        setIsAuthenticated(false);
        // Clear all session data (important for security and consistency)
        localStorage.clear();
      }
      setLoadingAuth(false); // Auth state has been determined
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []); // Empty dependency array means this runs once on mount/unmount

  // Modified login function to also save data to Firestore
  const login = async (firebaseUid: string, userData: User | Hospital, type: 'patient' | 'hospital') => {
    try {
      if (type === 'patient') {
        await setDoc(doc(db, 'patients', firebaseUid), { ...userData, id: firebaseUid });
        setUser(userData as User);
        setHospital(null);
      } else {
        await setDoc(doc(db, 'hospitals', firebaseUid), { ...userData, id: firebaseUid });
        setHospital(userData as Hospital);
        setUser(null);
      }
      setUserType(type);
      setIsAuthenticated(true);
      localStorage.setItem('userType', type); // Store user type in localStorage (optional, but can speed up initial role detection)
    } catch (error) {
      console.error("Error saving user data to Firestore during login:", error);
      throw error; // Re-throw to allow calling component to handle
    }
  };

  const logout = async () => {
    try {
      await auth.signOut(); // Sign out from Firebase
      // The onAuthStateChanged listener will automatically update the states
      // upon successful signOut, so manual state clearing here is redundant but harmless.
    } catch (error) {
      console.error("Error during Firebase logout:", error);
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