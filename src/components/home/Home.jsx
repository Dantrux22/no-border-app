import { StyleSheet, Text, View } from 'react-native';
import PostForm from './PostHome'; // ajustá la ruta si es necesario

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home-Publicaciones de usuarios</Text>
      <PostForm />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
