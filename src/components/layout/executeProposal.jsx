import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import { ethers } from "ethers";
import ABI from '../../Abi/Governance.json';

import "../../Styles/home.css";

const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

const ExecuteProposal = () => {
    const { account } = useContext(WalletContext);
    const { isDarkMode } = useContext(ThemeContext);
    const [proposalId, setProposalId] = useState('');
    const [updateType, setUpdateType] = useState(0); // Inicializar con 0 para "None"
    const [newValue, setNewValue] = useState('');
    const [loading, setLoading] = useState(false);

    const UpdateTypeMap = {
        "UpdateType.VOTES_PER_MATIC": 1,
        "UpdateType.WITHDRAWAL_COMMISSION": 2,
        "UpdateType.MIN_QUORUM": 3,
        "UpdateType.VOTE_THRESHOLD": 4,
        "UpdateType.PROPOSAL_EXPIRATION_TIME": 5,
      };
      
  
      const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
      
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
      
          const governanceContract = new ethers.Contract(
            GOVERNANCE_CONTRACT_ADDRESS,
            ABI.abi,
            signer
          );
      
          let tx;
      
          if (updateType !== 0 && newValue) {
            // Obtener el valor numérico correspondiente al tipo de actualización seleccionado
            const updateTypeValue = UpdateTypeMap[updateType] || 0;
      
            tx = await governanceContract.executeProposal(
              proposalId,
              updateTypeValue,
              newValue
            );
          } else {
            tx = await governanceContract.executeProposal(proposalId);
          }
      
          await tx.wait();
      
          console.log("Proposal executed successfully!");
        } catch (error) {
          console.error("Error executing proposal:", error);
        } finally {
          setLoading(false);
          setProposalId('');
          setUpdateType(0); // Resetear el tipo de actualización a "None"
          setNewValue('');
        }
      };
      


  if (!account) {
    return (
      <div className='hero-body  '>
        <p className='subtitle hero container  is-3 is-centered has-text-weight-bold '>
        Connect the wallet to be able to execute proposals
        </p>
      </div>
    );
  }

  return (
    <div className='hero-body  '>
    <div className=' fade  container '>
      <div className="main-container ">
        <div className="box  box-account section column hero-body is-fullwidth is-centered has-text-centered">
          <h2 className={`title is-2 ${isDarkMode ? 'has-text-white' : ''}`}>
            Execute a proposal
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="field ">
              <div className="control">
                <input
                  className={`input ${isDarkMode ? 'is-black' : ''}`}
                  type="number"
                  value={proposalId}
                  onChange={(e) => setProposalId(e.target.value)}
                  required
                  placeholder="Proposal ID"
                />
              </div>
            </div>
            <div className="field">
            <div className="control">
                <div className="select is-fullwidth ${isDarkMode ? 'has-text-white' : ''}">
                <select value={updateType} onChange={(e) => setUpdateType(e.target.value)}>
                    <option value="">Select update type (optional)</option>
                    {Object.keys(UpdateTypeMap).map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                    ))}
                    <option value="">None</option>
                </select>
                </div>
            </div>
            </div>

            <div className="field">
              <div className="control">
                <input
                  className={`input ${isDarkMode ? 'is-black' : ''}`}
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="New value (optional)"
                />
              </div>
            </div>
            <div className="field">
              <div className="control hero ">
                <button
                  className={`button ${isDarkMode ? 'is-info' : 'is-primary'} ${loading ? 'is-loading' : ''}`}
                  type="submit"
                >
                  Execute Proposal
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ExecuteProposal;
