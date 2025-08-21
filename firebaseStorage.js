// src/firebaseStorage.js
import app from './firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadImageToStorage(uri, path) {
  if (!uri) throw new Error('missing-uri');
  if (!path) throw new Error('missing-path');

  const res = await fetch(uri);
  const blob = await res.blob();

  const storage = getStorage(app);
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob);

  return await getDownloadURL(objectRef);
}
