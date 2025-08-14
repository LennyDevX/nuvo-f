import { ethers } from 'ethers';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

// Airdrop Configuration
const AIRDROP_CONFIG = {
  AMOUNT_PER_USER: process.env.AIRDROP_AMOUNT_PER_USER || '10', // 10 POL tokens
  CONTRACT_ADDRESS: process.env.VITE_AIRDROP_ADDRESS,
  RPC_URL: process.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com',
  PRIVATE_KEY: process.env.AIRDROP_PRIVATE_KEY,
  BATCH_SIZE: 50, // Process in batches to avoid gas limit
  GAS_LIMIT: 300000, // Gas limit per transaction
  MAX_FEE_PER_GAS: ethers.parseUnits('50', 'gwei'),
  MAX_PRIORITY_FEE_PER_GAS: ethers.parseUnits('2', 'gwei')
};

// Airdrop ABI - simplified version for distribution
const AIRDROP_ABI = [
  "function fundAirdrop() external payable",
  "function distributeBatch(address[] calldata recipients, uint256[] calldata amounts) external",
  "function getBalance() external view returns (uint256)",
  "function isActive() external view returns (bool)",
  "function owner() external view returns (address)",
  "function setActive(bool _active) external",
  "function withdraw(uint256 amount) external"
];

class AirdropDistributor {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(AIRDROP_CONFIG.RPC_URL);
    this.wallet = new ethers.Wallet(AIRDROP_CONFIG.PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      AIRDROP_CONFIG.CONTRACT_ADDRESS,
      AIRDROP_ABI,
      this.wallet
    );
    this.totalDistributed = 0;
    this.successCount = 0;
    this.failedWallets = [];
  }

  async initialize() {
    console.log('🚀 Initializing Airdrop Distribution System...');
    
    // Verify contract deployment
    try {
      const owner = await this.contract.owner();
      console.log(`✅ Contract deployed at: ${AIRDROP_CONFIG.CONTRACT_ADDRESS}`);
      console.log(`📋 Contract owner: ${owner}`);
      console.log(`💰 Distributor wallet: ${this.wallet.address}`);
    } catch (error) {
      throw new Error(`❌ Contract not deployed or invalid address: ${error.message}`);
    }

    // Check wallet balance
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`💳 Wallet balance: ${ethers.formatEther(balance)} POL`);
    
    if (ethers.formatEther(balance) < '1') {
      throw new Error('❌ Insufficient POL balance for gas fees');
    }

    // Check contract balance
    const contractBalance = await this.contract.getBalance();
    console.log(`🏦 Contract balance: ${ethers.formatEther(contractBalance)} POL`);

    return true;
  }

  async getRegisteredUsers() {
    console.log('📊 Fetching registered users from Firebase...');
    
    try {
      const airdropsRef = collection(db, 'airdrops');
      const q = query(airdropsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.wallet && ethers.isAddress(data.wallet)) {
          users.push({
            id: doc.id,
            wallet: data.wallet,
            name: data.name,
            email: data.email,
            submittedAt: data.submittedAt
          });
        }
      });

      console.log(`✅ Found ${users.length} eligible users for distribution`);
      return users;
    } catch (error) {
      throw new Error(`❌ Failed to fetch users: ${error.message}`);
    }
  }

  async fundContract(amount) {
    console.log(`💰 Funding contract with ${amount} POL...`);
    
    try {
      const tx = await this.contract.fundAirdrop({
        value: ethers.parseEther(amount),
        gasLimit: AIRDROP_CONFIG.GAS_LIMIT,
        maxFeePerGas: AIRDROP_CONFIG.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: AIRDROP_CONFIG.MAX_PRIORITY_FEE_PER_GAS
      });

      console.log(`📝 Funding transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Contract funded successfully! Gas used: ${receipt.gasUsed}`);
      
      return receipt;
    } catch (error) {
      throw new Error(`❌ Failed to fund contract: ${error.message}`);
    }
  }

  async activateAirdrop() {
    console.log('🔄 Activating airdrop...');
    
    try {
      const tx = await this.contract.setActive(true, {
        gasLimit: AIRDROP_CONFIG.GAS_LIMIT,
        maxFeePerGas: AIRDROP_CONFIG.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: AIRDROP_CONFIG.MAX_PRIORITY_FEE_PER_GAS
      });

      await tx.wait();
      console.log('✅ Airdrop activated successfully!');
    } catch (error) {
      throw new Error(`❌ Failed to activate airdrop: ${error.message}`);
    }
  }

  async distributeBatch(users) {
    const recipients = users.map(user => user.wallet);
    const amounts = users.map(() => ethers.parseEther(AIRDROP_CONFIG.AMOUNT_PER_USER));

    console.log(`📤 Distributing to ${recipients.length} recipients...`);
    
    try {
      const tx = await this.contract.distributeBatch(recipients, amounts, {
        gasLimit: AIRDROP_CONFIG.GAS_LIMIT * recipients.length,
        maxFeePerGas: AIRDROP_CONFIG.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: AIRDROP_CONFIG.MAX_PRIORITY_FEE_PER_GAS
      });

      console.log(`📝 Distribution transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Batch distributed! Gas used: ${receipt.gasUsed}`);

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed,
        recipients: users
      };
    } catch (error) {
      console.error(`❌ Batch distribution failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        recipients: users
      };
    }
  }

  async updateUserStatus(userId, status, distributionHash = null) {
    try {
      const userRef = doc(db, 'airdrops', userId);
      const updateData = {
        status,
        distributedAt: new Date().toISOString(),
        tokensDistributed: status === 'distributed'
      };

      if (distributionHash) {
        updateData.distributionHash = distributionHash;
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error(`❌ Failed to update user ${userId}: ${error.message}`);
    }
  }

  async processDistribution(dryRun = false) {
    console.log(`\n🎯 ${dryRun ? 'DRY RUN' : 'LIVE'} Distribution Process Starting...`);
    
    if (dryRun) {
      console.log('⚠️  This is a dry run - no actual tokens will be distributed');
    }

    // Get eligible users
    const users = await this.getRegisteredUsers();
    
    if (users.length === 0) {
      console.log('ℹ️  No eligible users found for distribution');
      return;
    }

    // Calculate required funding
    const totalRequired = (users.length * parseFloat(AIRDROP_CONFIG.AMOUNT_PER_USER)).toFixed(2);
    console.log(`💰 Total POL tokens required: ${totalRequired}`);

    if (dryRun) {
      console.log('\n📊 DRY RUN SUMMARY:');
      console.log(`👥 Total eligible users: ${users.length}`);
      console.log(`💰 Total tokens to distribute: ${totalRequired} POL`);
      console.log(`📦 Number of batches: ${Math.ceil(users.length / AIRDROP_CONFIG.BATCH_SIZE)}`);
      console.log(`⛽ Estimated gas cost: ~${(users.length * 0.002).toFixed(4)} POL`);
      return;
    }

    // Fund contract if needed
    const contractBalance = await this.contract.getBalance();
    const balanceInPOL = parseFloat(ethers.formatEther(contractBalance));
    
    if (balanceInPOL < parseFloat(totalRequired)) {
      const needToFund = (parseFloat(totalRequired) - balanceInPOL + 10).toFixed(2); // Add 10 POL buffer
      await this.fundContract(needToFund);
    }

    // Activate airdrop
    const isActive = await this.contract.isActive();
    if (!isActive) {
      await this.activateAirdrop();
    }

    // Process in batches
    const batches = [];
    for (let i = 0; i < users.length; i += AIRDROP_CONFIG.BATCH_SIZE) {
      batches.push(users.slice(i, i + AIRDROP_CONFIG.BATCH_SIZE));
    }

    console.log(`\n📦 Processing ${batches.length} batches...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} users)`);

      const result = await this.distributeBatch(batch);

      if (result.success) {
        this.successCount += batch.length;
        this.totalDistributed += batch.length * parseFloat(AIRDROP_CONFIG.AMOUNT_PER_USER);

        // Update user statuses
        for (const user of batch) {
          await this.updateUserStatus(user.id, 'distributed', result.transactionHash);
        }

        console.log(`✅ Batch ${i + 1} completed successfully`);
      } else {
        // Mark users as failed
        for (const user of batch) {
          await this.updateUserStatus(user.id, 'failed');
          this.failedWallets.push({ ...user, error: result.error });
        }

        console.log(`❌ Batch ${i + 1} failed: ${result.error}`);
      }

      // Wait between batches to avoid rate limiting
      if (i < batches.length - 1) {
        console.log('⏳ Waiting 10 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    this.generateReport();
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDistributed: this.totalDistributed,
        successfulDistributions: this.successCount,
        failedDistributions: this.failedWallets.length,
        tokensPerUser: AIRDROP_CONFIG.AMOUNT_PER_USER,
        contractAddress: AIRDROP_CONFIG.CONTRACT_ADDRESS
      },
      failures: this.failedWallets
    };

    const reportPath = path.join(process.cwd(), `airdrop-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 DISTRIBUTION SUMMARY:');
    console.log(`✅ Successful distributions: ${this.successCount}`);
    console.log(`❌ Failed distributions: ${this.failedWallets.length}`);
    console.log(`💰 Total tokens distributed: ${this.totalDistributed} POL`);
    console.log(`📄 Report saved to: ${reportPath}`);

    if (this.failedWallets.length > 0) {
      console.log('\n⚠️  Failed wallets:');
      this.failedWallets.forEach(wallet => {
        console.log(`   • ${wallet.wallet} (${wallet.name}) - ${wallet.error}`);
      });
    }
  }
}

// Main execution
async function main() {
  const isDryRun = process.env.AIRDROP_AMOUNT_PER_USER === '0' || process.argv.includes('--dry-run');
  
  try {
    const distributor = new AirdropDistributor();
    await distributor.initialize();
    await distributor.processDistribution(isDryRun);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AirdropDistributor;
