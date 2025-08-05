<<<<<<< HEAD
// AuthScreen.jsx
import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';

const AuthScreen = ({ navigation }) => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      navigation.replace(user ? 'Home' : 'Login');
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.PRIMARIO} />
    </View>
  );
};

=======
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


>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.FONDO,
  },
});

export default AuthScreen;
