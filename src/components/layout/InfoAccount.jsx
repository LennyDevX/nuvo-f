import React, { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import ABI from "../../Abi/StakingContract.json";
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import WalletUtils from '../web3/WalletUtils';
import ButtonDeposit from "../web3/ButtonDeposit";
import ButtonWithdraw from "../web3/ButtonWithdraw";
import "../../Styles/home.css";

const contractAddress = "0x202A6dBa7Fbb34728C513e5791625989c76556c0";

function InfoAccount() {
    const { isDarkMode } = useContext(ThemeContext);
    const { account, network, balance } = useContext(WalletContext);

    const [isConnected, setIsConnected] = useState(false);
    const [depositAmount, setDepositAmount] = useState(0);
    const [rewardAmount, setRewardAmount] = useState(0);
    const [totalDeposit, setTotalDeposit] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);
    useEffect(() => {
        if (account && network && balance !== null) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }
    }, [account, network, balance]);

    useEffect(() => {
        if (isConnected){
            async function fetchData() {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const contract = new ethers.Contract(
                    contractAddress,
                    ABI.abi,
                    signer
                    );

                    const signerAddress = await signer.getAddress();
                    const deposit = await contract.getTotalDeposit(signerAddress);
                    const realDeposit = ethers.utils.formatEther(deposit);
                    setDepositAmount(realDeposit);

                        

                    const rewards = await contract.calculateRewards(signerAddress);
                    const realRewards = ethers.utils.formatEther(rewards);
                    setRewardAmount(realRewards);

                } catch (error) {
                    console.error("Error: ", error);
                }
            }
            fetchData();
        }
    }, [isConnected]);

    return (
        <div>
            <div className={` fade container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                <div className="main-container">
                    <h1 className="title is-3 is-centered">Pocket</h1>
                    <div className={`flex  ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                        {isConnected ? (
                            <>
                               
                                <p className={` subtitle account-info ${isDarkMode ? 'account-info-dark' : ''}`}>
                                    <strong>Blockchain:</strong> {network}
                                </p>
                                

                                

                               <div className={`balance-display ${isDarkMode ? 'balance-dark' : 'balance-light'}`}>
                            <p className="subtitle">
                                <strong>Power 🗡️:</strong> {depositAmount} Matic
                            </p>
                            <p className="subtitle">
                                <strong>Bag 💰:</strong> {balance} Matic
                            </p>
                            <p className="subtitle">
                                <strong>Rewards 🎁:</strong> {rewardAmount} Matic
                            </p>
                        </div>

                                <div className="  m-2">
                                    <ButtonDeposit className=" "/>
                                </div>

                                <div className="  m-2">
                                    <ButtonWithdraw className=" "/>
                                </div>

                            </>
                        ) : (
                            <p className=' subtitle is-5 is-centered'>Connect to your wallet to view information.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoAccount;