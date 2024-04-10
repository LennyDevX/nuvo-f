import React, { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import ABI from '../../Abi/Governance.json';
import { WalletContext } from '../context/WalletContext';
import { ThemeContext } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faCalendarAlt, faUserCircle, faThumbsUp, faThumbsDown, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

const calculateStatus = (proposal) => {
  const quorum = 500;
  const totalVotes = parseInt(proposal.upvotes, 10) + parseInt(proposal.downvotes, 10);
  const expirationDate = new Date(parseInt(proposal.createdAt) * 1000 + 60 * 24 * 60 * 60 * 1000); // 60 days from creation

  if (expirationDate < new Date()) {
    return 'Closed';
  } else if (totalVotes < quorum) {
    return 'Rejected';
  } else if (proposal.status === 'Approved') {
    return 'Approved';
  } else if (proposal.status === 'Executed') {
    return 'Executed';
  } else if (parseInt(proposal.votesInFavor, 10) === 0) {
    return 'Pending';
  } else {
    return 'In Review';
  }
};

const ProposalList = () => {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [proposals, setProposals] = useState([]);
  const [userVotes, setUserVotes] = useState(0);
  const [voteLoading, setVoteLoading] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [ethereumProvider, setEthereumProvider] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setEthereumProvider(provider);
  }, []);

  useEffect(() => {
    if (!account || !ethereumProvider) return;

    const fetchData = async () => {
      try {
        const signer = ethereumProvider.getSigner();
        const governanceContract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, ABI.abi, signer);
        const allProposals = await governanceContract.listProposals();

        // Calculate remaining time for each proposal
        const proposalsWithTime = allProposals.map((proposal) => {
          const expirationDate = new Date(parseInt(proposal.createdAt) * 1000 + 60 * 24 * 60 * 60 * 1000);
          const timeRemaining = expirationDate - new Date();
          const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

          return {
            ...proposal,
            daysRemaining,
          };
        });

        const updatedProposals = proposalsWithTime.map((proposal) => ({
          id: proposal.id?.toString() || '-',
          title: proposal.title || '-',
          description: proposal.description || '-',
          category: proposal.category || '-',
          attachments: proposal.attachments?.length || [],
          submitter: proposal.author ? proposal.author.slice(0, 6) + '...' + proposal.author.slice(-6) : '-',
          timestamp: proposal.createdAt?.toString() || '-',
          upvotes: ethers.utils.formatEther(proposal.votesInFavor) || '0',
          downvotes: ethers.utils.formatEther(proposal.votesAgainst) || '0',
          status: calculateStatus(proposal),
          daysRemaining: proposal.daysRemaining,
        }));

        const userVotes = await governanceContract.votes(account);
        setUserVotes(userVotes);
        setProposals(updatedProposals);
      } catch (error) {
        console.error('Error fetching proposals:', error);
        displayNotification('Failed to fetch proposals', 'error');
      }
    };

    fetchData();
  }, [account, ethereumProvider]);

  const vote = async (proposalId, inFavor) => {
    try {
      if (userVotes === 0) {
        displayNotification('You have no votes available', 'error');
        return;
      }
  
      setVoteLoading({ [proposalId]: true });
      const signer = ethereumProvider.getSigner();
      const governanceContract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, ABI.abi, signer);
  
      // Allow the user to vote with all available votes
      const numVotesToCast = userVotes; 
  
      const tx = await governanceContract.vote(proposalId, inFavor, numVotesToCast);
      await tx.wait();
  
      // Update state of the voted proposal
      const updatedProposal = await governanceContract.proposals(proposalId);
      const updatedStatus = calculateStatus(updatedProposal);
      const updatedProposalsData = proposals.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: updatedStatus,
            upvotes: ethers.utils.formatEther(updatedProposal.votesInFavor),
            downvotes: ethers.utils.formatEther(updatedProposal.votesAgainst),
          };
        }
        return p;
      });
      setProposals(updatedProposalsData);
  
      // Update user votes (assuming votes are consumed)
      setUserVotes(0); // Set to 0 assuming votes are used up
  
      displayNotification('Voted successfully', 'success');
    } catch (error) {
      console.error('Error voting:', error);
      let errorMessage = 'Failed to vote.';
      if (error.reason === 'execution reverted') {
        errorMessage = 'The transaction failed. Please check if you have enough tokens and try again.';
      }
      displayNotification(errorMessage, 'error');
    } finally {
      setVoteLoading({ [proposalId]: false });
    }
  };

  const displayNotification = (message, type) => {
    setNotification({ message, type });
    const timeoutId = setTimeout(() => { setNotification({ message: '', type: '' }) }, 3000);
    return () => clearTimeout(timeoutId);
  };

  if (!account) {
    return (
      <div className='hero-body'>
        <p className='subtitle hero container is-3 is-centered has-text-weight-bold'>
          Connect the wallet to be able to vote proposals
        </p>
      </div>
    );
  }

  return (
    <div className='hero-body '>
      <div className=' container hero-body  is-fluid is-max-width-1200'>
        {proposals.length === 0 ? ( 
          <p>No se encontraron propuestas</p>
        ) : (
          <div className='  '>
            <div className='columns is-multiline'>
              {proposals.map((proposal) => (
                <div key={proposal.id} className='column is-4'>
                  <div className={`box-account box ${isDarkMode ? 'has-background-dark' : ''}`}>
                    <div className='card-content'>
                      <h3 className={`title is-3 ${isDarkMode ? 'has-text-white' : ''}`}>{proposal.title}</h3>
                      <p className={`subtitle mt-2 is-5 has-text-weight-bold ${isDarkMode ? 'has-text-white' : ''}`}>{proposal.description}</p>
  
                      {/* Botones de votación siempre visibles */}
                      <div className='buttons'>
                        <button 
                          className={`button is-success ${voteLoading[proposal.id] ? 'is-loading' : ''} ${isDarkMode ? 'has-background-success' : ''}`}
                          onClick={() => vote(proposal.id, true)}
                        >
                          Votar a Favor
                        </button>
                        <button  
                          className={`button is-danger ${voteLoading[proposal.id] ? 'is-loading' : ''} ${isDarkMode ? 'has-background-danger' : ''}`}
                          onClick={() => vote(proposal.id, false)}
                        >
                          Votar en Contra
                        </button>
                      </div> 
  
                      {/* Detalles de la propuesta */}
                      <div className='subtitle mb-4 is-6 is-flex is-align-items-center'>
                        <FontAwesomeIcon icon={faFileAlt} className={isDarkMode ? 'has-text-white' : ''} />
                        <span className={`ml-1 ${isDarkMode ? 'has-text-white' : ''}`}>
                          {proposal.attachments && proposal.attachments.length}
                        </span>
                      </div>
                      <div className=' subtitle mb-4 is-6 is-flex is-align-items-center'>
                        <FontAwesomeIcon icon={faUserCircle} className={isDarkMode ? 'has-text-white' : ''} />
                        <span className={`ml-1 ${isDarkMode ? 'has-text-white' : ''}`}>{proposal.submitter}</span>
                      </div>
                      <div className='subtitle mb-4 is-6 is-flex is-align-items-center'>
                        <FontAwesomeIcon icon={faCalendarAlt} className={isDarkMode ? 'has-text-white' : ''} />
                        <span className={`ml-1 ${isDarkMode ? 'has-text-white' : ''}`}>
                          {proposal.timestamp !== '-' ? new Date(parseInt(proposal.timestamp) * 1000).toLocaleString() : 'Fecha Inválida'}
                        </span>
                      </div>
  
                      {/* Visualización del estado y tiempo restante/expiración */}
                      {(() => {
                        switch (proposal.status) {
                          case 'Pending':
                            if (proposal.daysRemaining > 0) {
                              return (
                                <div className='subtitle is-6'>
                                  Expira en: {proposal.daysRemaining} días
                                </div>
                              );
                            } else {
                              return (
                                <div className='subtitle  is-6'>
                                  Expirada - En Revisión
                                </div>
                              );
                            }
                          case 'Approved':
                            return (
                              <div className='subtitle is-6 is-flex is-align-items-center'>
                                <FontAwesomeIcon icon={faCheckCircle} className={`has-text-success ${isDarkMode ? 'has-text-white' : ''}`} />
                                <span className={`ml-2 ${isDarkMode ? 'has-text-white' : ''}`}>Aprobada</span> 
                              </div>
                            );
                          case 'Rejected':
                            return (
                              <div className='subtitle is-6 is-flex is-align-items-center'>
                                <FontAwesomeIcon icon={faTimesCircle} className={`has-text-danger ${isDarkMode ? 'has-text-white' : ''}`} />
                                <span className={`ml-2 ${isDarkMode ? 'has-text-white' : ''}`}>Rechazada</span> 
                              </div>
                            );
                          case 'Executed':
                            return (
                              <div className='subtitle is-6'>Ejecutada</div> 
                            );
                          case 'Closed':
                            return (
                              <div className='subtitle is-6'>Cerrada</div>
                            );
                          default:
                            return null;
                        }
                      })()}
  
                      {/* Visualización de votos con iconos */}
                      <div className='is-flex subtitle mb-2 is-align-items-center'>
                        <FontAwesomeIcon icon={faThumbsUp} className={`has-text-success ${isDarkMode ? 'has-text-white' : ''}`} />
                        <span className={`ml-2 ${isDarkMode ? 'has-text-white' : ''}`}>{proposal.upvotes}</span>
                        <FontAwesomeIcon icon={faThumbsDown} className={`has-text-danger ml-4 ${isDarkMode ? 'has-text-white' : ''}`} /> 
                        <span className={`ml-2 ${isDarkMode ? 'has-text-white' : ''}`}>{proposal.downvotes}</span>
                      </div> 
                    </div> 
                  </div> 
                </div>
              ))} 
            </div> 
          </div> 
        )}
  
        {notification.message && ( 
          <div className={`notification ${notification.type === 'error' ? 'is-danger' : 'is-success'} notification-visible`}>
            <p>{notification.message}</p> 
          </div>
        )}
      </div> 
    </div>
  );}

export default ProposalList;