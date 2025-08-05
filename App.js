// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthProvider from './src/components/auth/AuthProvider';
import AuthScreen from './src/components/auth/AuthScreen';
import RegisterScreen from './src/components/auth/RegisterScreen';
import LoginScreen from './src/components/auth/LoginScreen';
import ProfileSetupScreen from './src/components/ProfileSetupScreen';
import Home from './src/components/home/Home';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ProfileSetupScreen" component={ProfileSetupScreen} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
