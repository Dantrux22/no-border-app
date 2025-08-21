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

import MapView, { Marker } from 'react-native-maps';              
import { pickUserLocationOnce } from '../../utils/location';       

function PostComposer({ currentUser, onPosted }) {
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState(null);

  const disabled = sending || !currentUser || (text.trim().length === 0 && photos.length === 0 && !location);

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

  const addLocation = async () => {
    try {
      const loc = await pickUserLocationOnce(); 
      if (!loc) {
        Alert.alert('Ubicación', 'No se pudo obtener tu ubicación o no diste permisos.');
        return;
      }
      setLocation(loc);
    } catch (e) {
      console.log('⚠️ Ubicación error:', e);
      Alert.alert('Ubicación', 'Ocurrió un problema obteniendo tu ubicación.');
    }
  };

  const removePhoto = (uri) => setPhotos((p) => p.filter((u) => u !== uri));
  const clearLocation = () => setLocation(null);

  const handlePost = async () => {
    if (disabled) return;
    try {
      setSending(true);
      const body = text.trim();
      await createPost({
        userId: currentUser.id,
        body,
        mediaUris: photos,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        locationLabel: location?.label ?? null,
      });
      setText('');
      setPhotos([]);
      setLocation(null);
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

      {(photos.length > 0 || location) && (
        <View style={composerStyles.grid}>
          {photos.map((uri) => (
            <View key={uri} style={composerStyles.thumbWrap}>
              <Image source={{ uri }} style={composerStyles.thumb} />
              <TouchableOpacity style={composerStyles.thumbX} onPress={() => removePhoto(uri)}>
                <Text style={{ color: '#000', fontWeight: '900' }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {location && (
            <View style={composerStyles.thumbWrap}>
              <MapView
                style={composerStyles.thumb}
                pointerEvents="none"
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
              </MapView>
              <TouchableOpacity style={composerStyles.thumbX} onPress={clearLocation}>
                <Text style={{ color: '#000', fontWeight: '900' }}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {location && (
        <Text style={composerStyles.locHint} numberOfLines={2}>
          📍 {location.label ? `Cerca de ${location.label}` : `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`}
        </Text>
      )}

      <View style={composerStyles.row}>
        <View style={composerStyles.leftOptions}>
          <TouchableOpacity onPress={addPhotos} style={composerStyles.ghostBtn} activeOpacity={0.8}>
            <Text style={composerStyles.ghostText}>Agregar fotos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={addLocation}
            style={[composerStyles.ghostBtn, location && composerStyles.ghostActive]}
            activeOpacity={0.8}
          >
            <Text style={[composerStyles.ghostText, location && composerStyles.ghostTextActive]}>
              {location ? 'Ubicación lista' : 'Agregar ubicación'}
            </Text>
          </TouchableOpacity>
        </View>

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
  thumb: { width: '100%', height: '100%', borderRadius: 10 },
  thumbX: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  locHint: { marginTop: 6, color: colors.TEXTO_SECUNDARIO, fontSize: 12 },

  row: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftOptions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, // ← NUEVO

  ghostBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.PRIMARIO },
  ghostText: { color: colors.PRIMARIO, fontWeight: '700' },
  ghostActive: { borderColor: '#1DB954' },
  ghostTextActive: { color: '#1DB954' },

  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnPrimary: { backgroundColor: colors.PRIMARIO },
  btnDisabled: { backgroundColor: '#2a2a2a' },
  btnText: { color: colors.BLANCO, fontWeight: '700' },
});
