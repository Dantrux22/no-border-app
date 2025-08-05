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
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
};

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
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
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
