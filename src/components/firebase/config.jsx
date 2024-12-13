// src/firebase/config.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "space-nft-6acba.firebaseapp.com",
  projectId: "space-nft-6acba",
  storageBucket: "space-nft-6acba.appspot.com",
  messagingSenderId: import.meta.env.VITE_PROJECT_NUMBER,
  appId: import.meta.env.VITE_APP_ID
};

let app;
let db;
let airdropsCollection;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  airdropsCollection = collection(db, 'airdrops');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { db, airdropsCollection };