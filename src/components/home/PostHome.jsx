// src/components/home/PostHome.jsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';

export default function PostHome({ onAdd }) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de galería.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) setImageUri(result.uri);
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
  return (
    <View style={styles.card}>
      {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
      <Text style={styles.username}>Yo</Text>
      <Text style={styles.text}>{post.text}</Text>
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
    backgroundColor: colors.FONDO_CARDS,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  username: {
    fontWeight: 'bold',
    color: colors.SECUNDARIO,
    marginBottom: 4,
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
  },
});
