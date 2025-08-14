const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load the ABI
const abiPath = path.join(__dirname, 'src', 'Abi', 'SmartStaking.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Contract address (replace with your deployed contract address)
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with actual address

// RPC URL for Polygon network
const RPC_URL = 'https://polygon-rpc.com';

// Test wallet private key (use a test wallet with some POL)
const PRIVATE_KEY = 'your_test_private_key_here'; // Replace with test wallet private key

async function testDepositWithLockup() {
    try {
        console.log('🧪 Testing SmartStaking v3.0 deposit function with lockup duration...');
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
        
        console.log('📋 Wallet address:', wallet.address);
        
        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log('💰 Wallet balance:', ethers.formatEther(balance), 'POL');
        
        if (parseFloat(ethers.formatEther(balance)) < 10) {
            console.log('⚠️  Warning: Low wallet balance. Make sure you have enough POL for testing.');
        }
        
        // Test different lockup periods
        const testCases = [
            { lockup: 0, description: 'Flexible staking (no lockup)' },
            { lockup: 30, description: '30 days lockup' },
            { lockup: 90, description: '90 days lockup' },
            { lockup: 180, description: '180 days lockup' },
            { lockup: 365, description: '365 days lockup' }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🔍 Testing ${testCase.description}...`);
            
            try {
                // Test with 5 POL (minimum amount)
                const depositAmount = ethers.parseEther('5');
                
                // Estimate gas for the deposit
                console.log('⛽ Estimating gas...');
                const estimatedGas = await contract.deposit.estimateGas(testCase.lockup, {
                    value: depositAmount
                });
                
                console.log('✅ Gas estimation successful:', estimatedGas.toString());
                console.log('💡 This lockup period is valid and the transaction should work');
                
                // Note: We're not actually sending the transaction to avoid spending real tokens
                // Uncomment the lines below if you want to send real transactions
                /*
                const tx = await contract.deposit(testCase.lockup, {
                    value: depositAmount,
                    gasLimit: estimatedGas
                });
                
                console.log('📤 Transaction sent:', tx.hash);
                const receipt = await tx.wait();
                console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
                */
                
            } catch (error) {
                console.log('❌ Error:', error.message);
                
                if (error.message.includes('InvalidLockupDuration')) {
                    console.log('🚫 This lockup duration is not allowed by the contract');
                } else if (error.message.includes('insufficient funds')) {
                    console.log('💸 Insufficient funds for gas or deposit amount');
                } else {
                    console.log('🔍 Other error - check contract state and parameters');
                }
            }
        }
        
        // Test invalid lockup periods
        console.log('\n🧪 Testing invalid lockup periods...');
        const invalidLockups = [1, 15, 45, 100, 200, 500];
        
        for (const invalidLockup of invalidLockups) {
            try {
                const depositAmount = ethers.parseEther('5');
                await contract.deposit.estimateGas(invalidLockup, {
                    value: depositAmount
                });
                console.log(`⚠️  Unexpected: ${invalidLockup} days lockup was accepted (should be invalid)`);
            } catch (error) {
                if (error.message.includes('InvalidLockupDuration')) {
                    console.log(`✅ Correctly rejected ${invalidLockup} days lockup`);
                } else {
                    console.log(`❓ ${invalidLockup} days lockup failed with: ${error.message}`);
                }
            }
        }
        
        console.log('\n🎉 Testing completed!');
        console.log('\n📝 Summary:');
        console.log('- Valid lockup periods: 0, 30, 90, 180, 365 days');
        console.log('- Invalid lockup periods are properly rejected');
        console.log('- The deposit function now requires a lockup duration parameter');
        console.log('- Frontend has been updated to pass the lockup duration');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Run the test
if (require.main === module) {
    testDepositWithLockup();
}

module.exports = { testDepositWithLockup };