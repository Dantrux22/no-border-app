// src/components/ProfileSetupScreen.jsx

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Button,
  Text,
  StyleSheet,
} from 'react-native';

// Import correco: tu firebaseConfig está en src/components/firebaseConfig.js
import { auth, db } from './firebaseConfig';

import { doc, updateDoc } from 'firebase/firestore';
import { colors } from './global/colors';

export default function ProfileSetupScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [error, setError]             = useState('');
  const user = auth.currentUser;

  const handleSave = async () => {
    if (!displayName) {
      setError('Ingresa tu nombre completo');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      navigation.replace('Home');
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
        placeholder="Tu nombre completo"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button title="Guardar perfil" onPress={handleSave} />
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
});
