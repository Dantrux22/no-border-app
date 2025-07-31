import { StyleSheet, Text, View } from 'react-native';
import { colors } from './global/colors';
const Header = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: colors.FONDO_CARDS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    elevation: 4,
    shadowColor: colors.SOMBRA,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXTO_PRINCIPAL,
  },
});
