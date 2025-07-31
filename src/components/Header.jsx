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
    backgroundColor: colors.PRIMARIO,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // para evitar que se superponga con la barra de estado
    elevation: 4,
    shadowColor: colors.NEGRO,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    color: colors.BLANCO,
    fontWeight: 'bold',
  },
});
