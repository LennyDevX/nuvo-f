import { ethers } from 'ethers';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
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

// Token configuration
const TOKEN_CONTRACTS = {
  polygon: {
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    nativeToken: 'MATIC'
  },
  mumbai: {
    rpc: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    nativeToken: 'MATIC'
  }
};

// ERC20 ABI for token transfers
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

class TokenDistributor {
  constructor(network = 'polygon') {
    this.network = network;
    this.config = TOKEN_CONTRACTS[network];
    this.provider = new ethers.JsonRpcProvider(this.config.rpc);
    this.wallet = null;
    this.tokenContract = null;
  }

  async initialize(privateKey, tokenAddress) {
    try {
      // Initialize wallet
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      console.log(`✅ Wallet initialized: ${this.wallet.address}`);

      // Initialize token contract
      this.tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
      
      // Get token info
      const symbol = await this.tokenContract.symbol();
      const decimals = await this.tokenContract.decimals();
      const balance = await this.tokenContract.balanceOf(this.wallet.address);
      
      console.log(`✅ Token contract initialized:`);
      console.log(`   Symbol: ${symbol}`);
      console.log(`   Decimals: ${decimals}`);
      console.log(`   Your balance: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
      
      return { symbol, decimals, balance };
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      throw error;
    }
  }

  async getPendingRegistrations(airdropType = 'tokens') {
    try {
      console.log(`📋 Fetching pending registrations for ${airdropType}...`);
      
      const airdropsRef = collection(db, 'airdrops');
      const pendingQuery = query(
        airdropsRef,
        where('airdropType', '==', airdropType),
        where('tokensDistributed', '==', false),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(pendingQuery);
      const registrations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Found ${registrations.length} pending registrations`);
      return registrations;
    } catch (error) {
      console.error('❌ Error fetching registrations:', error);
      throw error;
    }
  }

  async distributeBatch(recipients, amountPerUser, batchSize = 50) {
    if (!this.wallet || !this.tokenContract) {
      throw new Error('Distributor not initialized');
    }

    const results = {
      successful: [],
      failed: [],
      totalGasUsed: ethers.getBigInt(0)
    };

    console.log(`🚀 Starting batch distribution to ${recipients.length} recipients`);
    console.log(`💰 Amount per user: ${amountPerUser} tokens`);
    
    // Process in batches to avoid overwhelming the network
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(recipients.length/batchSize)} (${batch.length} recipients)`);
      
      await this.processBatch(batch, amountPerUser, results);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < recipients.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  }

  async processBatch(batch, amountPerUser, results) {
    const decimals = await this.tokenContract.decimals();
    const amount = ethers.parseUnits(amountPerUser.toString(), decimals);

    for (const recipient of batch) {
      try {
        console.log(`💸 Sending ${amountPerUser} tokens to ${recipient.wallet}...`);
        
        // Send transaction
        const tx = await this.tokenContract.transfer(recipient.wallet, amount);
        console.log(`   📝 Transaction hash: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
        
        // Update database
        await this.updateRegistrationStatus(recipient.id, {
          tokensDistributed: true,
          distributionHash: tx.hash,
          distributedAt: new Date(),
          status: 'completed'
        });

        results.successful.push({
          ...recipient,
          transactionHash: tx.hash,
          gasUsed: receipt.gasUsed
        });
        
        results.totalGasUsed += receipt.gasUsed;
        
      } catch (error) {
        console.error(`   ❌ Failed to send to ${recipient.wallet}:`, error.message);
        
        results.failed.push({
          ...recipient,
          error: error.message
        });
      }
    }
  }

  async updateRegistrationStatus(registrationId, updateData) {
    try {
      const docRef = doc(db, 'airdrops', registrationId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('❌ Failed to update registration status:', error);
    }
  }

  generateReport(results, amountPerUser) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      summary: {
        totalRecipients: results.successful.length + results.failed.length,
        successful: results.successful.length,
        failed: results.failed.length,
        amountPerUser,
        totalDistributed: results.successful.length * amountPerUser,
        totalGasUsed: results.totalGasUsed.toString()
      },
      successful: results.successful,
      failed: results.failed
    };

    // Save report to file
    const fs = require('fs');
    const filename = `distribution-report-${timestamp.split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 DISTRIBUTION REPORT`);
    console.log(`====================================`);
    console.log(`✅ Successful: ${report.summary.successful}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`💰 Total distributed: ${report.summary.totalDistributed} tokens`);
    console.log(`⛽ Total gas used: ${ethers.formatEther(results.totalGasUsed)} ${this.config.nativeToken}`);
    console.log(`📋 Report saved to: ${filename}`);

    return report;
  }
}

// Main execution function
async function main() {
  try {
    // Configuration
    const PRIVATE_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY;
    const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || process.env.VITE_NUVOS_TOKEN_ADDRESS;
    const AMOUNT_PER_USER = parseFloat(process.env.AIRDROP_AMOUNT_PER_USER || '10');
    const NETWORK = process.env.NETWORK || 'polygon';
    const AIRDROP_TYPE = process.env.AIRDROP_TYPE || 'tokens';

    // Validate environment variables
    if (!PRIVATE_KEY) {
      throw new Error('DISTRIBUTOR_PRIVATE_KEY environment variable is required');
    }
    if (!TOKEN_ADDRESS) {
      throw new Error('TOKEN_CONTRACT_ADDRESS environment variable is required');
    }

    console.log(`🚀 Starting token distribution...`);
    console.log(`🌐 Network: ${NETWORK}`);
    console.log(`🎯 Airdrop type: ${AIRDROP_TYPE}`);
    console.log(`💰 Amount per user: ${AMOUNT_PER_USER} tokens`);

    // Initialize distributor
    const distributor = new TokenDistributor(NETWORK);
    await distributor.initialize(PRIVATE_KEY, TOKEN_ADDRESS);

    // Get pending registrations
    const recipients = await distributor.getPendingRegistrations(AIRDROP_TYPE);
    
    if (recipients.length === 0) {
      console.log('✅ No pending registrations found. All done!');
      return;
    }

    // Confirm before proceeding
    console.log(`\n⚠️  You are about to distribute ${AMOUNT_PER_USER} tokens to ${recipients.length} recipients.`);
    console.log(`💰 Total tokens needed: ${recipients.length * AMOUNT_PER_USER}`);
    
    // In a real script, you might want to add readline for confirmation
    // For now, we'll add a 5-second delay
    console.log('🕐 Starting in 5 seconds... (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start distribution
    const results = await distributor.distributeBatch(recipients, AMOUNT_PER_USER);
    
    // Generate and save report
    const report = distributor.generateReport(results, AMOUNT_PER_USER);

    console.log('\n🎉 Distribution completed!');

  } catch (error) {
    console.error('💥 Distribution failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { TokenDistributor };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
