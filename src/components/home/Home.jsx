import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, StyleSheet, View, Alert, TouchableOpacity, ActivityIndicator, Platform, StatusBar as RNStatusBar, Text } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Header';
import { colors } from '../global/colors';
import PostComponent, { PostItem } from './PostComponent';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { fetchUser } from '../db/localStore';
import { addPost, subscribePosts } from '../db/posts';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('usuario');
  const [avatar, setAvatar] = useState('🙂');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const topPadding = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }

    fetchUser(uid)
      .then((profile) => {
        if (profile?.username) setUsername(profile.username);
        if (profile?.avatar) setAvatar(profile.avatar);
      })
      .finally(() => setLoading(false));

    const unsub = subscribePosts(setPosts);
    return () => unsub && unsub();
  }, []);

  const handleAdd = async ({ text, imageUrl }) => {
    try {
      await addPost({ userId: auth.currentUser?.uid || null, username, avatar, text, imageUrl });
    } catch {
      Alert.alert('Error', 'No se pudo publicar. Intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: async () => {
          try {
            await signOut(auth);
            navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }));
          } catch { Alert.alert('Error', 'No se pudo cerrar sesión'); }
        } },
    ]);
  };

  if (loading) {
    return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.PRIMARIO} /></View>);
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }]}>
      <Header title="No Border" avatar={avatar} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Ionicons name="log-out-outline" size={24} color={colors.BLANCO} />
      </TouchableOpacity>

      <Text style={styles.greeting}>Hola, @{username}</Text>

      <PostComponent onAdd={handleAdd} username={username} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.FONDO },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.FONDO },
  feed: { paddingBottom: 80 },
  logoutIcon: { position: 'absolute', top: Platform.OS === 'android' ? RNStatusBar.currentHeight + 12 : 40, right: 20, zIndex: 10, backgroundColor: colors.FONDO_CARDS, padding: 8, borderRadius: 20, elevation: 4 },
  greeting: { color: colors.TEXTO_PRINCIPAL, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, fontWeight: 'bold' },
});
