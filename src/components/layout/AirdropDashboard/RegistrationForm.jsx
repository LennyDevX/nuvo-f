const RegistrationForm = ({
    formData,
    handleChange,
    handleSubmit,
    account,
    error,
    isLoading,
    setFormData,
    walletConnected,
    onClose, // Make sure this prop is included
}) => {
    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Reset form
        setFormData({
            name: '',
            email: '',
            wallet: account || '',
            airdropType: ''
        });
        // Close the form
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* ...existing form fields... */}

            <div className="flex flex-col gap-3">
                <button
                    type="submit"
                    disabled={isLoading || !walletConnected}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${(isLoading || !walletConnected)
                            ? 'bg-purple-600 opacity-50 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                        }`}
                >
                    {!walletConnected 
                        ? 'Connect Wallet First'
                        : isLoading 
                        ? 'Registering...' 
                        : 'Register for Airdrop'}
                </button>

                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors duration-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default RegistrationForm;
