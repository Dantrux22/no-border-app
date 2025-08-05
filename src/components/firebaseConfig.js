// src/components/firebaseConfig.js

// 1️⃣ Importes de Firebase App y módulos de servicio
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 2️⃣ Importes necesarios para Auth con persistencia en React Native
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3️⃣ Tu configuración de Firebase (reemplaza con tus credenciales reales)
const firebaseConfig = {
  apiKey: 'AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk',
  authDomain: 'no-border-app.firebaseapp.com',
  projectId: 'no-border-app',
  storageBucket: 'no-border-app.appspot.com',
  messagingSenderId: '189028890663',
  appId: '1:189028890663:web:08aed1f6dec9c10e07f602',
};

// 4️⃣ Inicializar la app de Firebase
const app = initializeApp(firebaseConfig);

// 5️⃣ Inicializar Auth con persistencia en AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 6️⃣ Exportar Firestore y Storage como antes
export const db      = getFirestore(app);
export const storage = getStorage(app);
