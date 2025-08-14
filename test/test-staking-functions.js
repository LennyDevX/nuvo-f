// Script para probar las funciones de compound y withdraw del contrato de staking
import { ethers } from 'ethers';

// Configuración del contrato
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon-rpc.com';

// ABI completo para las funciones que necesitamos
const STAKING_ABI = [
  'function calculateRewards(address userAddress) external view returns (uint256)',
  'function getUserInfo(address userAddress) external view returns (tuple(uint256 totalDeposited, uint256 pendingRewards, uint256 lastWithdraw))',
  'function compound() external',
  'function withdraw() external',
  'function paused() external view returns (bool)',
  'function getContractBalance() external view returns (uint256)',
  'function emergencyWithdraw() external',
  'function getUserDeposits(address userAddress) external view returns (tuple(uint128 amount, uint64 timestamp, uint64 lastClaimTime, uint64 lockupDuration)[])',
  'event RewardsCompounded(address indexed user, uint256 amount)',
  'event RewardsWithdrawn(address indexed user, uint256 amount)',
  'event EmergencyWithdraw(address indexed user, uint256 amount)'
];

async function testStakingFunctions(userAddress, privateKey) {
  try {
    console.log('🧪 Iniciando pruebas de funciones de staking...');
    console.log('📍 Contrato:', CONTRACT_ADDRESS);
    console.log('👤 Usuario:', userAddress);
    console.log('\n' + '='.repeat(60));

    // Conectar al proveedor y wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, STAKING_ABI, wallet);
    const contractReadOnly = new ethers.Contract(CONTRACT_ADDRESS, STAKING_ABI, provider);

    // Verificar estado inicial
    console.log('\n📊 Estado inicial...');
    const isPaused = await contractReadOnly.paused();
    const userInfo = await contractReadOnly.getUserInfo(userAddress);
    const calculatedRewards = await contractReadOnly.calculateRewards(userAddress);
    const contractBalance = await contractReadOnly.getContractBalance();
    
    console.log('   Contrato pausado:', isPaused ? '❌ SÍ' : '✅ NO');
    console.log('   Balance del contrato:', ethers.formatEther(contractBalance), 'POL');
    console.log('   Total depositado:', ethers.formatEther(userInfo.totalDeposited), 'POL');
    console.log('   Recompensas pendientes:', ethers.formatEther(calculatedRewards), 'POL');
    console.log('   Balance del wallet:', ethers.formatEther(await provider.getBalance(userAddress)), 'POL');

    if (isPaused) {
      console.log('\n❌ El contrato está pausado. No se pueden realizar transacciones.');
      return;
    }

    if (Number(calculatedRewards) === 0) {
      console.log('\n⚠️  No hay recompensas disponibles para probar.');
      return;
    }

    // Probar estimación de gas para compound
    console.log('\n🔧 Probando estimación de gas para compound...');
    try {
      const gasEstimate = await contract.compound.estimateGas();
      console.log('   Gas estimado para compound:', gasEstimate.toString());
      
      // Probar con buffer del 20%
      const gasWithBuffer = gasEstimate * 120n / 100n;
      console.log('   Gas con buffer (20%):', gasWithBuffer.toString());
      
      // Verificar precio del gas
      const feeData = await provider.getFeeData();
      console.log('   Gas price:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'gwei');
      console.log('   Max fee per gas:', ethers.formatUnits(feeData.maxFeePerGas, 'gwei'), 'gwei');
      
      const estimatedCost = gasWithBuffer * feeData.gasPrice;
      console.log('   Costo estimado:', ethers.formatEther(estimatedCost), 'POL');
      
    } catch (error) {
      console.log('   ❌ Error en estimación de gas para compound:', error.message);
      
      // Intentar con call estático para ver el error específico
      try {
        await contract.compound.staticCall();
        console.log('   ✅ Call estático exitoso - el problema puede ser de gas');
      } catch (staticError) {
        console.log('   ❌ Error en call estático:', staticError.message);
        
        // Analizar el error
        if (staticError.message.includes('revert')) {
          console.log('   💡 El contrato está revirtiendo la transacción');
          if (staticError.message.includes('No rewards')) {
            console.log('   🔍 Razón: No hay recompensas disponibles');
          } else if (staticError.message.includes('paused')) {
            console.log('   🔍 Razón: Contrato pausado');
          } else {
            console.log('   🔍 Razón desconocida en el revert');
          }
        }
      }
    }

    // Probar estimación de gas para withdraw
    console.log('\n🔧 Probando estimación de gas para withdraw...');
    try {
      const gasEstimate = await contract.withdraw.estimateGas();
      console.log('   Gas estimado para withdraw:', gasEstimate.toString());
      
      const gasWithBuffer = gasEstimate * 120n / 100n;
      console.log('   Gas con buffer (20%):', gasWithBuffer.toString());
      
    } catch (error) {
      console.log('   ❌ Error en estimación de gas para withdraw:', error.message);
      
      try {
        await contract.withdraw.staticCall();
        console.log('   ✅ Call estático exitoso - el problema puede ser de gas');
      } catch (staticError) {
        console.log('   ❌ Error en call estático:', staticError.message);
      }
    }

    // Verificar eventos recientes
    console.log('\n📜 Verificando eventos recientes...');
    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = currentBlock - 1000; // Últimos 1000 bloques
      
      const compoundFilter = contract.filters.RewardsCompounded(userAddress);
      const withdrawFilter = contract.filters.RewardsWithdrawn(userAddress);
      
      const compoundEvents = await contract.queryFilter(compoundFilter, fromBlock);
      const withdrawEvents = await contract.queryFilter(withdrawFilter, fromBlock);
      
      console.log(`   Eventos de compound recientes: ${compoundEvents.length}`);
      console.log(`   Eventos de withdraw recientes: ${withdrawEvents.length}`);
      
      if (compoundEvents.length > 0) {
        const lastCompound = compoundEvents[compoundEvents.length - 1];
        console.log(`   Último compound: ${ethers.formatEther(lastCompound.args.amount)} POL`);
      }
      
      if (withdrawEvents.length > 0) {
        const lastWithdraw = withdrawEvents[withdrawEvents.length - 1];
        console.log(`   Último withdraw: ${ethers.formatEther(lastWithdraw.args.amount)} POL`);
      }
      
    } catch (error) {
      console.log('   ⚠️  Error obteniendo eventos:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Pruebas completadas');
    
    // Resumen de diagnóstico
    console.log('\n🔍 DIAGNÓSTICO:');
    if (Number(calculatedRewards) > 0) {
      console.log('✅ Hay recompensas disponibles');
    } else {
      console.log('❌ No hay recompensas disponibles');
    }
    
    if (!isPaused) {
      console.log('✅ El contrato no está pausado');
    } else {
      console.log('❌ El contrato está pausado');
    }
    
    if (Number(contractBalance) > Number(calculatedRewards)) {
      console.log('✅ El contrato tiene fondos suficientes');
    } else {
      console.log('❌ El contrato no tiene fondos suficientes');
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Función principal
async function main() {
  // IMPORTANTE: Reemplaza estos valores con los reales
  const USER_ADDRESS = '0xed639e84179FCEcE1d7BEe91ab1C6888fbBdD0cf';
  const PRIVATE_KEY = 'TU_PRIVATE_KEY_AQUI'; // ⚠️ NUNCA subas esto a git
  
  if (PRIVATE_KEY === 'TU_PRIVATE_KEY_AQUI') {
    console.log('⚠️  Por favor, configura tu PRIVATE_KEY en el script antes de ejecutar');
    console.log('⚠️  NUNCA subas tu private key a git o lo compartas');
    return;
  }
  
  await testStakingFunctions(USER_ADDRESS, PRIVATE_KEY);
}

// Ejecutar
main().catch(console.error);

export { testStakingFunctions };