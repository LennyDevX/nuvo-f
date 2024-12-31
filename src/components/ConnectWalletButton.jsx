import React, { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

const ConnectWalletButton = () => {
    const { connectWallet } = useContext(WalletContext);

    return (
        <button
            onClick={connectWallet}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
        >
            Connect Wallet
        </button>
    );
};

export default ConnectWalletButton;
