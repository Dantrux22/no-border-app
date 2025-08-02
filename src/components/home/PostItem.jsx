import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';

const MAX_TEXT_LENGTH = 200;

const PostItem = ({ text, image }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleLike = () => setIsLiked(!isLiked);
  const handleSave = () => setIsSaved(!isSaved);

  const renderText = () => {
    if (!text) return null;

    if (text.length <= MAX_TEXT_LENGTH || showFullText) {
      return (
        <>
          <Text style={styles.text}>{text}</Text>
          {text.length > MAX_TEXT_LENGTH && (
            <TouchableOpacity onPress={() => setShowFullText(false)}>
              <Text style={styles.readMore}>Leer menos</Text>
            </TouchableOpacity>
          )}
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.text}>
            {text.substring(0, MAX_TEXT_LENGTH)}...
          </Text>
          <TouchableOpacity onPress={() => setShowFullText(true)}>
            <Text style={styles.readMore}>Leer más</Text>
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con foto y nombre de usuario */}
      <View style={styles.userInfo}>
        <Image
          source={{ uri: 'https://amhigo.com/images/amhiblog/expertos/Luis_Flores_/Foto_portada.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>NombreUsuario</Text>
      </View>

      {/* Texto con botón de Leer más / Leer menos */}
      {renderText()}

      {/* Imagen del post */}
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}

      {/* Iconos en una fila */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? 'red' : colors.TEXTO_SECUNDARIO}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.TEXTO_SECUNDARIO} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
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
    backgroundColor: colors.NEGRO,
    paddingTop: 15,
    padding: 12,
   // borderRadius: 0,
    marginBottom: 2,
    marginLeft: -20,
    marginRight: -20,
   // marginHorizontal: 0,
    // shadowColor: colors.BLANCO,
    // shadowOpacity: .2,
    // shadowRadius: 1,
    // elevation: 2,
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
  readMore: {
    color: colors.PRIMARIO,
    fontSize: 14,
    fontWeight: 'bold',
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
