import React, { useEffect, useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import ContractABI from "../../ABI/LockContract.json"; // actualiza con tu ruta correcta

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function MyComponent() {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [myMethodValue, setMyMethodValue] = useState(null);

    useEffect(() => {
        const init = async () => {
            const provider = await detectEthereumProvider();          
            if (provider) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                const contractInstance = new web3Instance.eth.Contract(ContractABI, CONTRACT_ADDRESS);
                setContract(contractInstance);

                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const account = accounts[0];
                    web3Instance.eth.defaultAccount = account;
                } catch (error) {
                    console.log("Error al conectar con Metamask ", error);
                }
            } else {
                console.log('Por favor instale MetaMask!');
            }
        };

        init();
    }, []);

    const callMyMethod = async () => {
        if (contract) {
            const result = await contract.methods.myMethod().call();
            setMyMethodValue(result);
        }
    };

    return (
        <div>
            <button onClick={callMyMethod}>Llamar a mi método</button>
            {myMethodValue && <div>Valor de myMethod: {myMethodValue}</div>}
        </div>
    );
}

export default MyComponent;