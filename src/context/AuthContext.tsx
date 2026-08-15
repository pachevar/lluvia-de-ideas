import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile, 
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'student' | 'teacher' | 'admin' | 'guest';
  createdAt?: unknown;
  lastLoginAt?: unknown;
  institution?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: 'student' | 'teacher') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Resolve admin status from the Firestore role or from a custom claim (token.admin)
  const resolveAdminStatus = async (firebaseUser: User, profile: UserProfile | null) => {
    const profileIsAdmin = profile?.role === 'admin';
    let claimsIsAdmin = false;
    try {
      const tokenResult = await getIdTokenResult(firebaseUser);
      claimsIsAdmin = tokenResult.claims.admin === true;
    } catch (err) {
      console.warn('Could not read custom claims:', err);
    }
    setIsAdmin(profileIsAdmin || claimsIsAdmin);
  };

  // Sync user profile document in Firestore
  const syncUserProfile = async (firebaseUser: User, extraData: Partial<UserProfile> = {}): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data() as UserProfile;
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL || existingData.photoURL || null,
          displayName: firebaseUser.displayName || existingData.displayName || null,
        });
        const profile: UserProfile = {
          ...existingData,
          displayName: firebaseUser.displayName || existingData.displayName,
          photoURL: firebaseUser.photoURL || existingData.photoURL,
        };
        setUserProfile(profile);
        return profile;
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || extraData.displayName || 'Usuario Portal',
          photoURL: firebaseUser.photoURL || null,
          role: extraData.role || 'student',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          institution: extraData.institution || '',
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.error('Error syncing user profile in Firestore:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      try {
        if (currentUser) {
          const profile = await syncUserProfile(currentUser);
          await resolveAdminStatus(currentUser, profile);
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error procesando autenticación:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      const profile = await syncUserProfile(res.user);
      await resolveAdminStatus(res.user, profile);
    }
  };

  const register = async (email: string, pass: string, name: string, role: 'student' | 'teacher' = 'student') => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const profile = await syncUserProfile(res.user, { displayName: name, role });
      await resolveAdminStatus(res.user, profile);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    if (res.user) {
      const profile = await syncUserProfile(res.user);
      await resolveAdminStatus(res.user, profile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isAdmin,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      resetPassword,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
