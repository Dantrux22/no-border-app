// src/components/home/Home.jsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import Header from '../Header';
import { colors } from '../global/colors';
import PostComponent, { PostItem } from './PostComponent';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { fetchUser, fetchPosts } from '../db/localStore';

export default function Home() {
  const [posts, setPosts]       = useState([]);
  const [username, setUsername] = useState('usuario');
  const [loading, setLoading]   = useState(true);
  const navigation               = useNavigation();

  // Para que el StatusBar en Android no tape tu header
  const topPadding = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchUser(uid).then(profile => {
        if (profile?.username) setUsername(profile.username);
      }),
      fetchPosts().then(fetched => {
        setPosts(fetched);
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const handleAdd = newPost => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.PRIMARIO} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPadding }]}>
      <Header title={`Hola, ${username}`} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Ionicons name="log-out-outline" size={24} color={colors.BLANCO} />
      </TouchableOpacity>

      <PostComponent onAdd={handleAdd} username={username} />

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostItem post={item} username={username} />}
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.FONDO,
  },
  feed: {
    paddingBottom: 80,
  },
  logoutIcon: {
    position: 'absolute',
    top: Platform.OS === 'android' ? RNStatusBar.currentHeight + 12 : 40,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.FONDO_CARDS,
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
});
