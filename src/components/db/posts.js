import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const POSTS = collection(db, 'posts');

export async function addPost({ userId, username, avatar, text, imageUrl }) {
  return await addDoc(POSTS, {
    userId: userId || null,
    username: username || 'usuario',
    avatar: avatar || '🙂',        
    text: text || '',
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),  
    createdAtClient: Date.now(),   
    likesCount: 0,
    savesCount: 0,
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

export async function updateLikes(postId, delta) {
  const ref = doc(db, 'posts', postId);
  await updateDoc(ref, { likesCount: increment(delta) });
}

export async function updateSaves(postId, delta) {
  const ref = doc(db, 'posts', postId);
  await updateDoc(ref, { savesCount: increment(delta) });
}
