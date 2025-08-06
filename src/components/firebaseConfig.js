// src/components/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk',
  authDomain: 'no-border-app.firebaseapp.com',
  projectId: 'no-border-app',
  storageBucket: 'no-border-app.appspot.com',
  messagingSenderId: '189028890663',
  appId: '1:189028890663:web:08aed1f6dec9c10e07f602',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🛡️ Asegurarse de inicializar Auth solo una vez
let auth;
try {
  auth = getAuth(app); // Esto falla si no fue inicializado antes
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

let db;
if (!global.__firestoreInitialized) {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
  global.__firestoreInitialized = true;
} else {
  db = getFirestore(app);
}

export { auth, db };
export const storage = getStorage(app);
try {
  setLogLevel('silent');
} catch {}
