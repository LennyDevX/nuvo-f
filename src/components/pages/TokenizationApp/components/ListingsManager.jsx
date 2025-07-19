import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { FaEdit, FaTrash, FaSyncAlt, FaCoins } from "react-icons/fa";
import MarketplaceABI from "../../../../Abi/Marketplace.json";
import { useContext } from "react";
import { WalletContext } from "../../../../context/WalletContext";
import IPFSImage from "../../../ui/IPFSImage";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import SpaceBackground from "../../../effects/SpaceBackground";

// Helpers
const formatWallet = (address) =>
  !address ? "" : `${address.slice(0, 4)}...${address.slice(-4)}`;
const formatPrice = (wei) =>
  `${parseFloat(ethers.formatEther(wei)).toFixed(2)} POL`;

const CONTRACT_ADDRESS =
  import.meta.env.VITE_TOKENIZATION_ADDRESS_V2 ||
  "0xe8f1A205ACf4dBbb08d6d8856ae76212B9AE7582";

const ListingsManager = () => {
  const { account, walletConnected } = useContext(WalletContext);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [newPrices, setNewPrices] = useState({});
  const [royaltyInfo, setRoyaltyInfo] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Fetch user's listed NFTs
  const fetchListings = useCallback(async () => {
    if (!walletConnected || !account) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, provider);

      // Get all tokens by creator (user)
      const tokenIds = await contract.getTokensByCreator(account);

      // Get listed tokens for sale by user
      const listed = [];
      for (const tokenId of tokenIds) {
        const token = await contract.getListedToken(tokenId);
        if (token[4]) { // isForSale
          // Fetch metadata
          let metadata = {};
          try {
            const tokenURI = await contract.tokenURI(tokenId);
            const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const resp = await fetch(url);
            metadata = await resp.json();
          } catch {
            metadata = {};
          }
          listed.push({
            tokenId,
            price: token[3],
            category: token[6],
            metadata,
            seller: token[1],
            isForSale: token[4],
          });
        }
      }
      setListings(listed);

      // Fetch royalty info for each token
      const royalties = {};
      for (const l of listed) {
        try {
          const [receiver, amount] = await contract.royaltyInfo(l.tokenId, l.price);
          royalties[l.tokenId] = {
            receiver,
            amount: ethers.formatEther(amount),
          };
        } catch {
          royalties[l.tokenId] = { receiver: "-", amount: "0" };
        }
      }
      setRoyaltyInfo(royalties);
    } catch (err) {
      toast.error("Error loading listings");
    } finally {
      setLoading(false);
    }
  }, [account, walletConnected, refreshFlag]);

  // Listen to contract events for real-time updates
  useEffect(() => {
    if (!walletConnected || !account) return;
    let contract, provider;
    let listeners = [];
    (async () => {
      provider = new ethers.BrowserProvider(window.ethereum);
      contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, provider);

      // Helper to refresh listings on relevant events
      const refresh = () => setRefreshFlag((f) => f + 1);

      // TokenSold, TokenPriceUpdated, OfferCreated
      listeners = [
        contract.on("TokenSold", refresh),
        contract.on("TokenPriceUpdated", refresh),
        contract.on("OfferCreated", refresh),
        contract.on("TokenUnlisted", refresh),
      ];
    })();

    return () => {
      if (contract && listeners.length) {
        listeners.forEach((off) => {
          try { contract.off(off); } catch {}
        });
      }
    };
  }, [walletConnected, account]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Unlist NFT
  const handleUnlist = async (tokenId) => {
    if (!walletConnected) return;
    setUpdating((u) => ({ ...u, [tokenId]: true }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);
      const tx = await contract.unlistedToken(tokenId);
      toast("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      toast.success("NFT unlisted!");
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      toast.error("Failed to unlist NFT");
    } finally {
      setUpdating((u) => ({ ...u, [tokenId]: false }));
    }
  };

  // Update price
  const handleUpdatePrice = async (tokenId) => {
    if (!walletConnected) return;
    setUpdating((u) => ({ ...u, [tokenId]: true }));
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceABI.abi, signer);
      const priceWei = ethers.parseEther(newPrices[tokenId] || "0");
      const tx = await contract.updatePrice(tokenId, priceWei);
      toast("Updating price...");
      await tx.wait();
      toast.success("Price updated!");
      setRefreshFlag((f) => f + 1);
    } catch (err) {
      toast.error("Failed to update price");
    } finally {
      setUpdating((u) => ({ ...u, [tokenId]: false }));
    }
  };

  if (!walletConnected) {
    return (
      <div className="p-8 text-center text-gray-400">
        Connect your wallet to manage your listings.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <SpaceBackground />
      <div className="max-w-4xl mx-auto py-10 px-2 relative z-10">
        <h2 className="text-2xl font-bold mb-8 text-white tracking-tight bg-nuvo-gradient-text">My NFT Listings</h2>
        {loading ? (
          <LoadingSpinner />
        ) : listings.length === 0 ? (
          <div className="text-gray-400 text-center py-12">You have no NFTs listed for sale.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {listings.map((l) => (
              <div
                key={l.tokenId}
                className="flex flex-col md:flex-row items-center bg-gray-900/80 border border-gray-700/70 rounded-xl p-4 gap-6 shadow-lg hover:shadow-purple-900/30 transition-all"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                  <IPFSImage
                    src={l.metadata?.image}
                    alt={l.metadata?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="text-lg font-semibold text-white">{l.metadata?.name || `NFT #${l.tokenId}`}</div>
                      <div className="text-xs text-purple-400 mb-1">
                        #{l.tokenId} <span className="mx-1">|</span> <span className="capitalize">{l.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-300 text-sm">Price:</span>
                      <span className="font-bold text-blue-400 text-base">{formatPrice(l.price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/70 px-3 py-1 rounded-lg">
                      <FaCoins className="text-yellow-400" />
                      Royalty: <span className="text-white">{royaltyInfo[l.tokenId]?.amount || "0"} POL</span>
                      <span className="ml-2 text-purple-400 font-mono">{formatWallet(royaltyInfo[l.tokenId]?.receiver)}</span>
                    </div>
                    
                    <form
                      className="flex gap-2 items-center"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdatePrice(l.tokenId);
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="New price"
                        value={newPrices[l.tokenId] || ""}
                        onChange={(e) =>
                          setNewPrices((p) => ({
                            ...p,
                            [l.tokenId]: e.target.value,
                          }))
                        }
                        className="w-20 p-1 rounded bg-gray-900 text-white border border-gray-700 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        disabled={updating[l.tokenId]}
                      />
                      <button
                        type="submit"
                        className="btn-nuvo-base btn-nuvo-success flex items-center gap-1"
                        disabled={updating[l.tokenId] || !newPrices[l.tokenId]}
                      >
                        {updating[l.tokenId] ? <FaSyncAlt className="animate-spin" /> : <FaEdit />}
                        Update Price
                      </button>
                    </form>
                    <div className="flex gap-2">
                      <button
                        className="btn-nuvo-base bg-nuvo-gradient-button flex items-center gap-2"
                        disabled={updating[l.tokenId]}
                        onClick={() => handleUnlist(l.tokenId)}
                      >
                        {updating[l.tokenId] ? <FaSyncAlt className="animate-spin" /> : <FaTrash />}
                        Unlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsManager;
