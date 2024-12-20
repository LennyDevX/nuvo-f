import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { globalCache } from "../utils/CacheManager";
import { globalRateLimiter } from "../utils/RateLimiter";
import useProvider from "./useProvider";

const useContractData = (account) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const provider = useProvider();

  const fetchContractData = useCallback(async (isInitialFetch = false) => {
    if (!provider || !account || !CONTRACT_ADDRESS) return;

    const cacheKey = `contract_data_${account}`;
    
    try {
      return await globalCache.get(cacheKey, async () => {
        if (!globalRateLimiter.canMakeCall(`fetch_contract_${account}`)) {
          throw new Error("Rate limit exceeded");
        }

        // ...existing contract data fetching...
      }, 30000); // 30 seconds cache
    } catch (err) {
      console.error("Error fetching contract data:", err);
      setError(err.message);
    }
  }, [provider, account, CONTRACT_ADDRESS]);

  useEffect(() => {
    fetchContractData(true);
  }, [fetchContractData]);

  return { data, error, refetch: fetchContractData };
};

export default useContractData;
