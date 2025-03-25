import { getDocs, collection } from 'firebase/firestore';
import { db, COLLECTION_NAMES } from './config';

const getWhitelistEntries = async () => {
  try {
    // Get reference to whitelist collection
    const whitelistRef = collection(db, COLLECTION_NAMES.WHITELIST);
    
    // Create query to get all documents
    const querySnapshot = await getDocs(whitelistRef);
    
    // Extract entries
    const entries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        walletAddress: data.walletAddress,
        name: data.name || '',
        telegram: data.telegram || '',
        submittedAt: data.submittedAt?.toDate().toISOString() || '',
        status: data.status || 'pending'
      };
    });

    // Export to CSV if needed
    if (typeof window !== 'undefined') {
      const csv = entries.map(entry => 
        `${entry.email},${entry.walletAddress},${entry.name},${entry.telegram},${entry.submittedAt},${entry.status}`
      ).join('\n');

      // Create and download CSV file
      const blob = new Blob([`email,walletAddress,name,telegram,submittedAt,status\n${csv}`], 
        { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'whitelist-entries.csv';
      a.click();
    }

    return entries;
  } catch (error) {
    console.error('Error fetching whitelist entries:', error);
    throw error;
  }
};

export default getWhitelistEntries;
