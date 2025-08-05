// AuthScreen.jsx
import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';

const AuthScreen = ({ navigation }) => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      navigation.replace(user ? 'Home' : 'Login');
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.PRIMARIO} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.FONDO,
  },
});

export default AuthScreen;
