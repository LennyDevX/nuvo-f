import React from 'react';

const RegistrationForm = ({
    formData,
    handleChange,
    handleSubmit,
    account,
    error,
    isLoading,
    setFormData,
}) => {
    const onSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            await handleSubmit(e);
        } catch (error) {
            console.error('Form submission error:', error.message);
        }
    };

    const validateInput = (e) => {
        const { name, value } = e.target;
        
        switch (name) {
            case 'name':
                if (value.length > 50) {
                    e.preventDefault();
                    return;
                }
                // Prevenir caracteres especiales
                if (!/^[a-zA-Z0-9\s]*$/.test(value)) {
                    e.preventDefault();
                    return;
                }
                break;
            case 'email':
                if (value.length > 100) {
                    e.preventDefault();
                    return;
                }
                break;
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    onKeyPress={validateInput}
                    maxLength={50}
                    pattern="[a-zA-Z0-9\s]+"
                    required
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-900 text-gray-100 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
            </div>

            <div>
                <label htmlFor="wallet" className="block text-sm font-medium text-gray-200">
                    Wallet Address
                </label>
                <input
                    type="text"
                    name="wallet"
                    id="wallet"
                    value={account || ''}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-400 shadow-sm"
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-2">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isLoading
                        ? 'bg-purple-600 opacity-50 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    }`}
            >
                {isLoading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};

export default RegistrationForm;