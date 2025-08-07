import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';
import { colors } from '../global/colors';

export default function AuthScreen() {
  const navigation = useNavigation();
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados de login
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados de registro
  const [registerEmail, setRegisterEmail]       = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [username, setUsername]                 = useState('');

  const [loading, setLoading] = useState(false);

  const switchToLogin = () => {
    setIsRegistering(false);
    // Opcional: limpiar campos de registro
    setRegisterEmail('');
    setRegisterPassword('');
    setUsername('');
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    // Opcional: limpiar campos de login
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      await setDoc(doc(db, 'users', user.uid), {
        email: registerEmail,
        username,
        createdAt: new Date(),
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('Error al registrar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={switchToLogin}
          style={[styles.toggleButton, !isRegistering && styles.activeToggle]}
        >
          <Text style={styles.toggleText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={switchToRegister}
          style={[styles.toggleButton, isRegistering && styles.activeToggle]}
        >
          <Text style={styles.toggleText}>Registro</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {isRegistering ? (
          <>
            <TextInput
              placeholder="Nombre de usuario"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              style={styles.input}
              value={registerEmail}
              onChangeText={setRegisterEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              style={styles.input}
              value={registerPassword}
              onChangeText={setRegisterPassword}
              secureTextEntry
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              style={styles.input}
              value={loginPassword}
              onChangeText={setLoginPassword}
              secureTextEntry
            />
          </>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.PRIMARIO} />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={isRegistering ? handleRegister : handleLogin}
          >
            <Text style={styles.buttonText}>
              {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.FONDO, justifyContent: 'center', padding: 16 },
  toggleContainer: { flexDirection: 'row', marginBottom: 24 },
  toggleButton:   { flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeToggle:   { borderBottomColor: colors.PRIMARIO },
  toggleText:     { textAlign: 'center', color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
  formContainer:  { width: '100%' },
  input:          {
    height: 48,
    borderColor: colors.GRIS_INTERMEDIO,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: colors.TEXTO_PRINCIPAL,
  },
  button:         { height: 48, backgroundColor: colors.PRIMARIO, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText:     { color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
});
