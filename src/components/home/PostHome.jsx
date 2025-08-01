import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../global/colors';

const PostHome = ({ onPost }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const handleImagePick = async () => {
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

    onPost({ text, image });
    setText('');
    setImage(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="¿Qué estás pensando?"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
      />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.buttons}>
        <Button title="Imagen" onPress={handleImagePick} color={colors.PRIMARIO} />
        <Button title="Publicar" onPress={handleSubmit} color={colors.PRIMARIO} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.FONDO_CARDS,
    padding: 10,
    borderRadius: 10,
    margin: 16,
  },
  input: {
    color: colors.TEXTO_PRINCIPAL,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRIS_INTERMEDIO,
    paddingVertical: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PostHome;
