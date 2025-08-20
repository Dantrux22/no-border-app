// src/components/home/SavedPostsScreen.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { listSavedPosts } from '../../db/posts';
import { getCurrentUserId } from '../../db/auth';
import PostComponent from './PostComponent';

export default function SavedPostsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const uid = await getCurrentUserId();
      if (!uid) { setItems([]); return; }
      const rows = await listSavedPosts({ userId: uid, currentUserId: uid, limit: 100, offset: 0 });
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <PostComponent post={item} onChanged={load} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? null : null}
      />
    </View>
  );
}
