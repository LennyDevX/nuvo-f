import { addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTION_NAMES } from './config';

/**
 * Submits a new airdrop registration to Firebase
 * 
 * @param {Object} data - The registration data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.wallet - User's wallet address
 * @param {string} data.airdropType - Type of airdrop (tokens, nfts, etc.)
 * @param {string} data.registrationHash - Blockchain transaction hash
 * @returns {Promise<Object>} - The submitted document reference
 */
const submitAirdropRegistration = async (data) => {
  try {
    console.log("Starting airdrop registration submission...");
    
    // Validate required fields
    if (!data.name || !data.email || !data.wallet) {
      throw new Error('Name, email and wallet address are required');
    }

    // Get reference to airdrops collection
    const airdropsRef = collection(db, COLLECTION_NAMES.AIRDROPS);
    
    // Check for existing entries with the same wallet for this airdrop type
    console.log("Checking for existing entries...");
    
    const walletQuery = query(
      airdropsRef, 
      where('wallet', '==', data.wallet),
      where('airdropType', '==', data.airdropType || 'tokens')
    );
    const walletResults = await getDocs(walletQuery);
    
    // Check if wallet already registered for this airdrop type
    if (!walletResults.empty) {
      throw new Error('This wallet address is already registered for this airdrop type');
    }

    // Add document to airdrops collection
    console.log("Adding entry to airdrop registrations...");
    const docRef = await addDoc(airdropsRef, {
      name: data.name,
      email: data.email,
      wallet: data.wallet,
      airdropType: data.airdropType || 'tokens',
      registrationHash: data.registrationHash || null,
      isRegistered: true,
      submittedAt: serverTimestamp(),
      status: 'pending',
      tokensDistributed: false,
      distributionHash: null,
      distributedAt: null
    });
    
    console.log('Airdrop registration submitted with ID:', docRef.id);
    
    return {
      id: docRef.id,
      name: data.name,
      email: data.email,
      wallet: data.wallet,
      airdropType: data.airdropType || 'tokens',
      registrationHash: data.registrationHash,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
  } catch (error) {
    console.error('Error submitting airdrop registration:', error);
    throw error;
  }
};

/**
 * Gets all pending airdrop registrations for distribution
 * 
 * @param {string} airdropType - Type of airdrop to filter by
 * @returns {Promise<Array>} - Array of pending registrations
 */
const getPendingRegistrations = async (airdropType = 'tokens') => {
  try {
    const airdropsRef = collection(db, COLLECTION_NAMES.AIRDROPS);
    
    const pendingQuery = query(
      airdropsRef,
      where('airdropType', '==', airdropType),
      where('tokensDistributed', '==', false),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(pendingQuery);
    
    const registrations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate().toISOString()
    }));
    
    return registrations;
  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    throw error;
  }
};

export default submitAirdropRegistration;
export { getPendingRegistrations };
