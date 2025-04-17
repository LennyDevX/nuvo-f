import React, { useState } from 'react';
import { FaEdit, FaCheckCircle, FaTimes } from 'react-icons/fa';
import IntegrationList from './IntegrationList';
import NetworkBadge from '../../web3/NetworkBadge';

const UserSummary = ({ 
  userName, 
  onUpdateName, 
  account, 
  balance, 
  network, 
  activeIntegration, 
  onSelectIntegration 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(userName);
    setIsEditingName(false);
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                maxLength={30}
              />
              <button 
                onClick={handleSaveName} 
                className="text-green-400 hover:text-green-300 transition-colors"
                aria-label="Save name"
              >
                <FaCheckCircle className="text-xl" />
              </button>
              <button 
                onClick={handleCancelEdit} 
                className="text-red-400 hover:text-red-300 transition-colors"
                aria-label="Cancel editing"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <button 
                onClick={() => setIsEditingName(true)} 
                className="text-gray-400 hover:text-purple-300 transition-colors"
                aria-label="Edit name"
              >
                <FaEdit />
              </button>
            </div>
          )}
          <p className="text-purple-300 text-sm mt-1">User Profile</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Wallet</span>
            <span className="text-white font-mono text-xs break-all">{account}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Balance</span>
            <span className="text-white">{balance ? `${parseFloat(balance).toFixed(4)} MATIC` : '0.0000 MATIC'}</span>
          </div>
          <NetworkBadge />
        </div>
      </div>

      <div className="border-t border-purple-500/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nuvos Cloud Integrations</h3>
        <IntegrationList 
          activeIntegration={activeIntegration} 
          onSelectIntegration={onSelectIntegration}
        />
      </div>
    </div>
  );
};

export default UserSummary;
