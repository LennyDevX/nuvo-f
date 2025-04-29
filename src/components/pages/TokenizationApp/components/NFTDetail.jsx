import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS;

const NFTDetail = () => {
  const { tokenId } = useParams();
  const { account, walletConnected } = useContext(WalletContext);
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!tokenId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Conectar al provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TokenizationAppABI.abi,
          provider
        );
        
        // Obtener URI del token
        const tokenURI = await contract.tokenURI(tokenId);
        
        // Obtener metadata desde IPFS
        const metadata = await fetchMetadata(tokenURI);
        
        // Obtener detalles del token en el marketplace
        const tokenDetails = await contract.getListedToken(tokenId);
        
        // Obtener conteo de likes y si el usuario actual ha dado like
        const likesCount = await contract.getLikesCount(tokenId);
        const hasLiked = walletConnected ? await contract.hasUserLiked(tokenId, account) : false;
        
        // Obtener dirección del creador/propietario original
        const owner = await contract.ownerOf(tokenId);
        
        setNft({
          tokenId,
          name: metadata?.name || `NFT #${tokenId}`,
          description: metadata?.description || '',
          image: metadata?.image || '',
          attributes: metadata?.attributes || [],
          seller: tokenDetails[1],
          owner,
          price: tokenDetails[3].toString(),
          isForSale: tokenDetails[4],
          listedTimestamp: tokenDetails[5].toString(),
          category: tokenDetails[6]
        });
        
        setLikesCount(likesCount.toString());
        setHasLiked(hasLiked);
      } catch (err) {
        console.error("Error fetching NFT details:", err);
        setError(err.message || "Error al cargar los detalles del NFT");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTDetails();
  }, [tokenId, account, walletConnected]);
  
  // Función auxiliar para obtener metadatos desde IPFS
  const fetchMetadata = async (uri) => {
    try {
      if (!uri || !uri.includes('ipfs')) {
        return null;
      }
      
      // Normalizar y convertir la URI de IPFS a HTTP
      const url = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      
      const response = await fetch(url);
      const metadata = await response.json();
      return metadata;
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return null;
    }
  };
  
  // Función para dar/quitar like a un NFT
  const toggleLike = async () => {
    if (!walletConnected) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TokenizationAppABI.abi,
        signer
      );
      
      const tx = await contract.toggleLike(tokenId, !hasLiked);
      await tx.wait();
      
      // Actualizar estado local
      setHasLiked(!hasLiked);
      setLikesCount(prev => !hasLiked ? String(Number(prev) + 1) : String(Math.max(0, Number(prev) - 1)));
    } catch (err) {
      console.error("Error al dar/quitar like:", err);
    }
  };
  
  // Función para comprar un NFT
  const buyNFT = async () => {
    if (!walletConnected || !nft || !nft.isForSale) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TokenizationAppABI.abi,
        signer
      );
      
      const tx = await contract.buyToken(tokenId, {
        value: nft.price
      });
      
      await tx.wait();
      
      // Recargar datos después de la compra
      window.location.reload();
    } catch (err) {
      console.error("Error al comprar NFT:", err);
    }
  };

  // Function to copy the URL to clipboard
  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
        <SpaceBackground />
        <div className="container mx-auto px-4 py-20 flex justify-center items-center relative z-10">
          <LoadingOverlay text="Cargando detalles del NFT..." />
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
        <SpaceBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-md p-8 rounded-xl border border-red-500/20 text-center shadow-xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-300 mb-6">{error || "No se pudo cargar el NFT"}</p>
            <Link to="/my-nfts" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium inline-flex items-center transition-all">
              <FaArrowLeft className="mr-2" /> Volver a mi colección
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formatear el precio
  const formattedPrice = nft.price ? ethers.formatEther(nft.price) : '0';
  
  // Formatear la fecha de listado
  const listedDate = nft.listedTimestamp && nft.listedTimestamp !== '0' 
    ? new Date(Number(nft.listedTimestamp) * 1000).toLocaleDateString() 
    : 'No listado';

  return (
    <div className="min-h-screen pt-20 pb-16 bg-nuvo-gradient relative">
      <SpaceBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Navegación */}
          <div className="mb-6">
            <Link to="/my-nfts" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors group">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Volver a mi colección
            </Link>
          </div>
          
          {/* Contenido principal */}
          <div className="bg-black/30 backdrop-blur-md rounded-xl border border-purple-500/20 overflow-hidden shadow-2xl hover:shadow-purple-900/10 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Lado izquierdo - Imagen */}
              <div>
                <div className="bg-black/40 rounded-xl overflow-hidden aspect-square shadow-lg border border-purple-500/10">
                  <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/NFT-X1.webp'; // Imagen fallback
                    }}
                  />
                </div>
                
                {/* Acciones debajo de la imagen */}
                <div className="mt-4 flex justify-between">
                  <motion.button 
                    onClick={toggleLike}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      hasLiked 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70 border border-slate-600/30'
                    }`}
                  >
                    <FaHeart className={hasLiked ? "text-red-400" : ""} /> {likesCount}
                  </motion.button>
                  
                  <motion.button 
                    onClick={copyToClipboard}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700/70 border border-slate-600/30'
                    }`}
                  >
                    {copied ? <FaCheck className="text-green-400" /> : <FaShareAlt />} 
                    {copied ? 'Copiado!' : 'Compartir'}
                  </motion.button>
                </div>
              </div>
              
              {/* Lado derecho - Información */}
              <div>
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-purple-900/70 text-purple-200 text-xs rounded-full shadow-sm border border-purple-500/30">
                      {nft.category || 'Coleccionable'}
                    </span>
                    <span className="text-gray-400 text-sm bg-black/30 px-3 py-1 rounded-full">Token ID: {nft.tokenId}</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{nft.name}</h1>
                  <p className="text-gray-300 mb-6 leading-relaxed">{nft.description}</p>
                </div>
                
                <div className="space-y-4 mb-8 bg-black/20 p-4 rounded-xl border border-purple-500/10">
                  <div className="flex justify-between py-2 border-b border-purple-500/10">
                    <span className="text-gray-400 flex items-center"><FaUser className="mr-2 text-blue-400" /> Propietario</span>
                    <span className="text-white font-mono bg-black/30 px-2 py-1 rounded-md">{nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</span>
                  </div>
                  
                  {nft.isForSale && (
                    <div className="flex justify-between py-2 border-b border-purple-500/10">
                      <span className="text-gray-400 flex items-center"><FaEthereum className="mr-2 text-purple-400" /> Precio</span>
                      <span className="text-white flex items-center bg-green-900/30 px-2 py-1 rounded-md border border-green-500/20">
                        <FaEthereum className="mr-1 text-green-400" />
                        {formattedPrice} MATIC
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b border-purple-500/10">
                    <span className="text-gray-400 flex items-center"><FaClock className="mr-2 text-blue-400" /> Fecha de listado</span>
                    <span className="text-white flex items-center bg-black/30 px-2 py-1 rounded-md">
                      {listedDate}
                    </span>
                  </div>
                </div>
                
                {/* Atributos */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <span className="w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
                      Atributos
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                          <span className="text-purple-300 text-xs">{attr.trait_type}</span>
                          <div className="text-white font-medium">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Botones de acción */}
                <div className="space-y-3">
                  {nft.isForSale && nft.owner !== account && (
                    <motion.button 
                      onClick={buyNFT}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium flex items-center justify-center shadow-lg hover:shadow-purple-500/20 transition-all"
                    >
                      <FaEthereum className="mr-2" /> Comprar por {formattedPrice} MATIC
                    </motion.button>
                  )}
                  
                  {nft.owner === account && !nft.isForSale && (
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-white font-medium flex items-center justify-center shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                      <FaTags className="mr-2" /> Listar para venta
                    </motion.button>
                  )}
                  
                  {nft.owner !== account && !nft.isForSale && (
                    <button className="w-full py-4 bg-gray-700 rounded-lg text-white font-medium flex items-center justify-center opacity-70 cursor-not-allowed shadow-lg">
                      No disponible para venta
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTDetail;