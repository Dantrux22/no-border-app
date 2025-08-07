// src/components/auth/AuthScreen.jsx

import React, { useState, useContext, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
// Import correcto desde components/firebaseConfig.js
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { saveUser, fetchUser } from '../db/localStore';
import { AuthContext } from './AuthProvider';
import { colors } from '../global/colors';
import { useNavigation } from '@react-navigation/native';

export default function AuthScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPass]     = useState('');
  const [username, setUsernm]   = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (user) navigation.replace('Home');
  }, [user]);

  // Login con fallback local-first
  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Completa todos los campos');
    }
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { uid } = userCred.user;

      // Intentar perfil local
      const localProfile = await fetchUser(uid);
      if (localProfile) {
        console.log('✅ Perfil local encontrado:', localProfile);
        return;
      }

      // Si no hay local, intentar Firestore
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data();
          const profile = { uid, username: data.username, email: data.email };
          await saveUser(profile);
          console.log('📄 Perfil descargado y guardado localmente:', profile);
        }
      } catch (e) {
        console.log('⚠️ No se pudo descargar perfil de Firestore:', e.message);
      }
    } catch (err) {
      console.log('❌ Error al iniciar sesión:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registro y guardado local
  const handleRegister = async () => {
    if (!email || !password || !username) {
      return Alert.alert('Completa todos los campos');
    }
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const { uid } = userCred.user;

      const profile = { uid, username: username.trim(), email: email.trim() };

      // Guardar en Firestore
      await setDoc(doc(db, 'users', uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });

      // Guardar localmente
      await saveUser(profile);

      // Desloguear
      await signOut(auth);

      Alert.alert(
        'Cuenta creada',
        '¡Tu cuenta fue creada correctamente! Ahora iniciá sesión.',
        [{ text: 'OK', onPress: () => setIsRegister(false) }],
        { cancelable: false }
      );
    } catch (err) {
      console.log('❌ Error al registrarse:', err.message);
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Ya existe una cuenta con ese email.'
        : err.message;
      Alert.alert('Error al registrarse', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <Text style={styles.title}>
        {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
      </Text>
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
        onChangeText={setPass}
      />
      {isRegister && (
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor={colors.TEXTO_SECUNDARIO}
          value={username}
          onChangeText={setUsernm}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={isRegister ? handleRegister : handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>
              {isRegister ? 'Crear cuenta' : 'Ingresar'}
            </Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.toggleText}>
          {isRegister
            ? '¿Ya tenés cuenta? Iniciá sesión'
            : '¿No tenés cuenta? Registrate'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: colors.TEXTO_PRINCIPAL,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: colors.FONDO_CARDS,
    borderColor: colors.GRIS_INTERMEDIO,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    color: colors.TEXTO_PRINCIPAL,
  },
  button: {
    backgroundColor: colors.PRIMARIO,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: colors.BLANCO,
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    color: colors.TEXTO_SECUNDARIO,
    textAlign: 'center',
    marginTop: 10,
  },
});
