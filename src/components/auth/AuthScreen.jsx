// src/components/auth/AuthScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { colors } from '../global/colors';

export default function AuthScreen() {
  const navigation = useNavigation();
  const [isRegistering, setIsRegistering] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');

  // Register fields
  const [regEmail, setRegEmail]     = useState('');
  const [regPass, setRegPass]       = useState('');
  const [username, setUsername]     = useState('');

  const [loading, setLoading] = useState(false);

  const switchToLogin = () => {
    setIsRegistering(false);
    setRegEmail('');
    setRegPass('');
    setUsername('');
  };
  const switchToRegister = () => {
    setIsRegistering(true);
    setLoginEmail('');
    setLoginPass('');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPass);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      Alert.alert('Error al iniciar sesión', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      return Alert.alert('Error', 'Por favor ingresa un nombre de usuario');
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regEmail.trim(),
        regPass
      );
      // Puedes guardar el username en Firestore aquí, si lo tienes configurado
      // const { uid } = cred.user;
      // await setDoc(doc(db, 'users', uid), { username, email: regEmail.trim(), createdAt: new Date() });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      Alert.alert('Error al registrar', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
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
              style={styles.input}
              placeholder="Nombre de usuario"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              autoCapitalize="none"
              keyboardType="email-address"
              value={regEmail}
              onChangeText={setRegEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              secureTextEntry
              value={regPass}
              onChangeText={setRegPass}
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              autoCapitalize="none"
              keyboardType="email-address"
              value={loginEmail}
              onChangeText={setLoginEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_SECUNDARIO}
              secureTextEntry
              value={loginPass}
              onChangeText={setLoginPass}
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
  container:       { flex: 1, backgroundColor: colors.FONDO, justifyContent: 'center', padding: 16 },
  toggleContainer: { flexDirection: 'row', marginBottom: 24 },
  toggleButton:    { flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeToggle:    { borderBottomColor: colors.PRIMARIO },
  toggleText:      { textAlign: 'center', color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
  formContainer:   { width: '100%' },
  input:           {
    height: 48,
    borderColor: colors.GRIS_INTERMEDIO,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: colors.TEXTO_PRINCIPAL,
  },
  button:          { height: 48, backgroundColor: colors.PRIMARIO, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  buttonText:      { color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
});
