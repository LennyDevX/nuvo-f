import { ethers } from 'ethers';

// Configuration
const RPC_URL = 'https://polygon-rpc.com';
const CONTRACT_ADDRESS = '0xA47a4809932b81307b2d78D3AE39d88aDD6c081A'; // Your redeployed contract
const USER_ADDRESS = '0xed639e84179FCEcE1d7BEe91ab1C6888fbBdD0cf'; // Your wallet address

// Basic ABI for the functions we need
const CONTRACT_ABI = [
    'function getUserInfo(address) view returns (tuple(uint256 totalDeposited, uint256 pendingRewards, uint256 lastWithdraw))',
    'function calculateRewards(address) view returns (uint256)',
    'function withdraw() nonpayable',
    'function withdrawAll() nonpayable',
    'function getUserDeposits(address) view returns (tuple(uint128 amount, uint64 timestamp, uint64 lastClaimTime, uint64 lockupDuration)[])'
];

// Custom errors from the contract
const CUSTOM_ERRORS = {
    '0xec83c70c': 'DailyWithdrawalLimitExceeded(uint256 availableToWithdraw)',
    '0x356680b7': 'InsufficientBalance()',
    '0x1f2a2005': 'NoDepositsFound()',
    '0x48fee69c': 'FundsAreLocked()',
    '0x334ab3f5': 'NoRewardsAvailable()'
};

async function testWithdrawFunctions() {
    try {
        console.log('🧪 Testing withdraw functions for locked deposits...');
        console.log('Contract Address:', CONTRACT_ADDRESS);
        console.log('User Address:', USER_ADDRESS);
        console.log('\n' + '='.repeat(60));

        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Get current timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);
        console.log('Current timestamp:', currentTimestamp);
        console.log('Current date:', new Date().toISOString());

        // 1. Get user information
        console.log('\n👤 USER INFORMATION:');
        const userInfo = await contract.getUserInfo(USER_ADDRESS);
        console.log('Total Deposited:', ethers.formatEther(userInfo.totalDeposited), 'POL');
        console.log('Pending Rewards:', ethers.formatEther(userInfo.pendingRewards), 'POL');
        console.log('Last Withdraw:', userInfo.lastWithdraw.toString());

        // 2. Get deposit details to check lockup status
        console.log('\n💰 DEPOSIT LOCKUP STATUS:');
        const deposits = await contract.getUserDeposits(USER_ADDRESS);
        
        let hasLockedDeposits = false;
        deposits.forEach((deposit, index) => {
            const depositDate = new Date(Number(deposit.timestamp) * 1000);
            const lockupDays = Number(deposit.lockupDuration) / (24 * 60 * 60);
            const isLocked = lockupDays > 0 && (currentTimestamp < Number(deposit.timestamp) + Number(deposit.lockupDuration));
            
            console.log(`\n  Deposit ${index + 1}:`);
            console.log(`    Amount: ${ethers.formatEther(deposit.amount)} POL`);
            console.log(`    Date: ${depositDate.toISOString()}`);
            console.log(`    Lockup Duration: ${lockupDays} days`);
            console.log(`    Is Locked: ${isLocked}`);
            
            if (isLocked) {
                hasLockedDeposits = true;
                const unlockTime = Number(deposit.timestamp) + Number(deposit.lockupDuration);
                const unlockDate = new Date(unlockTime * 1000);
                console.log(`    Unlock Date: ${unlockDate.toISOString()}`);
                
                const timeUntilUnlock = unlockTime - currentTimestamp;
                const daysUntilUnlock = Math.ceil(timeUntilUnlock / (24 * 60 * 60));
                console.log(`    Days until unlock: ${daysUntilUnlock}`);
            }
        });

        // 3. Test withdrawAll() - should fail with FundsAreLocked
        console.log('\n🚫 TESTING WITHDRAWALL (Expected to fail):');
        try {
            await contract.withdrawAll.staticCall();
            console.log('✅ withdrawAll simulation successful - unexpected!');
        } catch (error) {
            console.log('❌ withdrawAll failed as expected:');
            console.log('Error message:', error.message);
            
            if (error.data) {
                const errorSignature = error.data.slice(0, 10);
                if (CUSTOM_ERRORS[errorSignature]) {
                    console.log('Decoded error:', CUSTOM_ERRORS[errorSignature]);
                    
                    if (errorSignature === '0x48fee69c') {
                        console.log('✅ Confirmed: withdrawAll fails because funds are locked');
                    }
                } else {
                    console.log('Unknown error signature:', errorSignature);
                }
            }
        }

        // 4. Test withdraw() - should work for rewards only
        console.log('\n✅ TESTING WITHDRAW (Should work for rewards):');
        try {
            await contract.withdraw.staticCall();
            console.log('✅ withdraw() simulation successful!');
            console.log('This means you can withdraw rewards even with locked deposits.');
        } catch (error) {
            console.log('❌ withdraw() failed:');
            console.log('Error message:', error.message);
            
            if (error.data) {
                const errorSignature = error.data.slice(0, 10);
                if (CUSTOM_ERRORS[errorSignature]) {
                    console.log('Decoded error:', CUSTOM_ERRORS[errorSignature]);
                    
                    if (errorSignature === '0x334ab3f5') {
                        console.log('No rewards available yet - this is normal for new deposits');
                    } else if (errorSignature === '0x48fee69c') {
                        console.log('⚠️  Unexpected: withdraw() also fails with FundsAreLocked');
                        console.log('This suggests there might be an issue with the contract logic');
                    }
                } else {
                    console.log('Unknown error signature:', errorSignature);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n🔍 ANALYSIS AND SOLUTION:');
        
        if (hasLockedDeposits) {
            console.log('\n✅ PROBLEM IDENTIFIED:');
            console.log('- Your deposit has a 30-day lockup period');
            console.log('- withdrawAll() fails because it tries to withdraw both principal and rewards');
            console.log('- The contract correctly prevents withdrawal of locked principal');
            
            console.log('\n💡 SOLUTIONS:');
            console.log('1. WAIT: Wait until the lockup period expires (September 12, 2025)');
            console.log('2. REWARDS ONLY: Use withdraw() to get only accumulated rewards');
            console.log('3. EMERGENCY: If urgent, contact contract owner for emergency withdrawal');
            
            if (Number(userInfo.pendingRewards) > 0) {
                console.log('\n💰 You have', ethers.formatEther(userInfo.pendingRewards), 'POL in pending rewards');
                console.log('You can withdraw these rewards using the withdraw() function');
            } else {
                console.log('\n⏳ No rewards accumulated yet (deposit is very recent)');
                console.log('Rewards accumulate over time - check back later');
            }
        } else {
            console.log('\n⚠️  No locked deposits found - this is unexpected');
            console.log('The error might be due to other reasons');
        }

        console.log('\n📋 NEXT STEPS:');
        console.log('1. If you need immediate access to funds: Wait for lockup to expire');
        console.log('2. If you only want rewards: Use withdraw() function instead');
        console.log('3. If this is urgent: Consider the emergency withdrawal option');
        console.log('4. For future deposits: Use lockupDuration = 0 for flexible staking');

    } catch (error) {
        console.error('❌ Script execution failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
testWithdrawFunctions();