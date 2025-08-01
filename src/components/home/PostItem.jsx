import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../global/colors';

const PostItem = ({ text, image }) => {
  return (
    <View style={styles.card}>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.FONDO_CARDS,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.SOMBRA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});

export default PostItem;
