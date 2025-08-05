// src/components/auth/AuthProvider.jsx
import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(docRef);
        const isComplete = userDoc.exists() && userDoc.data().profileCompleted;
        setProfileComplete(isComplete);
      } else {
        setUser(null);
        setProfileComplete(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, profileComplete }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    color: colors.TEXTO_PRINCIPAL,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.PRIMARIO,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: colors.SECUNDARIO,
  },
  buttonText: {
    color: colors.BLANCO,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
