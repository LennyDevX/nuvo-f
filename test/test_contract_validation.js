import { ethers } from 'ethers';
import ABI from '../src/Abi/SmartStaking.json' assert { type: 'json' };

// Configuración
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon.drpc.org';

async function testContractValidations() {
  try {
    console.log('🔍 Testing SmartStaking contract validations...');
    
    // Crear proveedor
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Crear instancia del contrato
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
    
    console.log('📋 Contract Address:', CONTRACT_ADDRESS);
    
    // Verificar constantes del contrato
    try {
      const minDeposit = await contract.MIN_DEPOSIT();
      const maxDeposit = await contract.MAX_DEPOSIT();
      const maxDepositsPerUser = await contract.MAX_DEPOSITS_PER_USER();
      
      console.log('\n📊 Contract Constants:');
      console.log('💰 MIN_DEPOSIT:', ethers.formatEther(minDeposit), 'POL');
      console.log('💰 MAX_DEPOSIT:', ethers.formatEther(maxDeposit), 'POL');
      console.log('📦 MAX_DEPOSITS_PER_USER:', maxDepositsPerUser.toString());
      
      // Probar diferentes montos para identificar el problema
      const testAmounts = [
        ethers.parseEther('0.1'),   // Menor al mínimo
        minDeposit,                 // Exactamente el mínimo
        ethers.parseEther('5'),     // Monto normal
        maxDeposit,                 // Exactamente el máximo
        maxDeposit + 1n             // Mayor al máximo
      ];
      
      console.log('\n🧪 Testing different deposit amounts...');
      
      for (let i = 0; i < testAmounts.length; i++) {
        const amount = testAmounts[i];
        const amountEth = ethers.formatEther(amount);
        
        console.log(`\n💸 Testing amount: ${amountEth} POL`);
        
        try {
          // Usar staticCall para simular sin necesidad de fondos
          const txData = contract.interface.encodeFunctionData('deposit', []);
          
          // Intentar con staticCall primero
          try {
            const result = await provider.call({
              to: CONTRACT_ADDRESS,
              data: txData,
              value: amount
            });
            console.log('✅ staticCall successful for', amountEth, 'POL');
          } catch (staticError) {
            console.log('❌ staticCall failed:', staticError.message);
            
            // Analizar el error más detalladamente
            if (staticError.data) {
              console.log('🔍 Error data:', staticError.data);
              
              // Decodificar errores personalizados conocidos
              const errorMappings = {
                '0x8f4a234f': 'DepositTooLow',
                '0x3fa8df73': 'DepositTooHigh', 
                '0x8d6ea8d3': 'MaxDepositsReached',
                '0x7e273289': 'ContractIsMigrated',
                '0xf4d678b8': 'InsufficientBalance',
                '0x5274afe7': 'EnforcedPause'
              };
              
              const errorSelector = staticError.data.slice(0, 10);
              if (errorMappings[errorSelector]) {
                console.log('🎯 Identified error:', errorMappings[errorSelector]);
                
                // Si es DepositTooLow o DepositTooHigh, decodificar parámetros
                if (errorSelector === '0x8f4a234f' || errorSelector === '0x3fa8df73') {
                  try {
                    const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                      ['uint256', 'uint256'], 
                      '0x' + staticError.data.slice(10)
                    );
                    console.log('📊 Error params:', {
                      provided: ethers.formatEther(decoded[0]),
                      required: ethers.formatEther(decoded[1])
                    });
                  } catch (e) {
                    console.log('⚠️ Could not decode error parameters');
                  }
                }
              } else {
                console.log('❓ Unknown error selector:', errorSelector);
              }
            }
          }
          
        } catch (error) {
          console.log('❌ Test failed for', amountEth, 'POL:', error.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Could not read contract constants:', error.message);
    }
    
    // Verificar estado del contrato
    console.log('\n🔍 Checking contract state...');
    
    try {
      const isPaused = await contract.paused();
      console.log('⏸️ Contract Paused:', isPaused);
      
      if (isPaused) {
        console.log('🚨 ISSUE FOUND: Contract is paused! This prevents deposits.');
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check pause state:', error.message);
    }
    
    try {
      const isMigrated = await contract.migrated();
      console.log('🔄 Contract Migrated:', isMigrated);
      
      if (isMigrated) {
        console.log('🚨 ISSUE FOUND: Contract is migrated! This prevents deposits.');
        const newAddress = await contract.newContractAddress();
        console.log('🆕 New Contract Address:', newAddress);
        return;
      }
    } catch (error) {
      console.log('⚠️ Could not check migration state:', error.message);
    }
    
    // Verificar balance del contrato
    try {
      const contractBalance = await contract.getContractBalance();
      console.log('💰 Contract Balance:', ethers.formatEther(contractBalance), 'POL');
      
      if (contractBalance === 0n) {
        console.log('⚠️ Contract has 0 balance - this might affect reward calculations');
      }
    } catch (error) {
      console.log('⚠️ Could not get contract balance:', error.message);
    }
    
    console.log('\n✅ Contract validation test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Ejecutar test
testContractValidations();