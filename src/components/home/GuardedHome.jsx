// src/components/home/GuardedHome.jsx
import React, { useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import { colors } from '../global/colors';
import Home from './Home';
import { getCurrentUserId, isProfileCompleted } from '../../db/auth';

export default function GuardedHome(props) {
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);

  // 👇 Resetea en el STACK raíz (padre del Drawer)
  const resetRoot = (routeName, params) =>
    navigation.getParent()?.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: routeName, params }] })
    );

  const goToDrawer = (screen, params) =>
    resetRoot('App', { screen, params });

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const uid = await getCurrentUserId();
          if (!uid) {
            if (alive) resetRoot('Auth');               // 👈 al login del Stack
            return;
          }
          const completed = await isProfileCompleted(uid);
          if (!completed) {
            if (alive) goToDrawer('ProfileSetup', { userId: uid }); // 👈 dentro del Drawer
            return;
          }
          if (alive) setChecking(false);
        } catch {
          if (alive) setChecking(false);
        }
      })();
      return () => { alive = false; };
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (checking) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Home {...props} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.FONDO,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
