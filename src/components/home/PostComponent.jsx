// src/components/home/PostComponent.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../global/colors';
import { toggleLike, toggleSave, toggleRepost } from '../../db/posts';
import { Ionicons } from '@expo/vector-icons';

function parseDateFlexible(input) {
  if (input == null) return null;
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  const s = String(input).trim();
  if (/\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s.replace(' ', 'T') + 'Z');
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function timeAgo(ts) {
  const d = parseDateFlexible(ts);
  if (!d) return 'ahora';
  const diff = Date.now() - d.getTime();
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return 'ahora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} d`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk} sem`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} mes`;
  const yr = Math.floor(day / 365);
  return `${yr} a`;
}

function Avatar({ emoji, url }) {
  if (url) {
    return <Image source={{ uri: url }} style={styles.avatarImg} />;
  }
  return <Text style={styles.avatarEmoji}>{emoji || '🙂'}</Text>;
}

const CLAMP = 220;

function MediaGrid({ uris }) {
  const imgs = Array.isArray(uris) ? uris.filter(Boolean).slice(0, 4) : [];
  if (imgs.length === 0) return null;

  return (
    <View style={styles.mediaGrid}>
      {imgs.length === 1 && <Image source={{ uri: imgs[0] }} style={styles.m1} />}
      {imgs.length === 2 && (
        <View style={styles.row2}>
          <Image source={{ uri: imgs[0] }} style={styles.m2} />
          <Image source={{ uri: imgs[1] }} style={styles.m2} />
        </View>
      )}
      {imgs.length === 3 && (
        <View style={styles.row3}>
          <Image source={{ uri: imgs[0] }} style={styles.m3left} />
          <View style={styles.col3}>
            <Image source={{ uri: imgs[1] }} style={styles.m3small} />
            <Image source={{ uri: imgs[2] }} style={styles.m3small} />
          </View>
        </View>
      )}
      {imgs.length === 4 && (
        <>
          <View style={styles.row2}>
            <Image source={{ uri: imgs[0] }} style={styles.m2} />
            <Image source={{ uri: imgs[1] }} style={styles.m2} />
          </View>
          <View style={[styles.row2, { marginTop: 6 }]}>
            <Image source={{ uri: imgs[2] }} style={styles.m2} />
            <Image source={{ uri: imgs[3] }} style={styles.m2} />
          </View>
        </>
      )}
    </View>
  );
}

export default function PostComponent({ post, currentUser, onChanged }) {
  const isRepost = !!post.isRepost;
  const authorName = isRepost ? (post.original?.author?.username) : (post.author?.username);
  const authorAvatar = isRepost ? (post.original?.author?.avatar) : (post.author?.avatar);
  const authorAvatarUrl = isRepost ? (post.original?.author?.avatarUrl) : (post.author?.avatarUrl);
  const contentBody = isRepost ? (post.original?.body ?? '') : (post.body ?? '');
  const contentTime = isRepost ? post.original?.createdAt : post.createdAt;
  const mediaUris = post.media || [];

  const [stats, setStats] = useState(post.stats || { likes: 0, reposts: 0, saves: 0, likedByMe: false, savedByMe: false, repostedByMe: false });

  const needsClamp = useMemo(() => (contentBody?.length || 0) > CLAMP, [contentBody]);
  const [expanded, setExpanded] = useState(false);
  const shownText = useMemo(() => {
    if (!needsClamp || expanded) return contentBody || '';
    return (contentBody || '').slice(0, CLAMP).trimEnd() + '…';
  }, [contentBody, needsClamp, expanded]);

  const targetId = isRepost && post.original?.id ? post.original.id : post.id;

  const onLike = useCallback(async () => {
    try {
      const optimistic = { ...stats, likedByMe: !stats.likedByMe, likes: stats.likedByMe ? Math.max(0, stats.likes - 1) : stats.likes + 1 };
      setStats(optimistic);
      const res = await toggleLike({ userId: currentUser?.id || '', postId: targetId });
      setStats((s) => ({ ...s, likedByMe: res.liked, likes: res.likes }));
      onChanged?.();
    } catch (e) {
      setStats((s) => ({ ...s, likedByMe: !s.likedByMe, likes: Math.max(0, s.likedByMe ? s.likes + 1 : s.likes - 1) }));
    }
  }, [stats, currentUser?.id, targetId, onChanged]);

  const onSave = useCallback(async () => {
    try {
      const optimistic = { ...stats, savedByMe: !stats.savedByMe, saves: stats.savedByMe ? Math.max(0, stats.saves - 1) : stats.saves + 1 };
      setStats(optimistic);
      const res = await toggleSave({ userId: currentUser?.id || '', postId: targetId });
      setStats((s) => ({ ...s, savedByMe: res.saved, saves: res.saves }));
      onChanged?.();
    } catch (e) {
      setStats((s) => ({ ...s, savedByMe: !s.savedByMe, saves: Math.max(0, s.savedByMe ? s.saves + 1 : s.saves - 1) }));
    }
  }, [stats, currentUser?.id, targetId, onChanged]);

  const onRepost = useCallback(async () => {
    try {
      const optimistic = { ...stats, repostedByMe: !stats.repostedByMe, reposts: stats.repostedByMe ? Math.max(0, stats.reposts - 1) : stats.reposts + 1 };
      setStats(optimistic);
      const res = await toggleRepost({ userId: currentUser?.id || '', targetPostId: targetId });
      setStats((s) => ({ ...s, repostedByMe: res.reposted, reposts: res.reposts }));
      onChanged?.();
    } catch (e) {
      setStats((s) => ({ ...s, repostedByMe: !s.repostedByMe, reposts: Math.max(0, s.repostedByMe ? s.reposts + 1 : s.reposts - 1) }));
    }
  }, [stats, currentUser?.id, targetId, onChanged]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Avatar emoji={authorAvatar} url={authorAvatarUrl} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username} numberOfLines={1}>@{authorName || 'usuario'}</Text>
          <Text style={styles.time}>{timeAgo(contentTime)}</Text>
        </View>
        {isRepost && <View style={styles.repostTag}><Ionicons name="repeat" size={14} color={colors.TEXTO_SECUNDARIO} /><Text style={styles.repostText}>Repost</Text></View>}
      </View>

      {!!shownText && <Text style={styles.body}>{shownText}</Text>}
      {needsClamp && !expanded && (
        <TouchableOpacity style={styles.moreBtn} onPress={() => setExpanded(true)}>
          <Text style={styles.moreText}>Ver más</Text>
        </TouchableOpacity>
      )}

      <MediaGrid uris={mediaUris} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.8}>
          <Ionicons
            name={stats.likedByMe ? 'heart' : 'heart-outline'}
            size={20}
            style={[
              styles.actionIcon,
              { color: stats.likedByMe ? '#e0245e' : colors.TEXTO_SECUNDARIO }
            ]}
          />
          <Text style={styles.actionCount}>{stats.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onRepost} activeOpacity={0.8}>
          <Ionicons
            name="repeat"
            size={20}
            style={[
              styles.actionIcon,
              { color: stats.repostedByMe ? '#17bf63' : colors.TEXTO_SECUNDARIO }
            ]}
          />
          <Text style={styles.actionCount}>{stats.reposts || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onSave} activeOpacity={0.8}>
          <Ionicons
            name={stats.savedByMe ? 'bookmark' : 'bookmark-outline'}
            size={20}
            style={[
              styles.actionIcon,
              { color: stats.savedByMe ? colors.PRIMARIO : colors.TEXTO_SECUNDARIO }
            ]}
          />
          <Text style={styles.actionCount}>{stats.saves || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const AV = 34;

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#FFFFFF22',
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: AV, height: AV, borderRadius: AV / 2, backgroundColor: '#1f1f1f',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 10,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 18 },
  username: { color: colors.BLANCO, fontWeight: '700' },
  time: { color: colors.TEXTO_SECUNDARIO, fontSize: 12, marginTop: 2 },

  body: { color: colors.TEXTO_PRINCIPAL, fontSize: 15, lineHeight: 20, marginTop: 4 },
  moreBtn: { marginTop: 6 },
  moreText: { color: colors.PRIMARIO, fontWeight: '700' },

  mediaGrid: { marginTop: 8 },
  m1: { width: '100%', height: 170, borderRadius: 12 },
  row2: { flexDirection: 'row', gap: 6 },
  m2: { flex: 1, height: 170, borderRadius: 12 },
  row3: { flexDirection: 'row', gap: 6 },
  m3left: { width: 170, height: 170, borderRadius: 12 },
  col3: { flex: 1, gap: 6 },
  m3small: { flex: 1, height: (170 - 6) / 2, borderRadius: 12 },

  repostTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF11', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  repostText: { color: colors.TEXTO_SECUNDARIO, fontSize: 12 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  actionIcon: { color: colors.TEXTO_SECUNDARIO },
  actionCount: { color: colors.TEXTO_SECUNDARIO, fontSize: 12 },
});
