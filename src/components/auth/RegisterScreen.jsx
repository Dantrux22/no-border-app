<<<<<<< HEAD
// RegisterScreen.jsx
import React, { useContext, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      alert('Por favor, complete todos los campos');
      return;
    }
    setLoading(true);
    const result = await register(email, password);
    setLoading(false);
    if (result.success) {
      // Una vez registrado, vamos a la pantalla de setup de perfil
      navigation.replace('ProfileSetup');
    } else {
      alert(result.error);
=======
// src/components/auth/RegisterScreen.jsx
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const traducirErrorFirebase = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'El email ya está en uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      default:
        return 'Ocurrió un error. Intentá nuevamente';
    }
  };

  const handleRegister = async () => {
    const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Ingresá un correo electrónico válido');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ Usuario registrado:', user.email);
      Alert.alert('Cuenta creada', `¡Bienvenido, ${user.email}!`);

      // No se crea documento en Firestore aquí
      // AuthProvider redirigirá a ProfileSetup si el perfil no está completo
    } catch (error) {
      console.log('❌ Error al registrar:', error.message);
      Alert.alert('Error', traducirErrorFirebase(error.code));
>>>>>>> a655d3748ce0b68b2149079499aa4b77b73f2fbb
    }
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <Text style={styles.title}>Registrar cuenta</Text>
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
      {loading
        ? <ActivityIndicator size="large" color={colors.PRIMARIO} />
        : <Button title="Registrarse" onPress={handleRegister} />
      }
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Inicia sesión
        </Text>
      </Text>
=======
      <Text style={styles.title}>Crear cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        value={username}
        onChangeText={setUsername}
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tenés cuenta? Iniciar sesión</Text>
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
export default RegisterScreen;

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

export default RegisterScreen;
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
