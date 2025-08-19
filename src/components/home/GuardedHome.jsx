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

  const resetTo = (name, params) =>
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name, params }] })
    );

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const uid = await getCurrentUserId();
          if (!uid) {
            if (alive) resetTo('Auth');
            return;
          }
          const completed = await isProfileCompleted(uid);
          if (!completed) {
            if (alive) resetTo('ProfileSetup', { userId: uid });
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
