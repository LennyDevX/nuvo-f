import { addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTION_NAMES } from './config';

/**
 * Submits a new whitelist entry to Firebase
 * 
 * @param {Object} data - The whitelist entry data
 * @param {string} data.email - User's email
 * @param {string} data.walletAddress - User's wallet address
 * @param {string} data.name - User's name (optional)
 * @param {string} data.telegram - User's telegram username (optional)
 * @returns {Promise<Object>} - The submitted document reference
 */
const submitWhitelistEntry = async (data) => {
  try {
    console.log("Starting whitelist submission...");
    
    // Validate required fields
    if (!data.email || !data.walletAddress) {
      throw new Error('Email and wallet address are required');
    }

    // Get reference to whitelist collection
    const whitelistRef = collection(db, COLLECTION_NAMES.WHITELIST);
    
    // Check for existing entries with the same email or wallet
    console.log("Checking for existing entries...");
    
    const emailQuery = query(whitelistRef, where('email', '==', data.email));
    const emailResults = await getDocs(emailQuery);
    
    // Check if email already exists
    if (!emailResults.empty) {
      throw new Error('This email is already registered');
    }
    
    const walletQuery = query(whitelistRef, where('walletAddress', '==', data.walletAddress));
    const walletResults = await getDocs(walletQuery);
    
    // Check if wallet already exists
    if (!walletResults.empty) {
      throw new Error('This wallet address is already registered');
    }

    // Add document to whitelist collection
    console.log("Adding entry to whitelist...");
    const docRef = await addDoc(whitelistRef, {
      email: data.email,
      walletAddress: data.walletAddress,
      name: data.name,
      telegram: data.telegram,
      submittedAt: serverTimestamp(),
      status: 'pending'
    });
    
    console.log('Whitelist entry submitted with ID:', docRef.id);
    
    return {
      id: docRef.id,
      email: data.email,
      walletAddress: data.walletAddress,
      name: data.name,
      telegram: data.telegram,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
  } catch (error) {
    console.error('Error submitting whitelist entry:', error);
    throw error;
  }
};

/**
 * Checks if a wallet address has a pending whitelist submission
 * 
 * @param {string} walletAddress - The wallet address to check
 * @returns {Promise<Object|null>} - The pending submission or null if none exists
 */
const getPendingSubmission = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Get reference to whitelist collection
    const whitelistRef = collection(db, COLLECTION_NAMES.WHITELIST);
    
    // Create a query to find submissions for this wallet address
    const walletQuery = query(whitelistRef, where('walletAddress', '==', walletAddress));
    const querySnapshot = await getDocs(walletQuery);
    
    // If no submission exists, return null
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first matching submission
    const submission = querySnapshot.docs[0].data();
    return {
      id: querySnapshot.docs[0].id,
      ...submission,
      submittedAt: submission.submittedAt ? submission.submittedAt.toDate().toISOString() : null
    };
  } catch (error) {
    console.error('Error checking pending submission:', error);
    throw error;
  }
};

export default submitWhitelistEntry;
export { getPendingSubmission };
