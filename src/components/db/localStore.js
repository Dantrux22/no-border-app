import AsyncStorage from '@react-native-async-storage/async-storage';

const POSTS_KEY = 'noborder_posts';
const USER_KEY = uid => `noborder_user_${uid}`;

export async function saveUser({ uid, username, email }) {
  try {
    await AsyncStorage.setItem(USER_KEY(uid), JSON.stringify({ uid, username, email }));
    console.log('✅ Perfil guardado localmente');
  } catch (e) {
    console.warn('⚠️ Error guardando perfil local:', e);
  }
}

export async function fetchUser(uid) {
  try {
    const s = await AsyncStorage.getItem(USER_KEY(uid));
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.warn('⚠️ Error leyendo perfil local:', e);
    return null;
  }
}

export async function savePost(post) {
  try {
    const all = await fetchPosts();
    const filtered = all.filter(p => p.id !== post.id);
    filtered.unshift(post);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(filtered));
    console.log('✅ Post guardado localmente');
  } catch (e) {
    console.warn('⚠️ Error guardando post local:', e);
  }
}

// Lee todos los posts
export async function fetchPosts() {
  try {
    const s = await AsyncStorage.getItem(POSTS_KEY);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    console.warn('⚠️ Error leyendo posts locales:', e);
    return [];
  }
}
