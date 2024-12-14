import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

const getAirdropWalletAddresses = async () => {
  try {
    // Get reference to airdrops collection
    const airdropsRef = collection(db, 'airdrops');
    
    // Create query to get all documents
    const querySnapshot = await getDocs(airdropsRef);
    
    // Extract wallet addresses
    const walletAddresses = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        wallet: data.wallet,
        email: data.email,
        airdropType: data.airdropType,
        submittedAt: data.submittedAt?.toDate().toISOString()
      };
    });

    // Export to CSV
    const csv = walletAddresses.map(entry => 
      `${entry.wallet},${entry.email},${entry.airdropType},${entry.submittedAt}`
    ).join('\n');

    // Create and download CSV file
    const blob = new Blob([`wallet,email,airdropType,submittedAt\n${csv}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airdrop-wallets.csv';
    a.click();

    return walletAddresses;
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    throw error;
  }
};

export default getAirdropWalletAddresses;