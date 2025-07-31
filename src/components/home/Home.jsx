import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import PostHome from './PostHome';
import PostItem from '../PostItem';
import { colors } from '../global/colors';

const screenHeight = Dimensions.get('window').height;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -200],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.postHomeContainer, { transform: [{ translateY }], opacity }]}>
        <PostHome onPost={handleNewPost} />
      </Animated.View>

      <Animated.FlatList
        data={posts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <PostItem text={item.text} image={item.image} />
        )}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    paddingTop: StatusBar.currentHeight,
  },
  postHomeContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  flatListContent: {
    paddingTop: 0, // ⛔ No más espacio arriba
    paddingBottom: 30,
  },
});

export default Home;
