import { StyleSheet, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './global/colors';

const Header = ({ title }) => (
  <LinearGradient
    colors={['#000000ff', '#232f82ff']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 2 }}
    style={styles.container}
  >
    <Image
          source={{ uri: 'https://amhigo.com/images/amhiblog/expertos/Luis_Flores_/Foto_portada.jpg' }}
      style={[styles.avatar, styles.avatarPosition]}
    />
    <Text style={styles.title}>{title}</Text>
  </LinearGradient>
);

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 80,
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.NEGRO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarPosition: {
    position: 'absolute',
    left: 30,
    top: 36,    
  },
  title: {
    fontSize: 22,
    color: colors.BLANCO,
    fontWeight: 'bold',
  },
});