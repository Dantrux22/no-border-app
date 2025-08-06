// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import { colors } from './src/components/global/colors';
import AuthProvider, { AuthContext } from './src/components/auth/AuthProvider';

import AuthScreen from './src/components/auth/AuthScreen';
import Home from './src/components/home/Home';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user } = React.useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.FONDO },
      }}
    >
      {user ? (
        <Stack.Screen name="Home" component={Home} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
