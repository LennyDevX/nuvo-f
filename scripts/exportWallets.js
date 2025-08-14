import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';
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

async function exportWallets(airdropType = 'tokens', format = 'csv') {
  try {
    console.log(`📋 Exporting wallet addresses for ${airdropType} airdrop...`);
    
    const airdropsRef = collection(db, 'airdrops');
    const registrationsQuery = query(
      airdropsRef,
      where('airdropType', '==', airdropType)
    );
    
    const querySnapshot = await getDocs(registrationsQuery);
    const registrations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate().toISOString()
    }));
    
    console.log(`✅ Found ${registrations.length} registrations`);
    
    if (registrations.length === 0) {
      console.log('No registrations found.');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      // Export as CSV
      const csvHeader = 'wallet,name,email,status,tokensDistributed,submittedAt,distributionHash\n';
      const csvData = registrations.map(reg => 
        `${reg.wallet},${reg.name},${reg.email},${reg.status || 'pending'},${reg.tokensDistributed || false},${reg.submittedAt || ''},${reg.distributionHash || ''}`
      ).join('\n');
      
      const csvFilename = `airdrop-wallets-${airdropType}-${timestamp}.csv`;
      fs.writeFileSync(csvFilename, csvHeader + csvData);
      console.log(`📄 CSV exported to: ${csvFilename}`);
      
    } else if (format === 'json') {
      // Export as JSON
      const jsonFilename = `airdrop-wallets-${airdropType}-${timestamp}.json`;
      fs.writeFileSync(jsonFilename, JSON.stringify(registrations, null, 2));
      console.log(`📄 JSON exported to: ${jsonFilename}`);
    }

    // Summary
    const pending = registrations.filter(r => !r.tokensDistributed).length;
    const completed = registrations.filter(r => r.tokensDistributed).length;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total registrations: ${registrations.length}`);
    console.log(`Pending distribution: ${pending}`);
    console.log(`Already distributed: ${completed}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

// Command line interface
const args = process.argv.slice(2);
const airdropType = args[0] || 'tokens';
const format = args[1] || 'csv';

exportWallets(airdropType, format);
