// src/components/home/Home.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, FlatList, RefreshControl, Text, TextInput,
  TouchableOpacity, StyleSheet, Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import Header from '../Header';
import PostComponent from './PostComponent';
import { listFeedPosts, createPost } from '../../db/posts';
import { colors } from '../global/colors';

function PostComposer({ currentUser, onPosted }) {
  const [mountedOnce] = useState(() => {
    if (globalThis.__NB_COMPOSER__) return false;
    globalThis.__NB_COMPOSER__ = true;
    return true;
  });
  useEffect(() => () => { globalThis.__NB_COMPOSER__ = false; }, []);
  if (!mountedOnce) return null;

  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);

  const disabled = sending || !currentUser || (text.trim().length === 0 && photos.length === 0);

  const addPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso requerido', 'Otorgá permisos para la galería.');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: Math.max(1, 4 - photos.length),
        quality: 0.9,
      });
      if (!result.canceled) {
        const picked = (result.assets || []).map((a) => a.uri).filter(Boolean);
        setPhotos((prev) => [...prev, ...picked].slice(0, 4));
      }
    } catch {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
      });
      if (!res.canceled && res.assets?.length) {
        setPhotos((p) => [...p, res.assets[0].uri].slice(0, 4));
      }
    }
  };

  const removePhoto = (uri) => setPhotos((p) => p.filter((u) => u !== uri));

  const handlePost = async () => {
    if (disabled) return;
    try {
      setSending(true);
      const body = text.trim();
      await createPost({ userId: currentUser.id, body, mediaUris: photos });
      setText('');
      setPhotos([]);
      onPosted?.();
    } catch (e) {
      console.log('❌ Error publicando post:', e);
      Alert.alert('Error', 'No se pudo publicar.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={composerStyles.wrap}>
      {!currentUser && <Text style={composerStyles.note}>Iniciá sesión para publicar.</Text>}

      <TextInput
        style={composerStyles.input}
        placeholder="¿Qué está pasando?"
        placeholderTextColor={colors.TEXTO_PRINCIPAL + '88'}
        multiline
        value={text}
        onChangeText={setText}
      />

      {photos.length > 0 && (
        <View style={composerStyles.grid}>
          {photos.map((uri) => (
            <View key={uri} style={composerStyles.thumbWrap}>
              <Image source={{ uri }} style={composerStyles.thumb} />
              <TouchableOpacity style={composerStyles.thumbX} onPress={() => removePhoto(uri)}>
                <Text style={{ color: '#000', fontWeight: '900' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={composerStyles.row}>
        <TouchableOpacity onPress={addPhotos} style={composerStyles.ghostBtn} activeOpacity={0.8}>
          <Text style={composerStyles.ghostText}>Agregar fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[composerStyles.btn, disabled ? composerStyles.btnDisabled : composerStyles.btnPrimary]}
          onPress={handlePost}
          disabled={disabled}
          activeOpacity={0.9}
        >
          <Text style={composerStyles.btnText}>{sending ? 'Publicando…' : 'Publicar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Home() {
  const [feed, setFeed] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = useSelector((s) => s.user?.currentUser);

  const load = useCallback(async () => {
    try {
      const rows = await listFeedPosts({ limit: 50, offset: 0, currentUserId: currentUser?.id || '' });
      setFeed(Array.isArray(rows) ? rows : []);
    } catch (e) {
      console.log('⚠️ error cargando feed:', e);
      setFeed([]);
    }
  }, [currentUser?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const safeFeed = useMemo(() => (Array.isArray(feed) ? feed.filter(Boolean) : []), [feed]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.FONDO }}>
      <Header />
      <PostComposer currentUser={currentUser} onPosted={load} />
      <FlatList
        data={safeFeed}
        keyExtractor={(p, idx) => p?.id ?? `tmp-${idx}`}
        renderItem={({ item }) => (item ? <PostComponent post={item} currentUser={currentUser} onChanged={load} /> : null)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text style={{ color: colors.TEXTO_SECUNDARIO, textAlign: 'center' }}>No hay publicaciones todavía.</Text>
          </View>
        }
      />
    </View>
  );
}

const TH = 90;

const composerStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFFFFF22',
    backgroundColor: colors.FONDO,
  },
  note: { color: colors.TEXTO_SECUNDARIO, marginBottom: 6 },
  input: {
    minHeight: 72,
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  thumbWrap: { width: TH, height: TH, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbX: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  row: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ghostBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.PRIMARIO },
  ghostText: { color: colors.PRIMARIO, fontWeight: '700' },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnPrimary: { backgroundColor: colors.PRIMARIO },
  btnDisabled: { backgroundColor: '#2a2a2a' },
  btnText: { color: colors.BLANCO, fontWeight: '700' },
});
