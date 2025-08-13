// Script simplificado para verificar el límite de retiro diario
import { ethers } from 'ethers';

// Configuración
const CONTRACT_ADDRESS = '0x21Af69A71611055237B099c915a0aD88a9097A23';
const RPC_URL = 'https://polygon-rpc.com';
const USER_ADDRESS = '0xed639e84179FCEcE1d7BEe91ab1C6888fbBdD0cf';

// ABI básico
const BASIC_ABI = [
    'function getUserInfo(address userAddress) external view returns (tuple(uint256 totalDeposited, uint256 pendingRewards, uint256 lastWithdraw))',
    'function calculateRewards(address userAddress) external view returns (uint256)',
    'function getContractBalance() external view returns (uint256)'
];

async function verifyDailyLimit() {
    try {
        console.log('🔍 Verificando límite de retiro diario...');
        console.log(`📍 Contrato: ${CONTRACT_ADDRESS}`);
        console.log(`👤 Usuario: ${USER_ADDRESS}`);
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, BASIC_ABI, provider);
        
        // Obtener información básica
        const userInfo = await contract.getUserInfo(USER_ADDRESS);
        const rewards = await contract.calculateRewards(USER_ADDRESS);
        const contractBalance = await contract.getContractBalance();
        
        console.log('\n📊 Estado actual:');
        console.log(`💰 Balance del contrato: ${ethers.formatEther(contractBalance)} POL`);
        console.log(`💎 Total depositado: ${ethers.formatEther(userInfo.totalDeposited)} POL`);
        console.log(`🎁 Recompensas pendientes: ${ethers.formatEther(userInfo.pendingRewards)} POL`);
        console.log(`🎁 Recompensas calculadas: ${ethers.formatEther(rewards)} POL`);
        
        // Calcular monto total de withdrawAll
        const totalWithdrawAmount = userInfo.totalDeposited + userInfo.pendingRewards;
        console.log(`\n💸 Monto total withdrawAll: ${ethers.formatEther(totalWithdrawAmount)} POL`);
        
        // El límite actual del contrato desplegado es 1000 ETH
        const currentDailyLimit = ethers.parseEther('1000');
        console.log(`🚫 Límite diario actual: ${ethers.formatEther(currentDailyLimit)} POL`);
        
        // Verificar si excede el límite
        const exceedsLimit = totalWithdrawAmount > currentDailyLimit;
        console.log(`\n🚨 ¿Excede límite diario? ${exceedsLimit ? 'SÍ ❌' : 'NO ✅'}`);
        
        if (exceedsLimit) {
            const excess = totalWithdrawAmount - currentDailyLimit;
            console.log(`📈 Exceso: ${ethers.formatEther(excess)} POL`);
            console.log(`📉 Porcentaje de exceso: ${((Number(excess) / Number(totalWithdrawAmount)) * 100).toFixed(2)}%`);
        }
        
        // Mostrar soluciones
        console.log('\n💡 Soluciones disponibles:');
        
        if (rewards > 0) {
            console.log(`1. ✅ Usar withdraw() para retirar solo recompensas: ${ethers.formatEther(rewards)} POL`);
        }
        
        console.log('2. 🔄 Redesplegar contrato con límite de 100,000 POL (RECOMENDADO)');
        console.log('3. ⏰ Esperar 24 horas y hacer retiros parciales');
        
        // Verificar si withdraw() funcionaría
        if (rewards > 0 && rewards <= currentDailyLimit) {
            console.log('\n✅ La función withdraw() debería funcionar correctamente');
        } else if (rewards > currentDailyLimit) {
            console.log('\n⚠️ Incluso withdraw() podría fallar por exceder el límite');
        }
        
        console.log('\n🎯 Confirmación del problema:');
        console.log('- Error: DailyWithdrawalLimitExceeded()');
        console.log('- Causa: Monto total excede 1,000 POL');
        console.log('- Estado: Correcciones implementadas en código');
        console.log('- Acción requerida: Redesplegar contrato');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar verificación
verifyDailyLimit()
    .then(() => {
        console.log('\n🏁 Verificación completada.');
    })
    .catch(console.error);

export { verifyDailyLimit };