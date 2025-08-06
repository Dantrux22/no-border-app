// src/components/home/Home.jsx

import React, { useState } from 'react';
import { SafeAreaView, FlatList, StyleSheet } from 'react-native';
import Header from '../Header';
import PostHome from './PostHome';
import PostItem from './PostItem';
import { colors } from '../global/colors';

export default function Home() {
  const [posts, setPosts] = useState([]);

  const handleAdd = newPost => {
    setPosts([newPost, ...posts]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Feed" />
      <PostHome onAdd={handleAdd} />
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
  list: {
    paddingBottom: 16,
  },
});
