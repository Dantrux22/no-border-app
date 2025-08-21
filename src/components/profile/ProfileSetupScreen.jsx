// src/components/profile/ProfileSetupScreen.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';
import {
  updateUserAvatar,
  updateUserAvatarUrl,
  getCurrentUserId,
  markProfileCompleted,
} from '../../db/auth';

import { resetToNested, navigate, isReady } from '../../navigation/navigationRef';

import { uploadImageToStorage } from '../../firebaseStorage';

const EMOJIS = ['🦊','🐨','🐯','🐸','🐵','🐶','🐱','🦁','🐼','🦄','🧑','👩','👨','🧔','👩‍🦰','👨‍🦱','👩‍🦳','👨‍🦲','👩‍🎨','🕵️‍♂️'];

export default function ProfileSetupScreen() {
  const [tab, setTab] = useState('emoji');   
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetToHome = () => {
    if (isReady()) resetToNested('App', 'Home');
    else navigate('App', { screen: 'Home' });
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Otorgá permisos de cámara para sacar una foto.');
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1], 
    });
    if (!result.canceled && result.assets?.length) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Otorgá permisos para acceder a la galería.');
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.length) setImageUri(res.assets[0].uri);
  };

  const resolveUserId = async () => {
    try {
      const uid = await getCurrentUserId();
      if (uid) return uid;
    } catch {}
    return null;
  };

  const handleSave = async () => {
    const uid = await resolveUserId();
    if (!uid) return Alert.alert('Ups', 'No hay sesión activa.');

    setSaving(true);
    try {
      if (tab === 'emoji') {
        await updateUserAvatar(uid, emoji);
        await updateUserAvatarUrl(uid, null);
      } else {
        if (!imageUri) {
          setSaving(false);
          return Alert.alert('Elegí o tomá una foto primero.');
        }
        setUploading(true);
        const path = `avatars/${uid}.jpg`; 
        const url = await uploadImageToStorage(imageUri, path);
        setUploading(false);

        await updateUserAvatarUrl(uid, url);
      }

      await markProfileCompleted(uid, 1);
      resetToHome();
    } catch (e) {
      console.log('❌ profile save error:', e);
      Alert.alert('Error', 'No se pudo guardar el avatar.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.centerCard}>
        <Text style={styles.title}>Elegí tu avatar para tu perfil</Text>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('emoji')} style={[styles.tab, tab === 'emoji' && styles.tabActive]}>
            <Text style={styles.tabText}>Emoji</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('foto')} style={[styles.tab, tab === 'foto' && styles.tabActive]}>
            <Text style={styles.tabText}>Foto</Text>
          </TouchableOpacity>
        </View>

        {tab === 'emoji' ? (
          <FlatList
            data={EMOJIS}
            numColumns={5}
            keyExtractor={(it, i) => String(i)}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              const sel = emoji === item;
              return (
                <TouchableOpacity onPress={() => setEmoji(item)} style={[styles.emojiItem, sel && styles.emojiItemSel]}>
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.fotoContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewText}>Sin foto</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.ghostBtn} onPress={takePhoto}>
                <Text style={styles.ghostBtnText}>Tomar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={pickFromGallery}>
                <Text style={styles.ghostBtnText}>Elegir de galería</Text>
              </TouchableOpacity>
            </View>

            {uploading && (
              <View style={{ marginTop: 10, alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ color: colors.TEXTO_SECUNDARIO, marginTop: 6 }}>Subiendo foto…</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={[styles.button, (saving || uploading) && { opacity: 0.7 }]} onPress={handleSave} disabled={saving || uploading}>
          <Text style={styles.buttonText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SIZE = 64;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.FONDO, alignItems: 'center', justifyContent: 'center', padding: 16 },
  centerCard: { width: '100%', maxWidth: 420, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.TEXTO_PRINCIPAL, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },

  tabs: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', marginBottom: 14, alignSelf: 'center' },
  tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: colors.FONDO_CARDS, alignItems: 'center' },
  tabActive: { backgroundColor: colors.PRIMARIO },
  tabText: { color: colors.BLANCO, fontWeight: '600' },

  grid: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 8 },
  emojiItem: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    backgroundColor: colors.FONDO_CARDS,
    alignItems: 'center', justifyContent: 'center',
    margin: 8, borderWidth: 2, borderColor: 'transparent',
  },
  emojiItemSel: { borderColor: colors.PRIMARIO },
  emoji: { fontSize: 28 },

  fotoContainer: { alignItems: 'center', marginVertical: 8 },
  preview: { width: 160, height: 160, borderRadius: 80, marginBottom: 12 },
  previewPlaceholder: {
    width: 160, height: 160, borderRadius: 80, backgroundColor: colors.FONDO_CARDS,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  previewText: { color: colors.TEXTO_SECUNDARIO },

  ghostBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.PRIMARIO, alignSelf: 'center' },
  ghostBtnText: { color: colors.PRIMARIO, fontWeight: '600' },

  button: { marginTop: 16, backgroundColor: colors.PRIMARIO, paddingVertical: 12, borderRadius: 10, alignItems: 'center', alignSelf: 'center', minWidth: 200 },
  buttonText: { color: colors.BLANCO, fontWeight: 'bold', fontSize: 16 },
});
