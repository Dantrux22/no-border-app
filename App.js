<<<<<<< HEAD
// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/components/global/colors';

import AuthProvider, { AuthContext } from './src/components/auth/AuthProvider';
import AuthScreen from './src/components/auth/AuthScreen';
import LoginScreen from './src/components/auth/LoginScreen';
import RegisterScreen from './src/components/auth/RegisterScreen';
import Home from './src/components/home/Home';
import ProfileSetupScreen from './src/components/ProfileSetupScreen';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/components/firebaseConfig';

const Stack = createNativeStackNavigator();
=======
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import Header from './src/components/Header';
import Home from './src/components/home/Home';
import { colors } from './src/components/global/colors';
>>>>>>> parent of 0c09732 (integracion)

export default function App() {
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [initialScreen, setInitialScreen] = useState('Auth');

  return (
<<<<<<< HEAD
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <NavigationContainer>
        <AuthContext.Consumer>
          {({ user }) => {
            // Redirijo a ProfileSetup si hace falta
            useEffect(() => {
              const checkProfile = async () => {
                if (user) {
                  const userDoc = await getDoc(doc(db, 'users', user.uid));
                  const data = userDoc.data();
                  setInitialScreen(data?.profileCompleted ? 'Home' : 'ProfileSetup');
                } else {
                  setInitialScreen('Auth');
                }
                setCheckingProfile(false);
              };
              checkProfile();
            }, [user]);

            if (checkingProfile) return null;

            return (
              <Stack.Navigator
                screenOptions={{ headerShown: false }}
                initialRouteName={initialScreen}
              >
                {!user ? (
                  <>
                    <Stack.Screen name="Auth" component={AuthScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : (
                  <>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen
                      name="ProfileSetup"
                      component={ProfileSetupScreen}
                    />
                  </>
                )}
              </Stack.Navigator>
            );
          }}
        </AuthContext.Consumer>
      </NavigationContainer>
    </AuthProvider>
=======
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <Header title="No Border" />
      <Home />
    </SafeAreaView>
>>>>>>> parent of 0c09732 (integracion)
  );
}
