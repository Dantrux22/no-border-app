import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import PostHome from './PostHome';
import PostItem from './PostItem';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';

const POST_HOME_HEIGHT = 160;
const SCROLL_TOP_THRESHOLD = 300;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const y = event.nativeEvent.contentOffset.y;
        setShowScrollTop(y > SCROLL_TOP_THRESHOLD);
      },
    }
  );

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
        ref={flatListRef}
        data={posts}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <PostItem text={item.text} image={item.image} />
        )}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <Ionicons name="arrow-up-circle" size={48} color={colors.PRIMARIO} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO_CARDS,
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
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: colors.FONDO,
    borderRadius: 24,
    padding: 4,
    elevation: 6,
  },
});

export default Home;
