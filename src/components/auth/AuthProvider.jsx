// src/components/auth/AuthProvider.jsx
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('👤 onAuthStateChanged ejecutado. fbUser:', fbUser);
      setUser(fbUser);

      if (fbUser) {
        try {
          const docRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const userProfile = snap.data();
            setProfile(userProfile);
            console.log('✅ Perfil encontrado:', userProfile);
          } else {
            console.warn('⚠️ No se encontró el perfil del usuario en Firestore');
            setProfile({ username: 'usuario' }); // fallback
          }
        } catch (error) {
          console.error('❌ Error al obtener perfil:', error.message);

          // fallback para modo offline
          setProfile({ username: 'usuario' });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
