import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
} from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import PostItem from './PostItem';
import { colors } from '../global/colors';

const PostHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showHeader, setShowHeader] = useState(true);
  let offsetY = 0;

  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > offsetY ? 'down' : 'up';
    setShowHeader(direction === 'up');
    offsetY = currentOffset;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.PRIMARIO} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerText}>Últimos posts</Text>
        </View>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default PostHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: colors.FONDO,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.SOMBRA,
  },
  headerText: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
