import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE,
  authDomain: process.env.VITE_FIREBASE_AD,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function monitorDistribution(airdropType = 'tokens') {
  console.log(`📊 Monitoring ${airdropType} airdrop distribution...`);
  console.log('Press Ctrl+C to stop monitoring\n');
  
  const airdropsRef = collection(db, 'airdrops');
  const registrationsQuery = query(
    airdropsRef,
    where('airdropType', '==', airdropType)
  );
  
  // Real-time listener
  onSnapshot(registrationsQuery, (snapshot) => {
    const registrations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const total = registrations.length;
    const pending = registrations.filter(r => !r.tokensDistributed).length;
    const completed = registrations.filter(r => r.tokensDistributed).length;
    const failed = registrations.filter(r => r.status === 'failed').length;
    
    // Clear console and show updated stats
    console.clear();
    console.log(`📊 AIRDROP DISTRIBUTION MONITOR - ${airdropType.toUpperCase()}`);
    console.log('='.repeat(50));
    console.log(`📝 Total Registrations: ${total}`);
    console.log(`⏳ Pending: ${pending}`);
    console.log(`✅ Completed: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Progress: ${total > 0 ? Math.round((completed / total) * 100) : 0}%`);
    console.log('='.repeat(50));
    console.log(`Last updated: ${new Date().toLocaleString()}`);
    console.log('\nPress Ctrl+C to stop monitoring');
  });
}

// Run monitor
const airdropType = process.argv[2] || 'tokens';
monitorDistribution(airdropType);
