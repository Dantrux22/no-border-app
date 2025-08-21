// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAYEs940csQs3OoiNpXQ3D-Q8YvZQVg4Xk',
  authDomain: 'no-border-app.firebaseapp.com',
  projectId: 'no-border-app',
  storageBucket: 'no-border-app.firebasestorage.app',
  messagingSenderId: '189028890663',
  appId: '1:189028890663:web:08aed1f6dec9c10e07f602',
  databaseURL: 'https://no-border-app-default-rtdb.firebaseio.com', // <- importante
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
