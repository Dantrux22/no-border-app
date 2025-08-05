import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

import { colors } from './global/colors';
import { auth, db, storage } from './firebaseConfig'; // ✅ Importación completa
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProfileSetupScreen = () => {
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('❌ Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      let imageUrl = null;

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
        await uploadBytes(storageRef, blob);

        imageUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          username,
          profileImage: imageUrl,
          profileCompleted: true,
        },
        { merge: true }
      );

      console.log('✅ Perfil guardado');
      Alert.alert('Perfil guardado', 'Tu perfil se guardó correctamente');
      navigation.navigate('Home');
    } catch (error) {
      console.log('❌ Error al guardar perfil:', error);
      Alert.alert('Error', 'Ocurrió un problema al guardar tu perfil');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurá tu perfil</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Seleccionar imagen</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        placeholderTextColor={colors.TEXTO_SECUNDARIO}
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.FONDO_CARDS,
    color: colors.TEXTO_PRINCIPAL,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  imagePicker: {
    backgroundColor: colors.FONDO_CARDS,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageText: {
    color: colors.TEXTO_SECUNDARIO,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  button: {
    backgroundColor: colors.PRIMARIO,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.BLANCO,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
