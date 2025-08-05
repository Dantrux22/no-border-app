<<<<<<< HEAD
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
=======
// src/components/auth/LoginScreen.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../global/colors';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const traducirErrorFirebase = (code) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/user-disabled':
        return 'La cuenta fue deshabilitada';
      case 'auth/user-not-found':
        return 'No se encontró un usuario con ese correo';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      default:
        return 'Ocurrió un error. Intentá nuevamente';
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Usuario logueado:', user.email);
      Alert.alert('¡Bienvenido!', `Hola de nuevo, ${user.email}`);
      // NO navegamos manualmente, el AuthProvider lo hace por nosotros
    } catch (error) {
      console.log('❌ Error al iniciar sesión:', error.message);
      Alert.alert('Error', traducirErrorFirebase(error.code));
>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
<<<<<<< HEAD
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
=======
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
    </View>
  );
};

<<<<<<< HEAD
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
=======
export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
<<<<<<< HEAD
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
=======
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.PRIMARIO,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.BLANCO,
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: colors.PRIMARIO,
    textAlign: 'center',
    fontSize: 14,
  },
});
>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
