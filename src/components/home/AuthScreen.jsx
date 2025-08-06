import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';

export default function AuthScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Sonoborders</Text>
      <View style={styles.button}>
        <Button
          title="Registrarme"
          onPress={() => navigation.navigate('Register')}
          color={colors.PRIMARIO}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Iniciar sesión"
          onPress={() => navigation.navigate('Login')}
          color={colors.PRIMARIO}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: colors.TEXTO_PRINCIPAL,
    marginBottom: 30,
  },
  button: {
    width: '100%',
    marginVertical: 8,
  },
});