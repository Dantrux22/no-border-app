import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const POSTS = collection(db, 'posts');

export async function addPost({ userId, username, text, imageUrl }) {
  return await addDoc(POSTS, {
    userId: userId || null,
    username: username || 'usuario',
    text: text || '',
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
  });
}

export function subscribePosts(callback) {
  const q = query(POSTS, orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
  return unsub;
}
