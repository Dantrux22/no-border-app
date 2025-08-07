// src/components/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeFirestore,
  getFirestore,
  enableIndexedDbPersistence,
  enableNetwork,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔐 Tu config de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk',
  authDomain: 'no-border-app.firebaseapp.com',
  projectId: 'no-border-app',
  storageBucket: 'no-border-app.appspot.com',
  messagingSenderId: '189028890663',
  appId: '1:189028890663:web:08aed1f6dec9c10e07f602',
};

// ⚡ Inicializamos app (solo una vez)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🔑 Auth con AsyncStorage para persistencia de sesión
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔥 Firestore con configuración
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// ✅ (Opcional) Activar persistencia offline en Firestore
// enableIndexedDbPersistence(db).catch((err) => {
//   console.warn('No se pudo activar persistencia offline:', err.code);
// });

// ✅ Forzar conexión en operaciones críticas
export async function ensureFirestoreOnline() {
  try {
    await enableNetwork(db);
    console.log('✅ Firestore network enabled.');
  } catch (err) {
    console.warn('⚠️ No se pudo habilitar network en Firestore:', err);
  }
}

// ☁️ Storage
const storage = getStorage(app);

export { auth, db, storage };
