// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './src/components/auth/AuthScreen';
import ProfileSetupScreen from './src/components/profile/ProfileSetupScreen';
import Home from './src/components/home/Home';
import { colors } from './src/components/global/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.PRIMARIO} />
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
