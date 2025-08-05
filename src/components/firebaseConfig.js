// src/components/firebaseConfig.js

// 1️⃣ Importa e inicializa Firebase App
import { initializeApp, getApps, getApp } from 'firebase/app';

// 2️⃣ Configuración de Auth con persistencia en AsyncStorage
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3️⃣ Importar e inicializar Firestore con long-polling
import { initializeFirestore, getFirestore } from 'firebase/firestore';

// 4️⃣ Importar Storage
import { getStorage } from 'firebase/storage';

// 5️⃣ Tus credenciales de Firebase (reemplaza con las tuyas)
const firebaseConfig = {
  apiKey: 'AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk',
  authDomain: 'no-border-app.firebaseapp.com',
  projectId: 'no-border-app',
  storageBucket: 'no-border-app.appspot.com',
  messagingSenderId: '189028890663',
  appId: '1:189028890663:web:08aed1f6dec9c10e07f602',
};

// 6️⃣ Inicializa (o reutiliza) la app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 7️⃣ Inicializa Auth con persistencia (solo una vez)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

// 8️⃣ Inicializa Firestore con opciones para evitar streams (solo una vez)
let db;
if (!global.__dbInitialized) {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
  global.__dbInitialized = true;
} else {
  db = getFirestore(app);
}
// 9️⃣ Inicializa Storage
export const storage = getStorage(app);

export { auth, db };
