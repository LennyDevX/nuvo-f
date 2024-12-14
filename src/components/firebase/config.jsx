// src/firebase/config.jsx
import { initializeApp, getApps, getApp } from 'firebase/app';
import { collection, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration validation
const validateConfig = (config) => {
  const requiredFields = [
    'apiKey',
    'projectId',
    'messagingSenderId',
    'appId',
    'measurementId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase config fields: ${missingFields.join(', ')}`);
  }
};

// Firebase configuration with environment variables
// Add environment variables validation
const validateEnvVariables = () => {
  const required = [
    'VITE_FIREBASE',
    'VITE_FIREBASE_AD',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'

  ];

  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};



// Validate before initializing
validateEnvVariables();

// Create Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE,
  authDomain: import.meta.env.VITE_FIREBASE_AD,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Collection names
const COLLECTION_NAMES = {
  AIRDROPS: 'airdrops'
};

// Initialize Firebase variables
let app;
let db;
let auth;
let airdropsCollection;

try {
  // Log configuration for debugging
  console.log('Initializing Firebase with config:', {
    apiKey: firebaseConfig.apiKey ? '***' : undefined,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? '***' : undefined
  });

  // Validate configuration
  validateConfig(firebaseConfig);

  // Initialize Firebase app
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firestore with persistence
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize collections
  airdropsCollection = collection(db, COLLECTION_NAMES.AIRDROPS);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Export initialized instances
export { 
  app,
  db, 
  auth,
  airdropsCollection,
  COLLECTION_NAMES 
};

// Export type-safe collection getter
export const getCollection = (collectionName) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return collection(db, collectionName);
};