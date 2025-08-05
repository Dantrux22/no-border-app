// src/components/auth/RegisterScreen.jsx

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Button,
  Text,
  StyleSheet,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../firebaseConfig';
import { colors } from '../global/colors';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'react-native-image-picker';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');

  const pickImage = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', quality: 0.7 },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        setAvatar(response.assets[0]);
      }
    );
  };

  const handleRegister = async () => {
    if (!username || !avatar) {
      setError('Debes elegir un nombre de usuario y una foto.');
      return;
    }
    try {
      // 1) Crear usuario en Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      // 2) Subir avatar a Storage
      const imgRef = ref(storage, `avatars/${uid}`);
      const response = await fetch(avatar.uri);
      const blob = await response.blob();
      await uploadBytes(imgRef, blob);
      const avatarURL = await getDownloadURL(imgRef);

      // 3) Guardar perfil en Firestore
      await setDoc(doc(db, 'users', uid), {
        username,
        avatar: avatarURL,
        email,
        createdAt: new Date(),
      });

      // 4) Navegar a la pantalla de setup de perfil
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
      <Button title="Seleccionar foto de perfil" onPress={pickImage} />
      {avatar && <Text style={styles.selected}>✔️ Foto seleccionada</Text>}
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
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  selected: {
    color: colors.PRIMARIO,
    marginBottom: 12,
    textAlign: 'center',
  },
});
