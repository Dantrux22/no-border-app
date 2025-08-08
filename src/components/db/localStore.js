import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const userKey = uid => `user:${uid}`;
const postsKey = 'posts';

export async function saveUserProfile(uid, partial) {
  try {
    const prevRaw = await AsyncStorage.getItem(userKey(uid));
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const next = { ...prev, ...partial };
    await AsyncStorage.setItem(userKey(uid), JSON.stringify(next));
  } catch {}
}

export async function getUserProfile(uid) {
  try {
    const raw = await AsyncStorage.getItem(userKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function fetchUser(uid) {
  const cached = await getUserProfile(uid);
  if (cached?.username) return cached;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      const profile = { username: data.username, email: data.email, avatar: data.avatar };
      await AsyncStorage.setItem(userKey(uid), JSON.stringify(profile));
      return profile;
    }
  } catch {}
  return null;
}

// (si aún usás el cache local de posts)
export async function fetchPosts() {
  try {
    const raw = await AsyncStorage.getItem(postsKey);
    const arr = raw ? JSON.parse(raw) : [];
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}
export async function savePost(post) {
  try {
    const current = await fetchPosts();
    const next = [post, ...current];
    await AsyncStorage.setItem(postsKey, JSON.stringify(next));
  } catch {}
}
