import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useSpring, useTrail, animated, config } from "@react-spring/web";
import DodoSwapWidget from "../web3/SwapDodo";
import { WalletContext } from "../../context/WalletContext";
import SpaceBackground from "../effects/SpaceBackground";

const SwapToken = () => {
  const { account, network, balance } = useContext(WalletContext);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const isWalletConnected = useMemo(() => 
    Boolean(account && network && balance !== null),
    [account, network, balance]
  );

  useEffect(() => {
    setIsConnected(isWalletConnected);
  }, [isWalletConnected]);

  const handleError = useCallback((err) => {
    console.error('Swap error:', err);
    setError(err?.message || 'An error occurred');
  }, []);

  const handleLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const handleTransactionStatus = useCallback((status) => {
    setTransactionStatus(status);
  }, []);

  // React Spring animations
  const titleAnimation = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 20 }
  });

  // Animation for title letters
  const titleLetters = "Nuvos Swap";
  const trail = useTrail(titleLetters.length, {
    from: { opacity: 0, x: 3 },
    to: { opacity: 1, x: 0 },
    config: { mass: 1, tension: 280, friction: 60 },
    delay: 400,
  });

  const subtitleAnimation = useSpring({
    from: { opacity: 0, x: 5 },
    to: { opacity: 1, x: 0 },
    delay: 1700,
    config: { duration: 1000 }
  });

  const contentAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: isConnected ? 200 : 0,
    config: { duration: 600 }
  });

  const pulseAnimation = useSpring({
    from: { opacity: 0.7 },
    to: { opacity: 1 },
    config: { duration: 800, loop: true },
    pause: !isLoading
  });

  const statusAnimation = useSpring({
    from: { opacity: 0, y: 50 },
    to: { opacity: transactionStatus ? 1 : 0, y: transactionStatus ? 0 : 50 },
    config: config.gentle
  });

  const errorAnimation = useSpring({
    opacity: error ? 1 : 0,
    config: { duration: 300 }
  });

  const NetworkBadge = useMemo(() => () => (
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
      <div className={`w-2 h-2 rounded-full ${network ? 'bg-green-500' : 'bg-red-500'}`}></div>
      {network || 'Not Connected'}
    </div>
  ), [network]);

  const TransactionStatus = useMemo(() => () => (
    transactionStatus && (
      <animated.div 
        style={statusAnimation}
        className="fixed bottom-4 right-4 bg-purple-600/90 p-4 rounded-lg"
      >
        <p className="text-white">Transaction {transactionStatus}</p>
      </animated.div>
    )
  ), [transactionStatus, statusAnimation]);

  const widgetProps = useMemo(() => ({
    onError: handleError,
    onLoading: handleLoading,
    onTransactionStatus: handleTransactionStatus
  }), [handleError, handleLoading, handleTransactionStatus]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <animated.div 
          style={pulseAnimation}
          className="space-y-4 w-full max-w-[380px] mx-auto px-4"
        >
          <div className="h-12 bg-purple-600/20 rounded"></div>
          <div className="h-12 bg-purple-600/20 rounded"></div>
          <div className="h-12 bg-purple-600/20 rounded"></div>
        </animated.div>
      );
    }

    if (!isConnected) {
      return (
        <animated.div
          style={contentAnimation}
          className="text-center mt-8 px-4"
        >
          <p className="text-white text-xl">
            Por favor, conecta tu wallet usando el botón en la barra de navegación.
          </p>
        </animated.div>
      );
    }

    return (
      <div className="flex justify-center items-center w-full">
        <animated.div
          style={contentAnimation}
          className="w-full flex justify-center items-center"
        >
          <DodoSwapWidget {...widgetProps} />
        </animated.div>
      </div>
    );
  }, [isLoading, isConnected, widgetProps, contentAnimation, pulseAnimation]);

  return (
    <div className="bg-nuvo-gradient min-h-screen pt-20 sm:pt-24 md:py-16 flex flex-col items-center justify-start sm:justify-center">
      <SpaceBackground customClass="opacity-90" />
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <animated.div
          style={titleAnimation}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Animated title */}
          <div className="mb-4 overflow-hidden">
            <div className="inline-flex">
              {trail.map((props, index) => (
                <animated.span
                  key={index}
                  style={props}
                  className="inline-block text-transparent bg-clip-text bg-nuvo-gradient-text
                          drop-shadow-[0_0_0px_rgba(139,92,246,0.6)] 
                          text-2xl sm:text-4xl md:text-5xl font-bold"
                >
                  {titleLetters[index] === ' ' ? '\u00A0' : titleLetters[index]}
                </animated.span>
              ))}
            </div>
          </div>
          
          <animated.p 
            style={subtitleAnimation}
            className="text-white text-sm sm:text-base md:text-lg px-2 sm:px-4 font-medium"
          >
            Intercambia tus tokens de manera rápida y segura
          </animated.p>
        </animated.div>

        {/* Adjust NetworkBadge margins */}
        <div className="mb-4 sm:mb-6">
          <NetworkBadge />
        </div>

        {error && (
          <animated.div 
            style={errorAnimation}
            className="bg-red-500/10 text-red-500 p-3 sm:p-4 rounded-lg mb-4 mx-2 sm:mx-0"
          >
            {error}
          </animated.div>
        )}

        <div className="w-full flex justify-center items-center px-2 sm:px-0">
          {renderContent}
        </div>

        {/* Adjust TransactionStatus position for mobile */}
        <div className="fixed bottom-4 right-2 sm:right-4 z-50">
          <TransactionStatus />
        </div>
      </div>
    </div>
  );
};

export default React.memo(SwapToken);