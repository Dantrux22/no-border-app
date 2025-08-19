// App.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';

import store from './src/redux/store';
import { navigationRef } from './src/navigation/navigationRef';
import { setUser } from './src/redux/userSlice';

import DrawerNavigator from './src/navigation/DrawerNavigator';
import AuthScreen from './src/components/auth/AuthScreen';

import { getCurrentUserId, getUserById } from './src/db/auth';

const Stack = createNativeStackNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#fff" />
      <Text style={{ color: '#fff', marginTop: 8 }}>Cargando…</Text>
    </View>
  );
}

function RootRouter() {
  const currentUser = useSelector((s) => s.user?.currentUser);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Screen name="App" component={DrawerNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

function Bootstrap() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const uid = await getCurrentUserId();
        if (uid) {
          const row = await getUserById(uid);
          if (row) {
            dispatch(setUser({
              id: row.id,
              email: row.email,
              username: row.username,
              avatar: row.avatar || '🙂',
              avatarUrl: row.avatar_url || null,
              created_at: row.created_at,
            }));
          }
        }
      } catch (e) {
        console.log('bootstrap session error:', e);
      } finally {
        done = true;
        setReady(true);
      }
    })();

    const t = setTimeout(() => { if (!done) setReady(true); }, 2000);
    return () => clearTimeout(t);
  }, [dispatch]);

  if (!ready) return <Splash />;
  return <RootRouter />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <Bootstrap />
      </NavigationContainer>
    </Provider>
  );
}
