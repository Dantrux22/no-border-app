import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../global/colors';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';

const PostItem = ({ text, image }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => setIsLiked(!isLiked);
  const handleSave = () => setIsSaved(!isSaved);

  return (
    <View style={styles.container}>
      {/* Header con foto y nombre de usuario */}
      <View style={styles.userInfo}>
        <Image
source={{ uri: 'https://amhigo.com/images/amhiblog/expertos/Luis_Flores_/Foto_portada.jpg' }}          style={styles.avatar}
        />
        <Text style={styles.username}>NombreUsuario</Text>
      </View>

      {/* Texto del post */}
      {text ? <Text style={styles.text}>{text}</Text> : null}

      {/* Imagen del post */}
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}

      {/* Iconos de interacción */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
          <FontAwesome
            name={isLiked ? 'heart' : 'heart-o'}
            size={22}
            color={isLiked ? 'red' : colors.TEXTO_SECUNDARIO}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="message-circle" size={22} color={colors.TEXTO_SECUNDARIO} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
          <MaterialIcons
            name={isSaved ? 'bookmark' : 'bookmark-border'}
            size={22}
            color={isSaved ? colors.PRIMARIO : colors.TEXTO_SECUNDARIO}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.FONDO_CARDS,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: colors.SOMBRA,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: colors.TEXTO_PRINCIPAL,
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  iconButton: {
    padding: 4,
  },
});