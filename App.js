import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import { colors } from './src/components/global/colors';
import AuthProvider from './src/components/auth/AuthProvider';

import AuthScreen from './src/components/auth/AuthScreen'; // ✅ única pantalla de login+registro
import Home from './src/components/home/Home'; // 🏠 tu pantalla principal

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <AuthProvider>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.FONDO },
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
}
