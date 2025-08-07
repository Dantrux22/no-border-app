// src/components/home/Home.jsx

import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from '../Header';
import { colors } from '../global/colors';
import PostComponent, { PostItem } from './PostComponent';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { fetchUser, fetchPosts } from '../db/localStore';
import { AuthContext } from '../auth/AuthProvider';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('usuario');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Cargar perfil y posts locales
      Promise.all([
        fetchUser(user.uid).then(profile => {
          if (profile && profile.username) {
            setUsername(profile.username);
          }
        }),
        fetchPosts().then(fetched => {
          setPosts(fetched);
        }),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const handleAdd = newPost => {
    // Aquí ya tu PostComponent guarda en local y en Firestore
    setPosts([newPost, ...posts]);
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
              // AuthProvider detectará user=null y RootNavigator volverá a Auth
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
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
    <SafeAreaView style={styles.container}>
      <Header title={`Hola, ${username}`} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Ionicons name="log-out-outline" size={24} color={colors.BLANCO} />
      </TouchableOpacity>

      <PostComponent onAdd={handleAdd} username={username} />

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostItem post={item} username={username} />
        )}
        contentContainerStyle={styles.feed}
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
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.FONDO_CARDS,
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
});
