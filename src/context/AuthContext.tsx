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

export const DEV_ALLOWED_EMAILS = [
  'lluviadeideaseditorial@gmail.com',
  'admin@lluviadeideasgt.com'
];

export const isDevAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return DEV_ALLOWED_EMAILS.includes(email.toLowerCase().trim());
};

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

  // Resolve admin status from the Firestore role, master email, or custom claim (token.admin)
  const resolveAdminStatus = async (firebaseUser: User, profile: UserProfile | null) => {
    const isMasterAdminEmail = firebaseUser.email?.toLowerCase() === 'lluviadeideaseditorial@gmail.com' || firebaseUser.email?.toLowerCase() === 'admin@lluviadeideasgt.com';
    const profileIsAdmin = profile?.role === 'admin' || isMasterAdminEmail;
    let claimsIsAdmin = false;
    try {
      const tokenResult = await getIdTokenResult(firebaseUser);
      claimsIsAdmin = tokenResult.claims.admin === true;
    } catch (err) {
      console.warn('Could not read custom claims:', err);
    }
    setIsAdmin(profileIsAdmin || claimsIsAdmin || isMasterAdminEmail);
  };

  // Sync user profile document in Firestore
  const syncUserProfile = async (firebaseUser: User, extraData: Partial<UserProfile> = {}): Promise<UserProfile | null> => {
    try {
      const isMasterAdminEmail = firebaseUser.email?.toLowerCase() === 'lluviadeideaseditorial@gmail.com' || firebaseUser.email?.toLowerCase() === 'admin@lluviadeideasgt.com';
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data() as UserProfile;
        const targetRole = isMasterAdminEmail ? 'admin' : (existingData.role || extraData.role || 'student');
        const targetDisplayName = isMasterAdminEmail && (!existingData.displayName || existingData.displayName === 'Usuario Portal')
          ? 'Administrador'
          : (firebaseUser.displayName || existingData.displayName || extraData.displayName || 'Usuario Portal');

        await updateDoc(userRef, {
          email: firebaseUser.email || existingData.email,
          role: targetRole,
          displayName: targetDisplayName,
          lastLoginAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL || existingData.photoURL || null,
        });

        const profile: UserProfile = {
          ...existingData,
          email: firebaseUser.email || existingData.email,
          role: targetRole,
          displayName: targetDisplayName,
          photoURL: firebaseUser.photoURL || existingData.photoURL,
        };
        setUserProfile(profile);
        return profile;
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: isMasterAdminEmail ? 'Administrador' : (firebaseUser.displayName || extraData.displayName || 'Usuario Portal'),
          photoURL: firebaseUser.photoURL || null,
          role: isMasterAdminEmail ? 'admin' : (extraData.role || 'student'),
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
      try {
        if (currentUser) {
          // Bloqueo estricto durante desarrollo: solo la cuenta editorial oficial tiene acceso
          if (!isDevAllowedEmail(currentUser.email)) {
            console.warn(`[AuthContext] Acceso bloqueado en desarrollo para: ${currentUser.email}. Cerrando sesión.`);
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          setUser(currentUser);
          const profile = await syncUserProfile(currentUser);
          await resolveAdminStatus(currentUser, profile);
        } else {
          setUser(null);
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
    if (!isDevAllowedEmail(email)) {
      throw new Error(
        'Acceso restringido temporalmente: El portal está en fase de desarrollo activo. Por ahora solo se permite el acceso a la cuenta editorial oficial (lluviadeideaseditorial@gmail.com).'
      );
    }
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (!isDevAllowedEmail(res.user.email)) {
        await signOut(auth);
        throw new Error('Cuenta no autorizada durante el desarrollo.');
      }
      const profile = await syncUserProfile(res.user);
      await resolveAdminStatus(res.user, profile);
    }
  };

  const register = async (email: string, pass: string, name: string, role: 'student' | 'teacher' = 'student') => {
    if (!isDevAllowedEmail(email)) {
      throw new Error(
        'Registro deshabilitado temporalmente: La creación de cuentas públicas está pausada mientras se calibran los módulos didácticos y de laboratorio.'
      );
    }
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const profile = await syncUserProfile(res.user, { displayName: name, role });
      await resolveAdminStatus(res.user, profile);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    if (res.user) {
      if (!isDevAllowedEmail(res.user.email)) {
        await signOut(auth);
        throw new Error(
          `Acceso restringido: El correo (${res.user.email || 'desconocido'}) no está autorizado durante el desarrollo. Solo se permite el acceso a la cuenta editorial oficial (lluviadeideaseditorial@gmail.com).`
        );
      }
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
