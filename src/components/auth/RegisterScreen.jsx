// src/screens/RegisterScreen.jsx

import React, { useState } from 'react';
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
import { colors } from '../global/colors';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleRegister = () => {
    if (!email.trim() || !password || !username.trim()) {
      return Alert.alert('Error', 'Todos los campos son obligatorios.');
    }
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.header}>Registrarse en No Border</Text>

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

        <TextInput
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.TEXTO_SECUNDARIO}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    color: colors.TEXTO_PRINCIPAL,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: colors.TEXTO_SECUNDARIO,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: colors.TEXTO_PRINCIPAL,
  },
  button: {
    width: '100%',
    backgroundColor: colors.PRIMARIO,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    color: colors.BLANCO,
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: colors.TEXTO_SECUNDARIO,
    textAlign: 'center',
    marginTop: 8,
  },
});