import React from 'react';
import { FaWallet } from 'react-icons/fa';

const NotConnectedMessage = ({
  title = 'Connect Wallet',
  message = 'Please connect your wallet to continue.',
  connectWallet,
  useAnimations = false, // Nuevo prop para controlar animaciones
}) => {
  // Versión sin animaciones para usar dentro de LazyMotion
  if (!useAnimations) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-3 sm:px-6 md:px-10 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 sm:mb-8">
          <FaWallet className="text-white text-3xl sm:text-4xl" />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          {title}
        </h2>

        <p className="text-gray-300 max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-10 text-base sm:text-lg">
          {message}
        </p>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full text-left mx-auto">
          <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">
            How to connect:
          </h3>
          <ol className="space-y-3 sm:space-y-4 text-purple-200 text-sm sm:text-base">
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white">
                1
              </span>
              <span>
                Click the <b>"Connect Wallet"</b> button in the top-right corner of
                the navigation bar.
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white">
                2
              </span>
              <span>
                Select your preferred wallet provider (MetaMask or TrustWallet).
              </span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-white">
                3
              </span>
              <span>
                Confirm the connection in your wallet and you're ready to go!
              </span>
            </li>
          </ol>
        </div>
        
        {connectWallet && (
          <button
            className="btn-nuvo-base btn-nuvo-outline px-6 py-3 text-white font-medium mt-6"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>
    );
  }

  // Versión con animaciones usando dynamic import
  const [MotionComponent, setMotionComponent] = React.useState(null);

  React.useEffect(() => {
    import('framer-motion').then(({ motion }) => {
      setMotionComponent(() => motion.div);
    });
  }, []);

  if (!MotionComponent) {
    // Fallback mientras carga el motion
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-3 sm:px-6 md:px-10 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 sm:mb-8">
          <FaWallet className="text-white text-3xl sm:text-4xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          {title}
        </h2>
        <p className="text-gray-300 max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-10 text-base sm:text-lg">
          {message}
        </p>
      </div>
    );
  }

  return React.createElement(MotionComponent, {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
    className: "flex flex-col items-center justify-center min-h-[60vh] py-10 px-3 sm:px-6 md:px-10 text-center"
  }, [
    React.createElement(MotionComponent, {
      key: "icon",
      className: "w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-6 sm:mb-8",
      animate: {
        boxShadow: [
          '0 0 0 0 rgba(139, 92, 246, 0.3)',
          '0 0 0 20px rgba(139, 92, 246, 0)',
          '0 0 0 0 rgba(139, 92, 246, 0.3)',
        ],
      },
      transition: { duration: 2, repeat: Infinity }
    }, React.createElement(FaWallet, { className: "text-white text-3xl sm:text-4xl" })),
    // ...resto del contenido sin motion
  ]);
};

export default NotConnectedMessage;
