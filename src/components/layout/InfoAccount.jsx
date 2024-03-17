import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import WalletUtils from '../web3/WalletUtils';
import BalanceContract from "../web3/BalanceContract";
import ButtonDeposit from "../web3/ButtonDeposit";
import ButtonWithdraw from "../web3/ButtonWithdraw";
import "../../Styles/home.css"

function InfoAccount() {
    const { isDarkMode } = useContext(ThemeContext);
    const { account, network, balance } = useContext(WalletContext);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (account && network && balance !== null) {
            setIsConnected(true);
        } else {
            setIsConnected(false);
        }
    }, [account, network, balance]);

    return (
        <div className={`container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="main-container">
                <h1 className="title title-gradient is-centered">Welcome to Nuvo, here is your Dashboard!</h1>
                <div className={`box box-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
                    {isConnected ? (
                        <>
                            <p><strong>Wallet:</strong> {WalletUtils.censorAccount(account)}</p>
                            <br />
                            <p><strong>Blockchain:</strong> {network}</p>
                            <p><strong>Balance:</strong> {balance} cryptos</p>
                            
                            <BalanceContract />
                            <div className="button-container">
                                <ButtonDeposit className="button-spacing" />
                                <ButtonWithdraw className="button-spacing" />
                            </div>
                        </>
                    ) : (
                        <h2>Connect to your wallet to view information.</h2>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoAccount;