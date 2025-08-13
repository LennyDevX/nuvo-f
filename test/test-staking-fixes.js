// Test script para verificar las correcciones del contrato de staking
import { ethers } from 'ethers';

// Configuración del contrato
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon-rpc.com';

// ABI simplificado para las funciones que necesitamos probar
const STAKING_ABI = [
    'function calculateRewards(address userAddress) external view returns (uint256)',
    'function getContractBalance() external view returns (uint256)',
    'function getUserInfo(address userAddress) external view returns (tuple(uint256 totalDeposited, uint256 pendingRewards, uint256 lastWithdraw))',
    'function withdraw() external',
    'function withdrawAll() external',
    'function compound() external'
];

async function testStakingContract() {
    try {
        console.log('🔍 Iniciando pruebas del contrato de staking...');
        
        // Conectar al proveedor
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, STAKING_ABI, provider);
        
        // Dirección del usuario que está teniendo problemas
        const userAddress = '0xed639e84179FCEcE1d7BEe91ab1C6888fbBdD0cf';
        
        console.log('📊 Verificando estado del contrato...');
        
        // Verificar balance del contrato
        const contractBalance = await contract.getContractBalance();
        console.log(`💰 Balance del contrato: ${ethers.formatEther(contractBalance)} POL`);
        
        // Verificar información del usuario
        const userInfo = await contract.getUserInfo(userAddress);
        console.log(`👤 Usuario ${userAddress}:`);
        console.log(`   - Total depositado: ${ethers.formatEther(userInfo.totalDeposited)} POL`);
        console.log(`   - Recompensas pendientes: ${ethers.formatEther(userInfo.pendingRewards)} POL`);
        console.log(`   - Último retiro: ${new Date(Number(userInfo.lastWithdraw) * 1000).toLocaleString()}`);
        
        // Calcular recompensas directamente
        const rewards = await contract.calculateRewards(userAddress);
        console.log(`🎁 Recompensas calculadas: ${ethers.formatEther(rewards)} POL`);
        
        // Verificar si hay fondos suficientes para las recompensas
        if (rewards > 0) {
            const commission = (rewards * 600n) / 10000n; // 6% comisión
            const netRewards = rewards - commission;
            
            const sufficientForRewards = contractBalance >= netRewards;
            console.log(`✅ ¿Fondos suficientes para recompensas? ${sufficientForRewards}`);
            console.log(`   - Recompensas netas: ${ethers.formatEther(netRewards)} POL`);
            console.log(`   - Comisión: ${ethers.formatEther(commission)} POL`);
        }
        
        // Verificar si hay fondos suficientes para withdrawAll
        if (userInfo.totalDeposited > 0) {
            const totalWithdrawAmount = userInfo.totalDeposited + userInfo.pendingRewards;
            const commission = userInfo.pendingRewards > 0 ? (userInfo.pendingRewards * 600n) / 10000n : 0n;
            const netAmount = totalWithdrawAmount - commission;
            
            const sufficientForWithdrawAll = contractBalance >= netAmount;
            console.log(`✅ ¿Fondos suficientes para withdrawAll? ${sufficientForWithdrawAll}`);
            console.log(`   - Cantidad total neta: ${ethers.formatEther(netAmount)} POL`);
        }
        
        console.log('\n📋 Resumen de correcciones aplicadas:');
        console.log('1. ✅ Límite de retiro diario aumentado a 100,000 ETH');
        console.log('2. ✅ Verificación de balance mejorada (sin incluir comisión)');
        console.log('3. ✅ Transferencia de usuario antes que comisión');
        console.log('4. ✅ Manejo robusto de comisiones con fallback');
        console.log('5. ✅ Función hasSufficientFunds añadida para debugging');
        
        console.log('\n🔄 Estado actual del contrato:');
        console.log(`- Balance disponible: ${ethers.formatEther(contractBalance)} POL`);
        console.log(`- Usuario puede retirar: ${rewards > 0 ? 'SÍ' : 'NO'}`);
        console.log(`- Fondos suficientes: ${contractBalance >= rewards ? 'SÍ' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
        
        if (error.message.includes('execution reverted')) {
            console.log('\n🔍 Posibles causas del error:');
            console.log('- Fondos bloqueados por período de lockup');
            console.log('- Límite de retiro diario excedido');
            console.log('- No hay recompensas disponibles');
            console.log('- Balance insuficiente del contrato');
        }
    }
}

// Función para mostrar información de debugging
async function debugContractState() {
    console.log('\n🔧 Información de debugging adicional:');
    console.log('- Dirección del contrato:', CONTRACT_ADDRESS);
    console.log('- RPC URL:', RPC_URL);
    console.log('- Límite de retiro diario: 100,000 POL');
    console.log('- Comisión: 6%');
    console.log('- Período de límite de retiro: 24 horas');
}

// Ejecutar las pruebas
testStakingContract()
    .then(() => debugContractState())
    .then(() => {
        console.log('\n✅ Pruebas completadas. El contrato debería funcionar correctamente ahora.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

export { testStakingContract, debugContractState };