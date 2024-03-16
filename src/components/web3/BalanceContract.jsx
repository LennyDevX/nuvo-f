import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import contractABI from '../../Abi/Verify.json';

// definimos una variable de contrato
let contract;

function App() {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        async function checkBalance() {
            const provider = new ethers.providers.JsonRpcProvider();
            const signer = provider.getSigner();
            contract = new ethers.Contract('<tu_direccion_del_contrato>', contractABI, signer);
            const balance = await contract.getDepositOf(signer.getAddress());
            setBalance(ethers.utils.formatEther(balance));
        }

        checkBalance();
    }, []);

    return <div>Tu balance es {balance}</div>
}

export default App;