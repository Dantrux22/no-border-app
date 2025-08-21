// src/firebaseStorage.js
import app from './firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Sube una imagen local (file:// o asset) a Firebase Storage y devuelve su downloadURL.
 * @param {string} uri - URI local (de ImagePicker: gallery o camera)
 * @param {string} path - ruta destino en Storage, ej: "avatars/<uid>.jpg"
 * @returns {Promise<string>} downloadURL
 */
export async function uploadImageToStorage(uri, path) {
  if (!uri) throw new Error('missing-uri');
  if (!path) throw new Error('missing-path');

  // 1) convertir a blob
  const res = await fetch(uri);
  const blob = await res.blob();

  // 2) subir
  const storage = getStorage(app);
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, blob);

  // 3) url pública
  const url = await getDownloadURL(objectRef);
  return url;
}
