import React, { useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Header from '../Header';
import { colors } from '../global/colors';
import PostComponent, { PostItem } from './PostComponent';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  const handleAdd = newPost => {
    setPosts([newPost, ...posts]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que querés cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, salir',
          onPress: async () => {
            await signOut(auth);
            navigation.replace('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="No Border" />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
        <Ionicons name="log-out-outline" size={24} color={colors.BLANCO} />
      </TouchableOpacity>

      <PostComponent onAdd={handleAdd} />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
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
