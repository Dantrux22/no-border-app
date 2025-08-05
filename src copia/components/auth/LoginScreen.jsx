import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global/colors';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Login</Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
