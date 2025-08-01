import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import PostHome from './PostHome';
import PostItem from './PostItem';
import { colors } from '../global/colors';

const POST_HOME_HEIGHT = 160;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const translateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -POST_HOME_HEIGHT],
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
      <Animated.View
        style={[
          styles.postHomeContainer,
          {
            transform: [{ translateY }],
            opacity,
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
        contentContainerStyle={styles.contentContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    paddingTop: StatusBar.currentHeight || 0,
  },
  postHomeContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.FONDO,
  },
  contentContainer: {
    paddingTop: POST_HOME_HEIGHT + 10,
    paddingBottom: 50,
    paddingHorizontal: 16,
  },
});

export default Home;
