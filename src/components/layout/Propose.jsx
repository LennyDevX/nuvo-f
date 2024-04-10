import React, { useContext, useState, useRef, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { WalletContext } from '../context/WalletContext';
import { ethers } from "ethers";
import ABI from '../../Abi/Governance.json';
import "../../Styles/Notification.css"; // Import notification styles
import "../../Styles/home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';

const GOVERNANCE_CONTRACT_ADDRESS = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS;

const ProposalForm = () => {
  const { account } = useContext(WalletContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const textAreaRef = useRef(null); // Reference for the textarea

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = (textarea.scrollHeight) + "px"; // Adjust height based on content
    }
  }, [description]); // Update when description changes

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors
    setSuccess(false); // Clear previous success messages

    // Validation
    if (!title || !description || !category) {
      setError("Please fill in all form fields.");
      setLoading(false);
      setTimeout(() => { setError(null) }, 4000); // Hide error message after 4 seconds
      return;
    }

    try {
      // Obtain Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Create Governance contract
      const governanceContract = new ethers.Contract(
        GOVERNANCE_CONTRACT_ADDRESS,
        ABI.abi,
        signer
      );

      // Send proposal
      const tx = await governanceContract.submitProposal(
        title,
        description,
        category,
        attachments
      );
      await tx.wait();

      setSuccess(true); // Show success message
      setTitle('');
      setDescription('');
      setCategory('');
      setAttachments([]); // Clear form fields
      setTimeout(() => { setSuccess(false) }, 4000); // Hide success message after 4 seconds
    } catch (error) {
      console.error(error);

      // Handle specific errors
      if (error.code === 4001) { // Transaction rejected by user
        setError("Transaction rejected by user.");
      } else if (error.data?.message) { // Contract error message
        setError(error.data.message);
      } else {
        setError("Check your balance votes and try again");
      }
      setTimeout(() => { setError(null) }, 4000); // Hide error message after 4 seconds
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className='hero-body'>
        <p className='subtitle hero container is-3 is-centered has-text-weight-bold'>
          Connect the wallet to be able to create proposals
        </p>
      </div>
    );
  }

  return (
    <div className="hero-body is-fluid is-expanded">
      <div className="container fade">
        <div className="main-container is-centered">
          <form onSubmit={handleSubmit} className="box box-account">
            <div className="field">
              <label className="label title is-large has-text-centered">Create a Proposal</label>
              <div className="control">
                <input
                  className={`input ${error ? 'is-danger' : ''} ${success ? 'is-success' : ''}`}
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <div className="control">
                <textarea
                  ref={textAreaRef}
                  className={`textarea ${error ? 'is-danger' : ''} ${success ? 'is-success' : ''}`}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="field">
              <div className="control has-text-centered">
                <div className="select">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="negocios">Negocios</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <div className="control is-fullwidth ">
                <div className="file">
                  <label className="file-label">
                    <input
                      className="file-input"
                      type="file"
                      multiple
                      onChange={(e) => setAttachments(e.target.files)}
                    />
                    <span className="file-cta">
                      <span className="file-icon">
                        <FontAwesomeIcon icon={faFile} />
                      </span>
                      <span className="file-label">Select file</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="field">
              <div className="control is-fullwidth">
                <button
                  className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                  type="submit"
                >
                  Send Proposal
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {success && 
        <div className="notification is-success notification-visible">
          <p>Send successfully Your proposal is now under review!</p>
        </div>
      }
      {error && 
        <div className="notification is-danger notification-visible">
          <p>{error}</p>
        </div>
      }
    </div>
  );
};

export default ProposalForm;
