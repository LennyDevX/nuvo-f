import { ethers } from 'ethers';
import ABI from '../src/Abi/SmartStaking.json' assert { type: 'json' };

// Configuración
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon.drpc.org';

async function testContractDeposit() {
  try {
    console.log('🔍 Testing SmartStaking deposit function...');
    
    // Crear proveedor
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Crear instancia del contrato
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
    
    console.log('📋 Contract Address:', CONTRACT_ADDRESS);
    
    // Verificar que el contrato existe
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      console.error('❌ Contract not found at address');
      return;
    }
    console.log('✅ Contract exists');
    
    // Obtener información básica del contrato
    try {
      const version = await contract.getContractVersion();
      console.log('📦 Contract Version:', version.toString());
    } catch (error) {
      console.log('⚠️ Could not get contract version:', error.message);
    }
    
    // Verificar si el contrato está pausado
    try {
      const isPaused = await contract.paused();
      console.log('⏸️ Contract Paused:', isPaused);
      if (isPaused) {
        console.log('❌ Contract is paused - deposits are not allowed');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check paused status:', error.message);
    }
    
    // Verificar si el contrato está migrado
    try {
      const isMigrated = await contract.migrated();
      console.log('🔄 Contract Migrated:', isMigrated);
      if (isMigrated) {
        console.log('❌ Contract is migrated - deposits are not allowed');
        const newAddress = await contract.newContractAddress();
        console.log('🆕 New Contract Address:', newAddress);
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check migration status:', error.message);
    }
    
    // Obtener balance del contrato
    try {
      const balance = await contract.getContractBalance();
      console.log('💰 Contract Balance:', ethers.formatEther(balance), 'POL');
    } catch (error) {
      console.log('⚠️ Could not get contract balance:', error.message);
    }
    
    // Verificar constantes del contrato si existen
    console.log('\n📊 Checking Contract Constants:');
    
    // Intentar obtener MIN_DEPOSIT
    try {
      const minDeposit = await contract.MIN_DEPOSIT();
      console.log('📉 MIN_DEPOSIT:', ethers.formatEther(minDeposit), 'POL');
    } catch (error) {
      console.log('⚠️ MIN_DEPOSIT not available or error:', error.message);
    }
    
    // Intentar obtener MAX_DEPOSIT
    try {
      const maxDeposit = await contract.MAX_DEPOSIT();
      console.log('📈 MAX_DEPOSIT:', ethers.formatEther(maxDeposit), 'POL');
    } catch (error) {
      console.log('⚠️ MAX_DEPOSIT not available or error:', error.message);
    }
    
    // Intentar obtener MAX_DEPOSITS_PER_USER
    try {
      const maxDepositsPerUser = await contract.MAX_DEPOSITS_PER_USER();
      console.log('🔢 MAX_DEPOSITS_PER_USER:', maxDepositsPerUser.toString());
    } catch (error) {
      console.log('⚠️ MAX_DEPOSITS_PER_USER not available or error:', error.message);
    }
    
    // Probar con diferentes montos de depósito
    const testAmounts = [
      { amount: '1', description: '1 POL (below minimum)' },
      { amount: '5', description: '5 POL (minimum)' },
      { amount: '100', description: '100 POL (normal)' },
      { amount: '10000', description: '10000 POL (maximum)' },
      { amount: '10001', description: '10001 POL (above maximum)' }
    ];
    
    console.log('\n🧪 Testing different deposit amounts...');
    
    for (const test of testAmounts) {
      try {
        console.log(`\n🔍 Testing ${test.description}:`);
        const testAmount = ethers.parseEther(test.amount);
        
        // Intentar estimar gas
        const estimatedGas = await contract.deposit.estimateGas({
          value: testAmount
        });
        
        console.log(`✅ ${test.description} - Gas estimation successful:`, estimatedGas.toString());
        
      } catch (gasError) {
        console.log(`❌ ${test.description} - Gas estimation failed:`);
        
        // Analizar el error específico
        const errorMessage = gasError.message;
        
        if (errorMessage.includes('DepositTooLow')) {
          console.log('   💡 Error: Deposit amount is below minimum');
        } else if (errorMessage.includes('DepositTooHigh')) {
          console.log('   💡 Error: Deposit amount is above maximum');
        } else if (errorMessage.includes('MaxDepositsReached')) {
          console.log('   💡 Error: Maximum number of deposits reached');
        } else if (errorMessage.includes('ContractIsMigrated')) {
          console.log('   💡 Error: Contract has been migrated');
        } else if (errorMessage.includes('execution reverted')) {
          console.log('   💡 Error: Transaction would revert');
          console.log('   🔍 Full error:', errorMessage);
        } else {
          console.log('   🔍 Unknown error:', errorMessage);
        }
      }
    }
    
    // Probar con una dirección específica para ver si hay límites por usuario
    try {
      console.log('\n👤 Testing user-specific limits...');
      const testAddress = '0x0000000000000000000000000000000000000001';
      
      const userInfo = await contract.getUserInfo(testAddress);
      console.log('📊 Test User Info:', {
        totalDeposited: ethers.formatEther(userInfo.totalDeposited),
        pendingRewards: ethers.formatEther(userInfo.pendingRewards),
        lastWithdraw: userInfo.lastWithdraw.toString()
      });
      
      const userDeposits = await contract.getUserDeposits(testAddress);
      console.log('📦 Test User Deposits Count:', userDeposits.length);
      
    } catch (error) {
      console.log('⚠️ Could not get test user info:', error.message);
    }
    
    console.log('\n✅ Deposit function test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Ejecutar test
testContractDeposit();