<<<<<<< HEAD
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
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
    </View>
  );
};

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
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
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
=======
>>>>>>> parent of 0c09732 (integracion)
