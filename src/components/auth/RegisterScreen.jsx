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
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

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
