import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';

const PostHome = ({ onPost }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!text.trim() && !image) {
      Alert.alert('Publicación vacía', 'Escribí algo o subí una imagen.');
      return;
    }

    onPost({ text, image });
    setText('');
    setImage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.input}
          placeholder="¿En qué estás pensando?"
          placeholderTextColor={colors.TEXTO_SECUNDARIO}
          multiline
          scrollEnabled
          value={text}
          onChangeText={setText}
        />

        {image && (
          <Image source={{ uri: image }} style={styles.previewImage} />
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Button title="Subir imagen" color={colors.PRIMARIO} onPress={pickImage} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Button title="Publicar" color={colors.PRIMARIO} onPress={handleSubmit} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostHome;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.FONDO_CARDS,
    padding: 12,
    borderRadius: 12,
    margin: 16,
    shadowColor: colors.SOMBRA,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  scroll: {
    maxHeight: 250,
  },
  input: {
    color: colors.TEXTO_PRINCIPAL,
    borderBottomWidth: 1,
    borderColor: colors.GRIS_INTERMEDIO,
    paddingVertical: 10,
    paddingHorizontal: 6,
    minHeight: 80,
    maxHeight: 200,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
