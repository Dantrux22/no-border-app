// src/components/profile/ProfileSetupScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { colors } from '../global/colors';
import { saveUserProfile } from '../db/localStore';

const EMOJIS = [
  '🦊','🐨','🐯','🐸','🐵','🐶','🐱','🦁','🐼','🦄',
  '🧑','👩','👨','🧔','👩‍🦰','👨‍🦱','👩‍🦳','👨‍🦲','👩‍🎨','🕵️‍♂️'
];

function withTimeout(promise, ms) {
  let t;
  return Promise.race([
    promise.finally(() => clearTimeout(t)),
    new Promise(resolve => { t = setTimeout(() => resolve('TIMEOUT'), ms); }),
  ]);
}

export default function ProfileSetupScreen() {
  const nav = useNavigation();

  const [tab, setTab] = useState('emoji'); // 'emoji' | 'foto'
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [imageUri, setImageUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const goEmoji = () => {
    setImageUri(null);
    setTab('emoji');
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Otorgá permisos para la galería.');
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.length) {
      setImageUri(res.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert('Ups', 'No hay usuario autenticado.');

    // Si están en Foto, bloqueamos guardado y los movemos a Emoji
    if (tab === 'foto') {
      Alert.alert(
        'Opción no disponible',
        'Subir foto de perfil no está disponible (plan pago). Elegí un emoji en la otra pestaña.',
        [{ text: 'OK', onPress: goEmoji }]
      );
      return;
    }

    setSaving(true);
    try {
      // Guardar en Firestore con timeout: si tarda, igual navegamos
      const write = setDoc(doc(db, 'users', uid), { avatar: emoji }, { merge: true });
      const res = await withTimeout(write, 4000);
      // Cache local para que Home ya lo tenga
      await saveUserProfile(uid, { avatar: emoji });
      // Ir al Home aunque el write siga (en emulador puede demorar)
      nav.reset({ index: 0, routes: [{ name: 'Home' }] });
      if (res === 'TIMEOUT') {
        // Dejar terminar en background, silenciar error
        write.catch(() => {});
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el avatar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.centerCard}>
        <Text style={styles.title}>Elegí tu avatar para tu perfil</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setTab('emoji')}
            style={[styles.tab, tab === 'emoji' && styles.tabActive]}
          >
            <Text style={styles.tabText}>Emoji</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('foto')}
            style={[styles.tab, tab === 'foto' && styles.tabActive]}
          >
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
                <TouchableOpacity
                  onPress={() => setEmoji(item)}
                  style={[styles.emojiItem, sel && styles.emojiItemSel]}
                >
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.fotoContainer}>
            <Text style={styles.notice}>(opción no disponible – plan pago)</Text>

            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewText}>Sin foto</Text>
              </View>
            )}

            <TouchableOpacity style={styles.ghostBtn} onPress={pickFromGallery}>
              <Text style={styles.ghostBtnText}>Elegir foto de galería</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SIZE = 64;

const styles = StyleSheet.create({
  // Pantalla centrada
  screen: {
    flex: 1,
    backgroundColor: colors.FONDO,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  // Tarjeta central para contener todo alineado
  centerCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
    alignSelf: 'center',
  },
  tab: { flex: 1, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: colors.FONDO_CARDS, alignItems: 'center' },
  tabActive: { backgroundColor: colors.PRIMARIO },
  tabText: { color: colors.BLANCO, fontWeight: '600' },

  grid: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 8 },
  emojiItem: {
    width: SIZE, height: SIZE, borderRadius: SIZE/2,
    backgroundColor: colors.FONDO_CARDS,
    alignItems: 'center', justifyContent: 'center',
    margin: 8, borderWidth: 2, borderColor: 'transparent',
  },
  emojiItemSel: { borderColor: colors.PRIMARIO },
  emoji: { fontSize: 28 },

  fotoContainer: { alignItems: 'center', marginVertical: 8 },
  notice: { color: colors.TEXTO_SECUNDARIO, marginBottom: 8, textAlign: 'center' },
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
