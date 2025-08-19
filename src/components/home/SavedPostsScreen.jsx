// src/components/home/SavedPostsScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { PostItem } from './PostComponent';
import { colors } from '../global/colors';

export default function SavedPostsScreen() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Suponiendo que guardás los IDs de los posts guardados en /users/{uid}/savedPosts/{postId}
      const savedRef = collection(db, 'users', user.uid, 'savedPosts');
      const savedSnap = await getDocs(savedRef);
      const savedIds = savedSnap.docs.map(doc => doc.id);

      const postPromises = savedIds.map(async (postId) => {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
      });

      const posts = (await Promise.all(postPromises)).filter(p => p !== null);
      setSavedPosts(posts);
    } catch (error) {
      console.log('❌ Error al traer guardados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.PRIMARIO} />
      </View>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No guardaste ningún post todavía.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={savedPosts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PostItem post={item} />}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.FONDO,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.TEXTO_SECUNDARIO,
    fontSize: 16,
    textAlign: 'center',
  },
});
