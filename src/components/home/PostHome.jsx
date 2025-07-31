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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
    paddingTop: StatusBar.currentHeight || 0,
  },
  postHomeContainer: {
    width: '100%',
  },
});

export default Home;
