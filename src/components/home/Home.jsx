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
            height: POST_HOME_HEIGHT,
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
    paddingTop: StatusBar.currentHeight || 0,
  },
  postHomeContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingTop: POST_HOME_HEIGHT + 10, // 🔥 Esto es lo que soluciona el espacio negro
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
});

export default Home;
