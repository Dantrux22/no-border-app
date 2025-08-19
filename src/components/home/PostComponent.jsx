// src/components/home/PostComponent.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../global/colors';
import { toggleLike, toggleSave, toggleRepost } from '../../db/posts';
import { Ionicons } from '@expo/vector-icons';

function timeAgo(ts) {
  if (!ts) return '';
  const d = new Date(ts.replace(' ', 'T') + 'Z');
  const now = new Date();
  const diff = Math.max(0, (now - d) / 1000);
  if (diff < 60) return 'ahora';
  const m = Math.floor(diff / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const da = Math.floor(h / 24);
  if (da < 7) return `hace ${da} d`;
  const w = Math.floor(da / 7);
  if (w < 4) return `hace ${w} sem`;
  const mo = Math.floor(da / 30);
  if (mo < 12) return `hace ${mo} mes`;
  const y = Math.floor(da / 365);
  return `hace ${y} a`;
}

function Avatar({ emoji, url, size }) {
  const AV = size || 40;
  if (url) return <Image source={{ uri: url }} style={{ width: AV, height: AV, borderRadius: AV / 2 }} />;
  return (
    <View style={{ width: AV, height: AV, borderRadius: AV / 2, backgroundColor: colors.FONDO_CARDS, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18 }}>{emoji || '🙂'}</Text>
    </View>
  );
}

function MediaGrid({ uris }) {
  if (!uris?.length) return null;
  const imgs = uris.slice(0, 4);
  const IMG = 170;
  const one = imgs.length === 1, two = imgs.length === 2, three = imgs.length === 3, four = imgs.length === 4;

  return (
    <View style={styles.mediaGrid}>
      {one && <Image source={{ uri: imgs[0] }} style={styles.m1} />}
      {two && (
        <View style={styles.row2}>
          <Image source={{ uri: imgs[0] }} style={styles.m2} />
          <Image source={{ uri: imgs[1] }} style={styles.m2} />
        </View>
      )}
      {three && (
        <View style={styles.row3}>
          <Image source={{ uri: imgs[0] }} style={styles.m3left} />
          <View style={styles.col3}>
            <Image source={{ uri: imgs[1] }} style={styles.m3small} />
            <Image source={{ uri: imgs[2] }} style={styles.m3small} />
          </View>
        </View>
      )}
      {four && (
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

const CLAMP = 240;

export default function PostComponent({ post, currentUser, onChanged }) {
  if (!post || typeof post !== 'object') return null;

  const isRepost = !!post.isRepost;
  const reposterName = post.author?.username;

  const authorName   = isRepost ? (post.original?.author?.username ?? '(autor)') : (post.author?.username ?? '(autor)');
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
  const canAct = !!currentUser?.id && !!targetId;

  const onLike = useCallback(async () => {
    if (!canAct) return;
    try {
      setStats((s) => ({ ...s, likes: s.likes + (s.likedByMe ? -1 : 1), likedByMe: !s.likedByMe }));
      const res = await toggleLike({ userId: currentUser.id, postId: targetId });
      setStats((s) => ({ ...s, likes: res.likes, likedByMe: res.liked }));
      onChanged?.();
    } catch (e) { console.log('like error', e); }
  }, [canAct, currentUser?.id, targetId, onChanged]);

  const onSave = useCallback(async () => {
    if (!canAct) return;
    try {
      setStats((s) => ({ ...s, saves: s.saves + (s.savedByMe ? -1 : 1), savedByMe: !s.savedByMe }));
      const res = await toggleSave({ userId: currentUser.id, postId: targetId });
      setStats((s) => ({ ...s, saves: res.saves, savedByMe: res.saved }));
      onChanged?.();
    } catch (e) { console.log('save error', e); }
  }, [canAct, currentUser?.id, targetId, onChanged]);

  const onRepost = useCallback(async () => {
    if (!canAct) return;
    try {
      setStats((s) => ({ ...s, reposts: s.reposts + (s.repostedByMe ? -1 : 1), repostedByMe: !s.repostedByMe }));
      const res = await toggleRepost({ userId: currentUser.id, targetPostId: targetId });
      setStats((s) => ({ ...s, reposts: res.reposts, repostedByMe: res.reposted }));
      onChanged?.();
    } catch (e) { console.log('repost error', e); }
  }, [canAct, currentUser?.id, targetId, onChanged]);

  return (
    <View style={styles.card}>
      {isRepost && (
        <View style={styles.repostBadge}>
          <Text style={styles.repostText}>↻ Reposteado por @{reposterName || 'usuario'}</Text>
        </View>
      )}

      <View style={styles.rowTop}>
        <Avatar emoji={authorAvatar} url={authorAvatarUrl} size={40} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.nameRow}>
            <Text style={styles.author}>@{authorName}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{timeAgo(contentTime)}</Text>
          </View>

          {!!shownText && <Text style={styles.body}>{shownText}</Text>}
          {needsClamp && (
            <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.moreBtn} activeOpacity={0.7}>
              <Text style={styles.moreText}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
            </TouchableOpacity>
          )}

          <MediaGrid uris={mediaUris} />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onLike} style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons
                name={stats.likedByMe ? 'heart' : 'heart-outline'}
                size={18}
                style={[styles.actionIcon, stats.likedByMe && { color: '#ff3b30' }]}
              />
              <Text style={styles.actionCount}>{stats.likes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onRepost} style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons
                name="repeat"
                size={18}
                style={[styles.actionIcon, stats.repostedByMe && { color: '#34c759' }]}
              />
              <Text style={styles.actionCount}>{stats.reposts || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSave} style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons
                name={stats.savedByMe ? 'bookmark' : 'bookmark-outline'}
                size={18}
                style={[styles.actionIcon, stats.savedByMe && { color: '#0a84ff' }]}
              />
              <Text style={styles.actionCount}>{stats.saves || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const IMG = 170;

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFFFFF22',
    backgroundColor: colors.FONDO,
  },
  repostBadge: { marginBottom: 6, paddingHorizontal: 4 },
  repostText: { color: colors.TEXTO_SECUNDARIO, fontSize: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start' },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  author: { color: colors.BLANCO, fontWeight: '800' },
  dot: { color: colors.TEXTO_SECUNDARIO },
  time: { color: colors.TEXTO_SECUNDARIO, fontSize: 12 },

  body: { color: colors.TEXTO_PRINCIPAL, lineHeight: 20, marginTop: 4 },
  moreBtn: { marginTop: 6 },
  moreText: { color: colors.PRIMARIO, fontWeight: '700' },

  mediaGrid: { marginTop: 8 },
  m1: { width: '100%', height: IMG, borderRadius: 12 },
  row2: { flexDirection: 'row', gap: 6 },
  m2: { flex: 1, height: IMG, borderRadius: 12 },
  row3: { flexDirection: 'row', gap: 6 },
  m3left: { width: IMG, height: IMG, borderRadius: 12 },
  col3: { flex: 1, gap: 6 },
  m3small: { flex: 1, height: (IMG - 6) / 2, borderRadius: 12 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  actionIcon: { color: colors.TEXTO_SECUNDARIO },
  actionCount: { color: colors.TEXTO_SECUNDARIO, fontSize: 12 },
});
