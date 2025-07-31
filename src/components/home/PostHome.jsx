import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';
const PostHome = ({ onPost }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }

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
    if (!text && !image) {
      Alert.alert('Campos vacíos', 'Escribe algo o selecciona una imagen.');
      return;
    }

    // Enviar el post al padre
    if (onPost) {
      onPost({ text, image });
    }

    // Limpiar campos después de publicar
    setText('');
    setImage(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="¿Qué estás pensando?"
        value={text}
        onChangeText={setText}
        style={styles.input}
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        multiline
      />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.buttons}>
        <Button title="Seleccionar Imagen" onPress={pickImage} color={colors.PRIMARIO} />
        <Button title="Publicar" onPress={handleSubmit} color={colors.SECUNDARIO} />
      </View>
    </View>
  );
};

export default PostHome;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: colors.FONDO_CARDS,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: colors.SOMBRA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.GRIS_INTERMEDIO,
    color: colors.TEXTO_PRINCIPAL,
    paddingVertical: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    borderRadius: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});
