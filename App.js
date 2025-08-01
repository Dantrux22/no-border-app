<<<<<<< HEAD
import { View, StyleSheet, StatusBar } from 'react-native';
=======
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
>>>>>>> parent of 61e635a (.)
import Header from './src/components/Header';
import Home from './src/components/home/Home';

export default function App() {
  return (
<<<<<<< HEAD
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.FONDO} />
=======
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
>>>>>>> parent of 61e635a (.)
      <Header title="No Border" />
      <Home />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: colors.FONDO,
    paddingTop: StatusBar.currentHeight || 0,
=======
    backgroundColor: '#fff',
>>>>>>> parent of 61e635a (.)
  },
});
