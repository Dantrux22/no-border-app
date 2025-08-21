// src/navigation/DrawerNavigator.jsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import GuardedHome from '../components/home/GuardedHome';
import UserProfileScreen from '../components/profile/UserProfileScreen';
import ProfileSetupScreen from '../components/profile/ProfileSetupScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: 'slide' }}
      initialRouteName="Home"            // 👈 el Drawer arranca en Home
      backBehavior="history"
    >
      <Drawer.Screen name="Home" component={GuardedHome} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Perfil' }} />
      <Drawer.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
