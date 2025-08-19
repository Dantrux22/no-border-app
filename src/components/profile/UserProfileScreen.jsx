// src/components/profile/UserProfileScreen.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import Header from '../Header';
import { colors } from '../global/colors';
import { listUserPosts, listUserReposts, listSavedPosts } from '../../db/posts';
import PostComponent from '../home/PostComponent';

export default function UserProfileScreen() {
  const currentUser = useSelector((s) => s.user?.currentUser);
  const [tab, setTab] = useState('posts'); // 'posts' | 'reposts' | 'saved'
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      if (!currentUser?.id) return setItems([]);
      if (tab === 'posts') {
        const rows = await listUserPosts({ userId: currentUser.id, currentUserId: currentUser.id, limit: 50, offset: 0 });
        setItems(rows || []);
      } else if (tab === 'reposts') {
        const rows = await listUserReposts({ userId: currentUser.id, currentUserId: currentUser.id, limit: 50, offset: 0 });
        setItems(rows || []);
      } else {
        const rows = await listSavedPosts({ userId: currentUser.id, currentUserId: currentUser.id, limit: 50, offset: 0 });
        setItems(rows || []);
      }
    } catch (e) {
      console.log('profile load error:', e);
      setItems([]);
    }
  }, [tab, currentUser?.id]);

  useEffect(() => { load(); }, [load]);

  const username = currentUser?.username || 'usuario';
  const avatar = currentUser?.avatar || '🙂';

  return (
    <View style={{ flex: 1, backgroundColor: colors.FONDO }}>
      <Header />

      <View style={styles.header}>
        <View style={styles.avatarWrap}><Text style={styles.avatarEmoji}>{avatar}</Text></View>
        <Text style={styles.username}>@{username}</Text>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('posts')} style={[styles.tab, tab === 'posts' && styles.tabActive]}>
            <Text style={styles.tabText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('reposts')} style={[styles.tab, tab === 'reposts' && styles.tabActive]}>
            <Text style={styles.tabText}>Reposts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('saved')} style={[styles.tab, tab === 'saved' && styles.tabActive]}>
            <Text style={styles.tabText}>Guardados</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={useMemo(() => items.filter(Boolean), [items])}
        keyExtractor={(p, i) => p?.id ?? `p-${i}`}
        renderItem={({ item }) => <PostComponent post={item} currentUser={currentUser} onChanged={load} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<View style={{ padding: 20 }}><Text style={{ color: colors.TEXTO_SECUNDARIO, textAlign: 'center' }}>No hay contenido aún.</Text></View>}
      />
    </View>
  );
}

const AV = 64;

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#FFFFFF22' },
  avatarWrap: {
    width: AV, height: AV, borderRadius: AV / 2, backgroundColor: colors.FONDO_CARDS,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarEmoji: { fontSize: 32 },
  username: { color: colors.BLANCO, fontWeight: '800', fontSize: 18 },
  tabs: { flexDirection: 'row', marginTop: 12, borderRadius: 10, overflow: 'hidden', alignSelf: 'flex-start' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.FONDO_CARDS, marginRight: 8, borderRadius: 8 },
  tabActive: { backgroundColor: colors.PRIMARIO },
  tabText: { color: colors.BLANCO, fontWeight: '700' },
});
