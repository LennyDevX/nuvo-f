import { ethers } from 'ethers';
import ABI from '../src/Abi/SmartStaking.json' assert { type: 'json' };

// Configuración
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon.drpc.org';

async function testDepositWithWallet() {
  try {
    console.log('🔍 Testing SmartStaking deposit with wallet simulation...');
    
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
    
    // Verificar estado básico del contrato
    try {
      const version = await contract.getContractVersion();
      console.log('📦 Contract Version:', version.toString());
      
      const isPaused = await contract.paused();
      console.log('⏸️ Contract Paused:', isPaused);
      
      const isMigrated = await contract.migrated();
      console.log('🔄 Contract Migrated:', isMigrated);
      
      if (isPaused) {
        console.log('❌ PROBLEM FOUND: Contract is paused!');
        return;
      }
      
      if (isMigrated) {
        console.log('❌ PROBLEM FOUND: Contract is migrated!');
        const newAddress = await contract.newContractAddress();
        console.log('🆕 New Contract Address:', newAddress);
        return;
      }
      
    } catch (error) {
      console.log('⚠️ Error checking contract state:', error.message);
    }
    
    // Simular una dirección de wallet real para las pruebas
    const testWalletAddress = ethers.getAddress('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b9'); // Dirección de ejemplo con checksum correcto
    
    console.log('\n👤 Testing with simulated wallet:', testWalletAddress);
    
    // Verificar información del usuario
    try {
      const userInfo = await contract.getUserInfo(testWalletAddress);
      console.log('📊 User Info:', {
        totalDeposited: ethers.formatEther(userInfo.totalDeposited),
        pendingRewards: ethers.formatEther(userInfo.pendingRewards),
        lastWithdraw: userInfo.lastWithdraw.toString()
      });
      
      const userDeposits = await contract.getUserDeposits(testWalletAddress);
      console.log('📦 User Deposits Count:', userDeposits.length);
      
      // Si el usuario ya tiene 300 depósitos, ese podría ser el problema
      if (userDeposits.length >= 300) {
        console.log('❌ PROBLEM FOUND: User has reached maximum deposits (300)!');
        return;
      }
      
    } catch (error) {
      console.log('⚠️ Could not get user info:', error.message);
    }
    
    // Probar con diferentes enfoques de estimación de gas
    console.log('\n🧪 Testing gas estimation approaches...');
    
    const testAmount = ethers.parseEther('5'); // 5 POL
    
    // Método 1: Estimación directa
    try {
      console.log('\n🔍 Method 1: Direct gas estimation');
      const estimatedGas = await contract.deposit.estimateGas({
        value: testAmount
      });
      console.log('✅ Success! Estimated Gas:', estimatedGas.toString());
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
    
    // Método 2: Estimación con from address
    try {
      console.log('\n🔍 Method 2: Gas estimation with from address');
      const estimatedGas = await contract.deposit.estimateGas({
        value: testAmount,
        from: testWalletAddress
      });
      console.log('✅ Success! Estimated Gas:', estimatedGas.toString());
    } catch (error) {
      console.log('❌ Failed:', error.message);
    }
    
    // Método 3: Usar provider.estimateGas directamente
    try {
      console.log('\n🔍 Method 3: Provider estimateGas');
      const txData = contract.interface.encodeFunctionData('deposit', []);
      const estimatedGas = await provider.estimateGas({
        to: CONTRACT_ADDRESS,
        data: txData,
        value: testAmount,
        from: testWalletAddress
      });
      console.log('✅ Success! Estimated Gas:', estimatedGas.toString());
    } catch (error) {
      console.log('❌ Failed:', error.message);
      
      // Intentar decodificar el error si es posible
      if (error.data) {
        try {
          const decodedError = contract.interface.parseError(error.data);
          console.log('🔍 Decoded error:', decodedError);
        } catch (decodeError) {
          console.log('🔍 Could not decode error data:', error.data);
        }
      }
    }
    
    // Método 4: Simular la transacción con call
    try {
      console.log('\n🔍 Method 4: Simulate transaction with call');
      const txData = contract.interface.encodeFunctionData('deposit', []);
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        data: txData,
        value: testAmount,
        from: testWalletAddress
      });
      console.log('✅ Call successful! Result:', result);
    } catch (error) {
      console.log('❌ Call failed:', error.message);
      
      // Este es el método más útil para obtener errores específicos
      if (error.data) {
        console.log('🔍 Error data:', error.data);
        
        // Intentar decodificar errores personalizados
        try {
          // Buscar errores conocidos en el ABI
          const errorSignatures = {
            '0x8f4a234f': 'DepositTooLow(uint256,uint256)',
            '0x3fa8df73': 'DepositTooHigh(uint256,uint256)',
            '0x8d6ea8d3': 'MaxDepositsReached(address,uint16)',
            '0x7e273289': 'ContractIsMigrated()',
            '0xf4d678b8': 'InsufficientBalance()'
          };
          
          const errorSelector = error.data.slice(0, 10);
          if (errorSignatures[errorSelector]) {
            console.log('🎯 Identified error:', errorSignatures[errorSelector]);
          }
        } catch (decodeError) {
          console.log('🔍 Could not decode custom error');
        }
      }
    }
    
    // Verificar balance del contrato como posible causa
    try {
      const contractBalance = await contract.getContractBalance();
      console.log('\n💰 Contract Balance:', ethers.formatEther(contractBalance), 'POL');
      
      if (contractBalance === 0n) {
        console.log('⚠️ WARNING: Contract has 0 balance');
        console.log('💡 This might be the issue if the contract requires balance for deposits');
      }
    } catch (error) {
      console.log('⚠️ Could not get contract balance:', error.message);
    }
    
    console.log('\n✅ Wallet simulation test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Ejecutar test
testDepositWithWallet();