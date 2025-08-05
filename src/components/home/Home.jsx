import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
  Text,
  FlatList,
} from 'react-native';
import PostHome from './PostHome';      // ← Ruta corregida
import PostItem from './PostItem';      // ← Ruta corregida
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const POST_HOME_HEIGHT = 160;
const SCROLL_TOP_THRESHOLD = 300;

export default function Home() {
  const [posts, setPosts]       = useState([]);
  const [profile, setProfile]   = useState(null);
  const scrollY                = useRef(new Animated.Value(0)).current;
  const flatListRef            = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setProfile(snap.data());
    };
    loadProfile();
  }, []);

  const translateY = scrollY.interpolate({
    inputRange:  [0, 50],
    outputRange: [0, -POST_HOME_HEIGHT],
    extrapolate: 'clamp',
  });
  const opacity = scrollY.interpolate({
    inputRange:  [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const handleNewPost = newPost => setPosts(prev => [newPost, ...prev]);
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: e =>
        setShowScrollTop(e.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD),
    }
  );
  const scrollToTop = () =>
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí',
        onPress: () => signOut(auth),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {profile && (
        <View style={styles.profileHeader}>
          {profile.avatar && (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          )}
          <Text style={styles.welcome}>
            ¡Bienvenido, {profile.username}!
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={28}
          color={colors.TEXTO_SECUNDARIO}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.postHomeContainer,
          { transform: [{ translateY }], opacity },
        ]}
      >
        <PostHome onPost={handleNewPost} />
      </Animated.View>

      <Animated.FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <PostItem text={item.text} image={item.image} />
        )}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {showScrollTop && (
        <TouchableOpacity
          style={styles.scrollTopButton}
          onPress={scrollToTop}
        >
          <Ionicons
            name="arrow-up-circle"
            size={48}
            color={colors.PRIMARIO}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.FONDO_CARDS,
    paddingTop: StatusBar.currentHeight || 0,
  },
  profileHeader: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  welcome: { color: colors.TEXTO_PRINCIPAL, fontSize: 18 },
  logoutIcon: {
    position: 'absolute',
    top: StatusBar.currentHeight || 10,
    right: 16,
    zIndex: 20,
    padding: 8,
  },
  postHomeContainer: {
    position: 'absolute',
    top: StatusBar.currentHeight || 0,
    left: 0,
    right: 0,
    height: POST_HOME_HEIGHT,
    backgroundColor: colors.FONDO,
    zIndex: 10,
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
