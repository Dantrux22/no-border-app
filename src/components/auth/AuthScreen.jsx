// src/components/auth/AuthScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { colors } from '../global/colors';
import { setUser } from '../../redux/userSlice';
import {
  registerUser,
  loginUser,
  isProfileCompleted,
  getCurrentUserId,
} from '../../db/auth';

function friendly(e) {
  const code = e?.code || '';
  if (code === 'missing-fields') return 'Completá los campos requeridos.';
  if (code === 'email-already-in-use') return 'Ese email ya está registrado.';
  if (code === 'username-already-in-use') return 'Ese @username ya existe.';
  if (code === 'user-not-found') return 'No existe una cuenta con ese email.';
  if (code === 'wrong-password') return 'Contraseña incorrecta.';
  return 'No se pudo procesar tu solicitud.';
}

export default function AuthScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  /**
   * ✅ Resetear la raíz del Stack hacia el Drawer ("App")
   *    y abrir una screen interna del Drawer (Home/ProfileSetup).
   */
  const resetTo = (drawerScreenName, params) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'App', // <- Stack.Screen que monta el DrawerNavigator
            state: {
              index: 0,
              routes: [{ name: drawerScreenName, params }],
            },
          },
        ],
      })
    );
  };

  // Si ya hay sesión al montar, redirigir según estado de perfil
  useEffect(() => {
    (async () => {
      try {
        const uid = await getCurrentUserId();
        if (!uid) return;
        const completed = await isProfileCompleted(uid);
        if (!completed) {
          resetTo('ProfileSetup', { userId: uid });
        } else {
          resetTo('Home');
        }
      } catch {
        /* no-op */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignup = async () => {
    const email = signupEmail.trim();
    const password = signupPass;
    const username = signupUsername.trim();
    if (!email || !password || !username) return setErr('Completá email, contraseña y username.');
    setErr(null);
    setLoading(true);
    try {
      const user = await registerUser({ email, password, username });
      dispatch(setUser(user));
      // Onboarding: ir a configurar perfil
      resetTo('ProfileSetup', { userId: user.id });
    } catch (e) {
      console.log('❌ signup sqlite error:', e);
      setErr(friendly(e));
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async () => {
    const email = loginEmail.trim();
    const password = loginPass;
    if (!email || !password) return setErr('Completá email y contraseña.');
    setErr(null);
    setLoading(true);
    try {
      const user = await loginUser({ email, password });
      dispatch(setUser(user));
      const completed = await isProfileCompleted(user.id);
      if (!completed) {
        resetTo('ProfileSetup', { userId: user.id });
      } else {
        resetTo('Home');
      }
    } catch (e) {
      console.log('❌ login sqlite error:', e);
      setErr(friendly(e));
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>No Border</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.tabActive]}
            onPress={() => { setMode('login'); setErr(null); }}
            activeOpacity={0.85}
          >
            <Text style={styles.tabText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.tabActive]}
            onPress={() => { setMode('signup'); setErr(null); }}
            activeOpacity={0.85}
          >
            <Text style={styles.tabText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        {isLogin ? (
          <>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
              style={styles.input}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
              style={styles.input}
              value={loginPass}
              onChangeText={setLoginPass}
              secureTextEntry
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
              style={styles.input}
              value={signupUsername}
              onChangeText={setSignupUsername}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
              style={styles.input}
              value={signupEmail}
              onChangeText={setSignupEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
              style={styles.input}
              value={signupPass}
              onChangeText={setSignupPass}
              secureTextEntry
            />
          </>
        )}

        {!!err && <Text style={{ color: '#ff7b7b', textAlign: 'center' }}>{err}</Text>}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.PRIMARIO }, loading && { opacity: 0.7 }]}
          onPress={isLogin ? onLogin : onSignup}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading
            ? <ActivityIndicator color={colors.BLANCO} />
            : <Text style={styles.btnText}>{isLogin ? 'Entrar' : 'Crear cuenta'}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* Estilos */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.FONDO, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, gap: 12 },
  title: { color: colors.TEXTO_PRINCIPAL, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  tabs: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', marginBottom: 8, alignSelf: 'center' },
  tab: { paddingVertical: 10, paddingHorizontal: 18, backgroundColor: colors.FONDO_CARDS },
  tabActive: { backgroundColor: colors.PRIMARIO },
  tabText: { color: colors.BLANCO, fontWeight: '700' },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 10,
  },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: colors.BLANCO, fontWeight: 'bold', textAlign: 'center' },
});
