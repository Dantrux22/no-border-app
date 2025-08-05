// Home.jsx
import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import PostHome from './PostHome';
import PostItem from './PostItem';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const POST_HOME_HEIGHT = 160;
const SCROLL_TOP_THRESHOLD = 300;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const translateY = scrollY.interpolate({
    inputRange: [0, POST_HOME_HEIGHT],
    outputRange: [0, -POST_HOME_HEIGHT],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, POST_HOME_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: ({ nativeEvent }) => {
        const y = nativeEvent.contentOffset.y;
        setShowScrollTop(y > SCROLL_TOP_THRESHOLD);
      },
    }
  );

  const handleScrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => signOut(auth),
        },
      ]
    );
  };

  const renderItem = ({ item }) => <PostItem post={item} />;
  const keyExtractor = item => item.id;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.PRIMARIO} />

      {/* Header animado con PostHome */}
      <Animated.View style={[styles.header, { transform: [{ translateY }], opacity }]}>
        <PostHome onPost={newPost => setPosts(prev => [newPost, ...prev])} />
      </Animated.View>

      {/* Lista de posts */}
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
      />

      {/* Botón de ir arriba */}
      {showScrollTop && (
        <TouchableOpacity style={styles.scrollTopBtn} onPress={handleScrollToTop}>
          <Ionicons name="arrow-up" size={24} color={colors.BLANCO} />
        </TouchableOpacity>
      )}

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={colors.BLANCO} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: POST_HOME_HEIGHT,
    backgroundColor: colors.PRIMARIO,
    zIndex: 10,
  },
  listContent: {
    paddingTop: POST_HOME_HEIGHT,
    paddingBottom: 80,
  },
  scrollTopBtn: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: colors.PRIMARIO,
    borderRadius: 24,
    padding: 12,
    elevation: 5,
  },
  logoutBtn: {
    position: 'absolute',
    top: 12,
    right: 20,
    backgroundColor: colors.SECUNDARIO,
    borderRadius: 24,
    padding: 8,
    elevation: 5,
  },
});

export default Home;
