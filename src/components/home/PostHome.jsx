import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import PostHome from './PostHome';
import PostItem from '../PostItem';
import { colors } from '../global/colors';
<<<<<<< HEAD
=======
const PostForm = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
>>>>>>> parent of 61e635a (.)

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

<<<<<<< HEAD
  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
=======
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!text && !image) {
      Alert.alert('Campos vacíos', 'Escribe algo o selecciona una imagen.');
      return;
    }

    console.log('Publicación:', { text, image });
    setText('');
    setImage(null);
>>>>>>> parent of 61e635a (.)
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.postHomeContainer,
          {
            height: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [undefined, 0],
              extrapolate: 'clamp',
            }),
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            overflow: 'hidden',
          },
        ]}
      >
        <PostHome onPost={handleNewPost} />
      </Animated.View>

      <Animated.FlatList
        data={posts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <PostItem text={item.text} image={item.image} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
    </View>
  );
};

<<<<<<< HEAD
=======
export default PostForm;

>>>>>>> parent of 61e635a (.)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    paddingTop: StatusBar.currentHeight || 0,
  },
<<<<<<< HEAD
  postHomeContainer: {
=======
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.SOMBRA,
    color: colors.TEXTO_PRINCIPAL,
    paddingVertical: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  image: {
>>>>>>> parent of 61e635a (.)
    width: '100%',
  },
});

export default Home;
