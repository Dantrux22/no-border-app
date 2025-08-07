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

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');

  // Registro
  const [regEmail, setRegEmail]   = useState('');
  const [regPass, setRegPass]     = useState('');
  const [username, setUsername]   = useState('');

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
    console.log('🔑 Intentando login:', loginEmail, loginPass);
    if (!loginEmail.trim() || !loginPass) {
      return Alert.alert('Error', 'Email y contraseña son obligatorios');
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        loginEmail.trim(),
        loginPass
      );
      console.log('✅ Login correcto, UID:', cred.user.uid);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      console.log('❌ Error login:', e.code, e.message);
      Alert.alert('Error al iniciar sesión', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log('📝 Intentando registro:', regEmail, username);
    if (!username.trim()) {
      return Alert.alert('Error', 'El nombre de usuario es obligatorio');
    }
    if (!regEmail.trim() || !regPass) {
      return Alert.alert('Error', 'Email y contraseña son obligatorios');
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        regEmail.trim(),
        regPass
      );
      console.log('✅ Registro correcto, UID:', cred.user.uid);
      // Aquí podrías guardar `username` en Firestore si lo necesitas
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      console.log('❌ Error register:', e.code, e.message);
      Alert.alert('Error al registrar', e.message);
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
