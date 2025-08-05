// LoginScreen.jsx
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';

const LoginScreen = ({ navigation }) => {
  const { login, user, loading } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Si ya hay un usuario activo, redirigir a Home
  useEffect(() => {
    if (!loading && user) {
      navigation.replace('Home');
    }
  }, [user, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, complete todos los campos');
      return;
    }
    setLoggingIn(true);
    const result = await login(email, password);
    setLoggingIn(false);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />
      {loggingIn ? (
        <ActivityIndicator size="large" color={colors.PRIMARIO} />
      ) : (
        <Button title="Ingresar" onPress={handleLogin} />
      )}
      <Text style={styles.footerText}>
        ¿Aún no tienes cuenta?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Regístrate
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.FONDO,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: colors.TEXTO_PRINCIPAL,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  footerText: {
    marginTop: 15,
    color: colors.TEXTO_SECUNDARIO,
    textAlign: 'center',
  },
  link: {
    color: colors.PRIMARIO,
  },
});

export default LoginScreen;
