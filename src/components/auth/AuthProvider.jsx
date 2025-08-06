import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext({
  user: null,
  profile: null,
  setProfile: () => {},
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('👤 onAuthStateChanged ejecutado. fbUser:', fbUser);

      setUser(fbUser);

      if (fbUser) {
        try {
          console.log('📄 Buscando perfil en Firestore para UID:', fbUser.uid);
          const docRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const userProfile = snap.data();
            console.log('✅ Perfil encontrado:', userProfile);
            setProfile(userProfile);
          } else {
            console.warn('⚠️ No se encontró el perfil del usuario en Firestore');
            setProfile(null);
          }
        } catch (error) {
          console.error('❌ Error al obtener perfil del usuario:', error.message);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  if (initializing) return null;

  return (
    <AuthContext.Provider value={{ user, profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
