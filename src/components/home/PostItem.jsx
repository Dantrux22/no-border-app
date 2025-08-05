import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';

const MAX_TEXT_LENGTH = 200;

const PostItem = ({ post }) => {
  const { username, profileImage, image, text } = post;
  const shortenedText = text.length > MAX_TEXT_LENGTH
    ? text.slice(0, MAX_TEXT_LENGTH) + '...'
    : text;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle" size={40} color={colors.TEXTO_SECUNDARIO} />
        )}
        <Text style={styles.username}>{username}</Text>
      </View>
      <Text style={styles.text}>{shortenedText}</Text>
      {image ? <Image source={{ uri: image }} style={styles.postImage} /> : null}
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.FONDO_CARDS,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
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
    marginBottom: 8,
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 8,
  },
});
