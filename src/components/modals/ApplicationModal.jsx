import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletContext } from '../../context/WalletContext';
import { FaTimes, FaGithub, FaChevronDown, FaDiscord } from 'react-icons/fa';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ApplicationModal = ({ isOpen, onClose, roleTitle }) => {
  const { account, walletConnected } = useContext(WalletContext); // Add walletConnected from context
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    githubUsername: '',
    specialization: '',
    walletAddress: account || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSpecializationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const specializations = [
    "Frontend UI/UX",
    "Core Development",
    "Infrastructure & DevOps"
  ];

  // Validate form completion
  const isFormComplete = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.country.trim() !== '' &&
      formData.githubUsername.trim() !== '' &&
      formData.specialization !== '' &&
      walletConnected // Include wallet connection in validation
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected || !isFormComplete()) {
      toast.error('Please ensure all fields are complete and wallet is connected');
      return;
    }

    setIsSubmitting(true);

    try {
      const developersCollection = collection(db, 'Developers');
      const developerData = {
        ...formData,
        roleApplied: roleTitle,
        applicationDate: serverTimestamp(),
        status: 'pending',
        fullWalletAddress: formData.walletAddress
      };

      await addDoc(developersCollection, developerData);

      toast.success('Application submitted successfully! 🎉');
      setIsSubmissionComplete(true); // Cambiar al estado de éxito
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        country: '',
        githubUsername: '',
        specialization: '',
        walletAddress: account || ''
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (isSubmissionComplete) {
      setIsSubmissionComplete(false);
    }
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update formData when account changes
  useEffect(() => {
    if (account) {
      setFormData(prev => ({
        ...prev,
        walletAddress: account
      }));
    }
  }, [account]);

  // Mejorado el censorWallet para manejar casos nulos
  const censorWallet = (address) => {
    if (!address) return 'Not Connected';
    if (!walletConnected) return 'Not Connected';
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          key={isSubmissionComplete ? 'success' : 'form'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-gradient-to-b from-purple-900/90 to-black/90 rounded-xl shadow-xl border border-purple-500/20 p-6"
        >
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>

          {!isSubmissionComplete ? (
            <>
              <h2 className="text-2xl font-bold text-white text-gradient mb-2">
                Apply - {roleTitle}
              </h2>
              <p className="text-purple-300 mb-6">Please fill in your details below</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                {/* GitHub Username Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-purple-300 mb-1">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-purple-400">
                      <FaGithub />
                    </span>
                    <input
                      type="text"
                      name="githubUsername"
                      required
                      value={formData.githubUsername}
                      onChange={handleChange}
                      placeholder="your-github-username"
                      className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg pl-10 pr-3 py-2 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                {/* Specialization Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-purple-300 mb-1">
                    Area of Specialization
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSpecializationDropdown(!showSpecializationDropdown)}
                    className="w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-left text-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    {formData.specialization || 'Select your specialization'}
                    <FaChevronDown className={`transition-transform duration-200 ${showSpecializationDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSpecializationDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-purple-900/90 border border-purple-500/20 rounded-lg shadow-xl">
                      {specializations.map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, specialization: spec });
                            setShowSpecializationDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-white hover:bg-purple-700/50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Updated Wallet Address Field */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-1">
                    Wallet Address
                    {!walletConnected && (
                      <span className="text-red-400 ml-2 text-xs">
                        (Required - Please connect your wallet)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="walletAddress"
                      required
                      value={censorWallet(formData.walletAddress)}
                      disabled
                      className={`w-full bg-purple-900/20 border border-purple-500/20 rounded-lg px-3 py-2 text-white placeholder-purple-300/50 font-mono ${
                        !walletConnected ? 'text-red-400' : 'text-white opacity-75'
                      }`}
                    />
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                      walletConnected ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {walletConnected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                </div>

                {/* Updated Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormComplete()}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-all duration-300 mt-6 flex items-center justify-center ${
                    isFormComplete() 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-600 cursor-not-allowed text-gray-300'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {!walletConnected 
                        ? 'Connect Wallet to Submit' 
                        : isFormComplete() 
                          ? 'Submit Application' 
                          : 'Complete All Fields'}
                    </>
                  )}
                </button>

                {/* Form Completion Message */}
                {!isFormComplete() && !isSubmitting && (
                  <p className="text-sm text-red-400 text-center mt-2">
                    {!walletConnected 
                      ? 'Please connect your wallet to submit the application'
                      : 'Please fill in all required fields'}
                  </p>
                )}
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white">Welcome to Nuvos Cloud!</h3>
              
              <div className="space-y-3 text-purple-200 text-sm">
                <p>Thank you for joining our developer community! Here's what happens next:</p>
                
                <ul className="text-left space-y-2 pl-4">
                  <li>• You'll receive an invitation to our Discord developer community</li>
                  <li>• Access to our contribution guidelines and documentation</li>
                  <li>• Opportunity to earn rewards for your contributions</li>
                  <li>• Regular updates about new development opportunities</li>
                </ul>

                <a
                  href="https://discord.gg/ee5uZXej"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] transition-colors rounded-lg text-white font-medium mt-4"
                >
                  <FaDiscord className="text-xl" />
                  Join our Discord Community
                </a>

                <p className="text-purple-300 mt-4">
                  Check your email for further instructions on how to get started!
                </p>
              </div>

              <button
                onClick={handleModalClose}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicationModal;
