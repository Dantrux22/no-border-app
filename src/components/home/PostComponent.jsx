// src/components/home/PostComponent.jsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';

export default function PostComponent({ onAdd }) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && mediaStatus === 'granted';
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return Alert.alert('Permiso requerido', 'Otorgá permisos para cámara y galería');
    }

    Alert.alert('Seleccionar imagen', '¿De dónde querés subir la imagen?', [
      {
        text: 'Galería',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
          if (!result.canceled && result.assets?.length) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      {
        text: 'Cámara',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
          });
          if (!result.canceled && result.assets?.length) {
            setImageUri(result.assets[0].uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleAdd = () => {
    if (!text.trim() && !imageUri) return;
    onAdd({ id: Date.now().toString(), text: text.trim(), imageUrl: imageUri });
    setText('');
    setImageUri(null);
  };

  return (
    <View style={styles.postHomeContainer}>
      <TextInput
        style={styles.input}
        placeholder="¿Qué estás pensando?"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        value={text}
        onChangeText={setText}
        multiline
      />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={pickImage} style={[styles.button, styles.imageButton]}>
          <Text style={styles.buttonText}>📷 Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAdd} style={[styles.button, styles.postButton]}>
          <Text style={styles.buttonText}>🚀 Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const scale = useState(new Animated.Value(1))[0];

  const handleLike = () => {
    setLiked(!liked);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.username}>@usuario</Text>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
      <Text style={styles.text}>{post.text}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? 'red' : colors.TEXTO_SECUNDARIO}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={saved ? colors.PRIMARIO : colors.TEXTO_SECUNDARIO}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postHomeContainer: {
    backgroundColor: colors.FONDO_CARDS,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    minHeight: 60,
    borderColor: colors.TEXTO_SECUNDARIO,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: colors.TEXTO_PRINCIPAL,
    backgroundColor: colors.FONDO,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: colors.SECUNDARIO,
    marginRight: 8,
  },
  postButton: {
    backgroundColor: colors.PRIMARIO,
  },
  buttonText: {
    color: colors.BLANCO,
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.FONDO,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.GRIS_INTERMEDIO,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 0,
    marginBottom: 8,
  },
  username: {
    fontWeight: 'bold',
    color: colors.TEXTO_PRINCIPAL,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginLeft: 16,
  },
});
