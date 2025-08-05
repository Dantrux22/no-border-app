// src/components/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { colors } from '../global/colors';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciá sesión</Text>
      <TextInput style={styles.input} placeholder="Email"            placeholderTextColor={colors.TEXTO_SECUNDARIO} onChangeText={setEmail}    value={email}     autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña"       placeholderTextColor={colors.TEXTO_SECUNDARIO} secureTextEntry            onChangeText={setPassword} value={password} />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.FONDO, justifyContent: 'center', padding: 20 },
  title:     { color: colors.TEXTO_PRINCIPAL, fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input:     { backgroundColor: colors.FONDO_CARDS, color: colors.TEXTO_PRINCIPAL, padding: 12, borderRadius: 10, marginBottom: 16 },
  button:    { backgroundColor: colors.PRIMARIO, padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText:{ color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
  linkText:  { color: colors.TEXTO_SECUNDARIO, marginTop: 16, textAlign: 'center' },
});
