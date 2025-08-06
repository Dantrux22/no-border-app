// src/components/firebaseConfig.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
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

// 🔑 Auth con AsyncStorage
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// 🔥 Firestore con long polling (solo una vez)
let db;
if (!global._firestoreInitialized) {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
  global._firestoreInitialized = true;
} else {
  db = getFirestore(app);
}

// ☁️ Storage
const storage = getStorage(app);

// 🔇 Silenciar logs de Firestore (opcional)
try {
  setLogLevel('silent');
} catch {}

// ✅ Exportar instancias
export { auth, db, storage };
