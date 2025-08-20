// src/navigation/DrawerNavigator.jsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import GuardedHome from '../components/home/GuardedHome';
import UserProfileScreen from '../components/profile/UserProfileScreen';
import ProfileSetupScreen from '../components/profile/ProfileSetupScreen';
import AuthScreen from '../components/auth/AuthScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
      }}
      initialRouteName="Auth"
      backBehavior="history"
    >
      {/* Gate de auth (oculto) */}
      <Drawer.Screen
        name="Auth"
        component={AuthScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />

      {/* Home protegido: envía a ProfileSetup si el perfil no está completo */}
      <Drawer.Screen
        name="Home"
        component={GuardedHome}
        options={{ title: 'Inicio' }}
      />

      {/* Perfil visible */}
      <Drawer.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: 'Perfil' }}
      />

      {/* Configurar perfil (oculto) */}
      <Drawer.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ title: 'Configurar perfil', drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
