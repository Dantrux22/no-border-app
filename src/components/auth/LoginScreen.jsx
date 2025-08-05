// src/components/auth/LoginScreen.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { colors } from '../global/colors';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Email y contraseña son obligatorios.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a No Border</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
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

      <Button title="Iniciar sesión" onPress={handleLogin} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No estás registrado?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Registrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: colors.TEXTO_PRINCIPAL,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.TEXTO_SECUNDARIO,
    marginRight: 4,
  },
  link: {
    color: colors.PRIMARIO,
    fontWeight: 'bold',
  },
});
