import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet, Alert, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import 'moment/locale/es';
import { updateLikes, updateSaves } from '../db/posts';

moment.locale('es');

export default function PostComponent({ onAdd, disabled }) {
  const [text, setText] = useState(''); const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const { status: ms } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cs } = await ImagePicker.requestCameraPermissionsAsync();
    if (ms !== 'granted' || cs !== 'granted') return Alert.alert('Permiso requerido', 'Otorgá permisos para cámara y galería');

    Alert.alert('Seleccionar imagen', '¿De dónde querés subir la imagen?', [
      { text: 'Galería', onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!r.canceled && r.assets?.length) setImageUri(r.assets[0].uri);
        } },
      { text: 'Cámara', onPress: async () => {
          const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
          if (!r.canceled && r.assets?.length) setImageUri(r.assets[0].uri);
        } },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleAdd = () => {
    if (!text.trim() && !imageUri) return;
    onAdd({ text: text.trim(), imageUrl: imageUri || null });
    setText(''); setImageUri(null);
  };

  return (
    <View style={styles.postHomeContainer}>
      <TextInput style={styles.input} placeholder="¿Qué estás pensando?" placeholderTextColor={colors.TEXTO_SECUNDARIO} value={text} onChangeText={setText} editable={!disabled} multiline />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={pickImage} style={[styles.button, styles.imageButton]} disabled={disabled}><Text style={styles.buttonText}>📷 Foto</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleAdd} style={[styles.button, styles.postButton]} disabled={disabled}><Text style={styles.buttonText}>{disabled ? 'Cargando...' : '🚀 Publicar'}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

export function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => { Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start(); }, []);

  const createdDate = (() => {
    const c = post?.createdAt; const cc = post?.createdAtClient;
    try { if (c?.toDate) return c.toDate(); if (typeof cc === 'number') return new Date(cc); if (typeof c === 'string') return new Date(c); } catch {}
    return null;
  })();

  const handleLike = async () => {
    const next = !liked; setLiked(next);
    try { await updateLikes(post.id, next ? +1 : -1); } catch { setLiked(!next); }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const handleSave = async () => {
    const next = !saved; setSaved(next);
    try { await updateSaves(post.id, next ? +1 : -1); } catch { setSaved(!next); }
  };

  const likesCount = post.likesCount || 0;
  const savesCount = post.savesCount || 0;
  const avatar = post.avatar || '🙂';
  const isUrl = typeof avatar === 'string' && /^https?:\/\//.test(avatar);

  return (
    <Animated.View style={[styles.card, { opacity: fadeIn }]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          {isUrl ? <Image source={{ uri: avatar }} style={styles.avatarImg} /> : <Text style={styles.avatarEmoji}>{avatar}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>@{post.username || 'usuario'}</Text>
          {createdDate && <Text style={styles.time}>Publicado hace {moment(createdDate).fromNow(true)}</Text>}
        </View>
      </View>

      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
      {!!post.text && <Text style={styles.text}>{post.text}</Text>}

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? 'red' : colors.TEXTO_SECUNDARIO} />
          </Animated.View>
          <Text style={styles.count}>{likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? colors.PRIMARIO : colors.TEXTO_SECUNDARIO} />
          <Text style={styles.count}>{savesCount}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const AV = 36;
const styles = StyleSheet.create({
  postHomeContainer: { backgroundColor: colors.FONDO_CARDS, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, padding: 12, elevation: 3 },
  input: { minHeight: 60, borderColor: colors.TEXTO_SECUNDARIO, borderWidth: 1, borderRadius: 8, padding: 10, color: colors.TEXTO_PRINCIPAL, backgroundColor: colors.FONDO, marginBottom: 8, textAlignVertical: 'top' },
  preview: { width: '100%', height: 180, borderRadius: 8, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  imageButton: { backgroundColor: colors.SECUNDARIO, marginRight: 8 },
  postButton: { backgroundColor: colors.PRIMARIO },
  buttonText: { color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },

  card: { backgroundColor: colors.FONDO, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.GRIS_INTERMEDIO, paddingVertical: 12, marginVertical: 0, marginHorizontal: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 6 },
  avatar: { width: AV, height: AV, borderRadius: AV/2, backgroundColor: colors.FONDO_CARDS, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 18 },
  username: { fontWeight: 'bold', color: colors.TEXTO_PRINCIPAL },
  time: { fontSize: 12, color: colors.TEXTO_SECUNDARIO, marginTop: 2 },
  image: { width: '100%', height: 150, borderRadius: 0, marginBottom: 8 },
  text: { color: colors.TEXTO_PRINCIPAL, marginBottom: 8, paddingHorizontal: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 16, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  count: { color: colors.TEXTO_SECUNDARIO, fontSize: 14 },
});
