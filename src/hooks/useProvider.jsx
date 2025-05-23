// Update the useProvider hook with these changes

// Add a reconnect lock mechanism
let isReconnecting = false;
let lastReconnectTime = 0;

// Global state outside of component to track initialization
let isInitializing = false;
let lastInitAttempt = 0;

const useProvider = () => {
  // ...existing code...
  
  const initializeProvider = useCallback(async () => {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializing) {
      console.log("Provider initialization already in progress");
      return;
    }
    
    // Add cooldown between initialization attempts
    const now = Date.now();
    if (now - lastInitAttempt < 2000) {
      console.log("Initialization attempted too recently, skipping");
      return;
    }
    
    isInitializing = true;
    lastInitAttempt = now;
    
    try {
      // Your existing initialization logic
      // ...
      
      console.log("Provider successfully initialized");
    } catch (error) {
      console.error("Failed to initialize provider:", error);
    } finally {
      isInitializing = false;
    }
  }, [/* your dependencies */]);
  
  const reconnectWallet = async (address) => {
    // Prevent multiple simultaneous reconnects
    if (isReconnecting) {
      console.log("Provider reconnection already in progress, skipping");
      return providerRef.current;
    }
    
    // Prevent too frequent reconnects
    const now = Date.now();
    if (now - lastReconnectTime < 2000) { // 2 seconds cooldown
      console.log("Reconnection attempted too soon, skipping");
      return providerRef.current;
    }
    
    lastReconnectTime = now;
    isReconnecting = true;
    
    try {
      // Your existing reconnection logic
      console.log("Connecting to Polygon Mainnet...");
      // ...your connection code...
      
      isReconnecting = false;
      return providerRef.current;
    } catch (error) {
      console.error("Failed to reconnect:", error);
      isReconnecting = false;
      throw error;
    }
  };

  // Also ensure the initialization is only run once
  useEffect(() => {
    const initializeProvider = async () => {
      if (providerRef.current && isInitialized) {
        console.log("Provider already initialized, skipping");
        return;
      }
      
      // Your existing initialization logic
    };
    
    initializeProvider();
  }, [/* appropriate dependencies */]);
  
  // ...existing code...
};
