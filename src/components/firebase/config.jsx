// src/firebase/config.jsx
import { initializeApp, getApps, getApp } from 'firebase/app';
import { collection, getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
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
    console.error('Missing environment variables:', missing);
    console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_FIREBASE')));
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Log actual values for debugging (mask sensitive data)
  console.log('Firebase env validation:', {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: import.meta.env.VITE_FIREBASE_AD,
    hasApiKey: !!import.meta.env.VITE_FIREBASE,
    hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
  });
};

// Collection names
const COLLECTION_NAMES = {
  AIRDROPS: 'airdrops',
  WHITELIST: 'whitelist'
};

// Initialize Firebase variables - using singleton pattern
let app;
let db;
let auth;
let airdropsCollection;
let whitelistCollection;

try {
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

  // Log configuration for debugging (with more details)
  console.log('Firebase Config Validation:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : 'MISSING',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING',
    measurementId: firebaseConfig.measurementId
  });

  // Validate configuration
  validateConfig(firebaseConfig);

  // Initialize Firebase app with singleton pattern
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firestore - USE GETFIRESTORE INSTEAD
  db = getFirestore(app);
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize collections
  airdropsCollection = collection(db, COLLECTION_NAMES.AIRDROPS);
  whitelistCollection = collection(db, COLLECTION_NAMES.WHITELIST);
  
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
  whitelistCollection,
  COLLECTION_NAMES 
};

// Export type-safe collection getter
export const getCollection = (collectionName) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return collection(db, collectionName);
};