import { StyleSheet, View, FlatList } from 'react-native';
import { useState } from 'react';
import PostHome from './PostHome';
import PostItem from '../PostItem';
import { colors } from '../global/colors';

const Home = () => {
  const [posts, setPosts] = useState([]);

  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <View style={styles.container}>
      <PostHome onPost={handleNewPost} />
      <FlatList
        data={posts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <PostItem text={item.text} image={item.image} />
        )}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    padding: 12,
  },
});
