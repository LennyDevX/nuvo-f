import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from '../context/WalletContext';
import AirdropABI from '../../Abi/Airdrop.json';

function AirdropAdmin() {
  const { provider } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const AIRDROP_CONTRACT_ADDRESS = import.meta.env.VITE_AIRDROP_ADDRESS;
  const TOKEN_AMOUNT = ethers.utils.parseEther("10"); // 10 POL por usuario
  const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30 días en segundos

  const configureAirdrop = async () => {
    try {
      setLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        AIRDROP_CONTRACT_ADDRESS,
        AirdropABI.abi,
        signer
      );

      const currentBlock = await provider.getBlock('latest');
      const startTime = currentBlock.timestamp;
      const endTime = startTime + THIRTY_DAYS;

      console.log('Configurando Airdrop:', {
        startTime,
        endTime,
        tokenAmount: ethers.utils.formatEther(TOKEN_AMOUNT)
      });

      const tx = await contract.configureAirdrop(
        startTime,
        endTime,
        TOKEN_AMOUNT
      );

      setMessage({ text: 'Configurando Airdrop...', type: 'info' });
      await tx.wait();
      setMessage({ text: 'Airdrop configurado exitosamente!', type: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: error.reason || 'Error al configurar el airdrop', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fundAirdrop = async () => {
    try {
      setLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        AIRDROP_CONTRACT_ADDRESS,
        AirdropABI.abi,
        signer
      );

      // Calcular el monto total para 1000 usuarios (ajusta según tus necesidades)
      const TOTAL_USERS = 1000;
      const TOTAL_AMOUNT = TOKEN_AMOUNT.mul(TOTAL_USERS);

      console.log('Fondeando Airdrop:', {
        totalAmount: ethers.utils.formatEther(TOTAL_AMOUNT),
        usersSupported: TOTAL_USERS
      });

      const tx = await contract.fundAirdrop(TOTAL_AMOUNT);
      setMessage({ text: 'Fondeando Airdrop...', type: 'info' });
      await tx.wait();
      setMessage({ text: 'Airdrop fondeado exitosamente!', type: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ text: error.reason || 'Error al fondear el airdrop', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Administración del Airdrop</h2>
      
      <div className="space-y-4">
        <button
          onClick={configureAirdrop}
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Configurar Airdrop'}
        </button>

        <button
          onClick={fundAirdrop}
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Fondear Airdrop'}
        </button>

        {message.text && (
          <div className={`p-4 rounded-xl text-white ${
            message.type === 'error' ? 'bg-red-500/20' :
            message.type === 'success' ? 'bg-green-500/20' :
            'bg-blue-500/20'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default AirdropAdmin;
