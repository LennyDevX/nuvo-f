import React, { useContext, useState, useEffect, useCallback } from 'react';
import { WalletContext } from '../../../../context/WalletContext';
import TimeCounter from './TimeCounter';
import FormHeader from './FormHeader';
import { motion } from 'framer-motion';
import AirdropTypeSelector from './AirdropTypeSelector';
import RegistrationForm from './RegistrationForm'; // Ensure this is the default export
import { FaCoins, FaImages, FaBox, FaPalette, FaTimes } from 'react-icons/fa'; // Add FaTimes
import { addDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { airdropsCollection } from '../../../firebase/config'; // Update Firebase config import path
import SubmissionSuccess from './SubmissionSuccess'; // Add this line
import { useAirdropRegistration } from '../../../../hooks/useAirdropRegistration';

const airdropTypes = [  
    { id: 'tokens', name: 'Tokens', description: 'Receive tokens directly to your wallet', icon: <FaCoins /> },
    { id: 'nfts', name: 'NFTs', description: 'Get exclusive NFTs', icon: <FaImages />, comingSoon: true },
    { id: 'items', name: 'Items', description: 'Receive special items', icon: <FaBox />, comingSoon: true },
    { id: 'art', name: 'Art', description: 'Get unique digital art', icon: <FaPalette />, comingSoon: true }
];

const AirdropForm = ({ onClose }) => {
    const { account, walletConnected, provider } = useContext(WalletContext);
    const { registerForAirdrop, getAirdropInfo, airdropInfo } = useAirdropRegistration(provider, account);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        wallet: account || '',
        airdropType: ''
    });

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const [submitCount, setSubmitCount] = useState(0);
    const [lastSubmitTime, setLastSubmitTime] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    const handleChange = (nameOrEvent, value) => {
        // If it's an event (from normal inputs)
        if (nameOrEvent?.target) {
            const { name, value } = nameOrEvent.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        } 
        // If they are direct values (from the type selector)
        else if (typeof nameOrEvent === 'string') {
            setFormData(prev => ({
                ...prev,
                [nameOrEvent]: value
            }));
        }
    };

    const getAirdropTypeStatus = async (typeId) => {
        try {
            const participations = await checkPreviousParticipation(typeId);
            if (participations && participations.length > 0) {
                const participation = participations[0];
                return {
                    isRegistered: true,
                    timestamp: new Date(participation.submittedAt.seconds * 1000).toLocaleDateString(),
                    submissionId: participation.id
                };
            }
            return { isRegistered: false };
        } catch (error) {
            console.error('Error checking airdrop type status:', error);
            return { isRegistered: false };
        }
    };

    useEffect(() => {
        // Calculate target date 14 days from now
        const now = new Date();
        const targetDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));
        
        const timer = setInterval(() => {
            const currentTime = new Date();
            const difference = targetDate - currentTime;
            
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            
            setTimeLeft({ days, hours, minutes, seconds });
            
            if (difference < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (account) {
            setFormData(prev => ({
                ...prev,
                wallet: account
            }));
        }
    }, [account]);

    useEffect(() => {
        if (walletConnected && account) {
            setFormData(prev => ({
                ...prev,
                wallet: account
            }));
        }
    }, [walletConnected, account]);

    useEffect(() => {
        if (provider && account) {
            getAirdropInfo();
        }
    }, [provider, account, getAirdropInfo]);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            if (!account || !formData.airdropType) return;
            
            try {
                const participations = await checkPreviousParticipation(formData.airdropType);
                setIsAlreadyRegistered(participations.length > 0);
            } catch (error) {
                console.error('Error checking registration status:', error);
            }
        };

        checkRegistrationStatus();
    }, [account, formData.airdropType]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const checkPreviousParticipation = async (airdropType) => {
        try {
            const q = query(airdropsCollection, where('wallet', '==', account), where('airdropType', '==', airdropType));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error checking previous participation:', error);
            return [];
        }
    };

    const checkEmailUsage = async (email, airdropType) => {
        try {
            const q = query(
                airdropsCollection,
                where('email', '==', email),
                where('airdropType', '==', airdropType)
            );
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking email usage:', error);
            return false;
        }
    };

    const checkRateLimit = () => {
        const now = Date.now();
        const timeWindow = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        const maxAttempts = 3; // máximo 3 intentos por día

        if (lastSubmitTime && (now - lastSubmitTime) < timeWindow) {
            if (submitCount >= maxAttempts) {
                return false;
            }
        } else {
            // Reset contador si ha pasado el tiempo
            setSubmitCount(0);
            setLastSubmitTime(now);
        }
        return true;
    };

    const validateForm = async () => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!account) {
            setError('Please connect your wallet first');
            return false;
        }
        if (!formData.airdropType) {
            setError('Please select an airdrop type');
            return false;
        }

        // Check if selected airdrop type is not a "coming soon" type
        const selectedType = airdropTypes.find(type => type.id === formData.airdropType);
        if (selectedType?.comingSoon) {
            setError('Please select an available airdrop type');
            return false;
        }

        const { isRegistered } = await getAirdropTypeStatus(formData.airdropType);
        if (isRegistered) {
            setError('You have already registered for this airdrop type. Please select a different one.');
            return false;
        }

        const emailUsed = await checkEmailUsage(formData.email, formData.airdropType);
        if (emailUsed) {
            setError('This email has already been used for this type of airdrop');
            return false;
        }

        // Validar longitud del nombre
        if (formData.name.length < 2 || formData.name.length > 50) {
            setError('Name must be between 2 and 50 characters');
            return false;
        }

        // Validar formato de email más estrictamente
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Validar dirección de wallet
        if (!account.match(/^0x[a-fA-F0-9]{40}$/)) {
            setError('Invalid wallet address');
            return false;
        }

        // Verificar rate limiting
        if (!checkRateLimit()) {
            setError('Maximum submission limit reached. Please try again in 24 hours.');
            return false;
        }

        return true;
    };

    const submitToBackend = useCallback(async (data) => {
        try {
            // Filter out undefined values and create clean submission data
            const cleanData = {
                name: data.name || '',
                email: data.email || '',
                wallet: data.wallet || '',
                airdropType: data.airdropType || 'tokens',
                registrationHash: data.registrationHash || '',
                isRegistered: Boolean(data.isRegistered),
                submittedAt: Timestamp.now(),
                status: 'pending'
            };

            // Validate required fields
            if (!cleanData.name || !cleanData.email || !cleanData.wallet) {
                throw new Error('Missing required fields');
            }

            const docRef = await addDoc(airdropsCollection, cleanData);
            return docRef.id;
        } catch (error) {
            console.error('Error submitting to backend:', error);
            throw error;
        }
    }, []);

    const processRegistration = async (data) => {
        try {
            if (!data) {
                throw new Error('No registration data provided');
            }

            // Check if already registered in Firebase
            const existingRegistrations = await checkPreviousParticipation('tokens');
            if (existingRegistrations.length > 0) {
                setError('You have already registered for this airdrop');
                return;
            }

            // Ensure we have all required data
            const submissionData = {
                name: data.name,
                email: data.email,
                wallet: data.wallet,
                airdropType: data.airdropType || formData.airdropType || 'tokens',
                registrationHash: data.registrationHash || '',
                isRegistered: Boolean(data.isRegistered),
                submittedAt: Timestamp.now()
            };

            const docId = await submitToBackend(submissionData);
            console.log('Firebase submission successful, docId:', docId);
            
            setIsSubmitted(true);
            setError(null);
            
            return docId;
        } catch (error) {
            console.error('Registration processing error:', error);
            setError('Failed to process registration. Please try again.');
            throw error;
        }
    };

    const handleSubmit = async (data) => {
        try {
            await processRegistration(data);
            setRegistrationCompleted(true);
            // Removemos el cierre automático
            // El usuario cerrará manualmente
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setError('Registration failed. Please try again.');
        }
    };

    const isFormValid = formData.name.trim() !== '' &&
                        formData.email.trim() !== '' &&
                        formData.airdropType !== '' &&
                        walletConnected;

    return (
        <div className="min-h-screen">
            <TimeCounter timeLeft={timeLeft} />
            <div className="max-w-4xl mx-auto px-4">
                <FormHeader />
                <motion.div 
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {registrationCompleted ? (
                        <SubmissionSuccess onClose={onClose} />
                    ) : (
                        <>
                            <AirdropTypeSelector 
                                formData={formData}
                                handleChange={handleChange}
                                getAirdropTypeStatus={getAirdropTypeStatus}
                                error={error}
                                airdropTypes={airdropTypes}
                            />
                            <RegistrationForm 
                                formData={formData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                account={account}
                                error={error}
                                isLoading={isLoading}
                                setFormData={setFormData}
                                walletConnected={walletConnected}
                                onClose={onClose} // Make sure this prop is passed
                                isAlreadyRegistered={isAlreadyRegistered} // Add this prop
                            />
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AirdropForm;