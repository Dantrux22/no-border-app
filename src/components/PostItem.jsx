import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from './global/colors';

const PostItem = ({ text, image }) => {
  return (
    <View style={styles.container}>
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.FONDO_CARDS,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    shadowColor: colors.SOMBRA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 8,
    borderRadius: 6,
  },
  text: {
    color: colors.TEXTO_PRINCIPAL,
    fontSize: 16,
  },
});
