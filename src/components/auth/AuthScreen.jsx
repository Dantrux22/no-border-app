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
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from './AuthProvider'; // ✅ ruta corregida
import { colors } from '../global/colors';
import { useNavigation } from '@react-navigation/native';

export default function AuthScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [username, setUsernm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log('❌ Error al iniciar sesión:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Alert.alert('Completa todos los campos');
      return;
    }
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      const profile = {
        email,
        username,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), profile);
      await signOut(auth); // Desloguear después de registrar

      Alert.alert(
        'Cuenta creada',
        'Tu cuenta fue creada correctamente 🎉',
        [{ text: 'OK', onPress: () => setIsRegister(false) }],
        { cancelable: false }
      );
    } catch (error) {
      console.log('❌ Error al registrarse:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Correo en uso', 'Ya existe una cuenta con ese correo electrónico.');
      } else {
        Alert.alert('Error al registrarse', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    isRegister ? handleRegister() : handleLogin();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />

      <Text style={styles.title}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isRegister ? 'Crear cuenta' : 'Ingresar'}
          </Text>
        )}
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
