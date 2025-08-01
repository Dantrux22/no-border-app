import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import Header from './src/components/Header';
import Home from './src/components/home/Home';
import { colors } from './src/components/global/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
      <Header title="No Border" />
      <Home />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
});
