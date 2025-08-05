// src/screens/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../firebaseConfig';
import { colors } from '../global/colors';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar]     = useState(null);
  const [error, setError]       = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permiso denegado para acceder a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.7,
      aspect:     [1, 1],
    });
    if (!result.canceled) {
      setAvatar({ uri: result.assets[0].uri });
      setError('');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password || !username.trim() || !avatar) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    try {
      // 1) Crear usuario en Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = user.uid;

      // 2) Subir foto y obtener URL
      const base64 = await FileSystem.readAsStringAsync(avatar.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const storageRef = ref(storage, `avatars/${uid}.jpg`);
      await uploadString(storageRef, `data:image/jpeg;base64,${base64}`, 'data_url');
      const photoURL = await getDownloadURL(storageRef);

      // 3) Guardar perfil completo en Firestore
      await setDoc(doc(db, 'users', uid), {
        username:  username.trim(),
        email:     email.trim(),
        avatar:    photoURL,
        createdAt: new Date(),
      });

      // No llamamos a navigation.replace: el listener global sube a Home
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Formato de email inválido.');
      } else if (err.code === 'auth/weak-password') {
        setError('Contraseña muy débil (mínimo 6 caracteres).');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

      <View style={styles.imageContainer}>
        <Button title="Seleccionar foto de perfil" onPress={pickImage} />
        {avatar && (
          <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
        )}
      </View>

      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      <Button title="Registrarme" onPress={handleRegister} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: colors.TEXTO_SECUNDARIO,
    borderWidth: 1,
    marginBottom: 12,
    color: colors.TEXTO_PRINCIPAL,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 8,
  },
  errorContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  link: {
    color: colors.PRIMARIO,
    marginTop: 4,
  },
});
