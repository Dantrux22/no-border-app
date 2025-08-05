// src/components/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // necesario para guardar imágenes

const firebaseConfig = {
  apiKey: "AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk",
  authDomain: "no-border-app.firebaseapp.com",
  projectId: "no-border-app",
  storageBucket: "no-border-app.appspot.com", // ⚠️ CORREGIDO: el tuyo tenía ".firebasestorage.app" (incorrecto)
  messagingSenderId: "189028890663",
  appId: "1:189028890663:web:08aed1f6dec9c10e07f602"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // importante para subir imágenes de perfil

export { auth, db, storage };
