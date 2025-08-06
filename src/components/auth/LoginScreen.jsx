// src/components/auth/LoginScreen.jsx

import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { colors } from '../global/colors';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Error', 'Email y contraseña son obligatorios.');
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error al iniciar sesión', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.header}>Iniciar sesión en No Border</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.TEXTO_SECUNDARIO}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={colors.TEXTO_SECUNDARIO}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}> Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1, backgroundColor: colors.FONDO },
  inner:    { flex: 1, justifyContent: 'center', padding: 20 },
  header:   { fontSize: 24, color: colors.TEXTO_PRINCIPAL, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input:    {
    width: '100%', height: 50,
    borderColor: colors.TEXTO_SECUNDARIO, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, marginBottom: 16, color: colors.TEXTO_PRINCIPAL,
  },
  button:   {
    width: '100%', backgroundColor: colors.PRIMARIO, height: 50,
    borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: colors.BLANCO, fontSize: 16, fontWeight: 'bold' },
  footer:     { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: colors.TEXTO_SECUNDARIO },
  link:       { color: colors.PRIMARIO, fontWeight: 'bold', marginLeft: 4 },
});
