// src/components/auth/RegisterScreen.jsx

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
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../firebaseConfig';
import { colors } from '../global/colors';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

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
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
      aspect: [1, 1],
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setAvatar({ uri: asset.uri });
    setError('');
  };

  const handleRegister = async () => {
    if (!username || !avatar) {
      setError('Debes elegir un nombre de usuario y una foto.');
      return;
    }
    try {
      // 1) Crear cuenta
      const userCred = await createUserWithEmailAndPassword(
        auth, email, password
      );
      const uid = userCred.user.uid;

      // 2) Leer archivo como base64
      const base64 = await FileSystem.readAsStringAsync(avatar.uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      // 3) Subir base64 a Firebase Storage
      const imgRef = ref(storage, `avatars/${uid}.jpg`);
      await uploadString(imgRef, base64, 'base64', {
        contentType: 'image/jpeg'
      });
      const avatarURL = await getDownloadURL(imgRef);

      // 4) Guardar perfil en Firestore
      await setDoc(doc(db, 'users', uid), {
        username,
        avatar: avatarURL,
        email,
        createdAt: new Date(),
      });

      // 5) Navegar
      navigation.replace('ProfileSetupScreen');
    } catch (err) {
      setError(err.message);
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
          <Image
            source={{ uri: avatar.uri }}
            style={styles.avatarPreview}
          />
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

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
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});
