import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy, FaTimes, FaTag, FaStore } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';
import IPFSImage from '../../../ui/IPFSImage';
import { useTokenization } from '../../../../context/TokenizationContext';
import { getCSPCompliantImageURL } from '../../../../utils/blockchain/blockchainUtils';

// Agregar un simple sistema de caché para evitar llamadas repetidas
const nftCache = new Map();
// Caché para metadatos
const metadataCache = new Map();

// Asegurar que tengamos la dirección del contrato, ya sea de las variables de entorno o como fallback hardcoded
const CONTRACT_ADDRESS = import.meta.env.VITE_TOKENIZATION_ADDRESS || "0x98d2fC435d4269CB5c1057b5Cd30E75944ae406F";

// Log para depuración
console.log("TokenizationApp Contract Address:", CONTRACT_ADDRESS);

const NFTDetail = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { account, walletConnected } = useContext(WalletContext);
  const { nfts, listNFT, getListedToken } = useTokenization();
  
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isListed, setIsListed] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [listPrice, setListPrice] = useState('');
  const [listCategory, setListCategory] = useState('collectible');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const callCountRef = useRef(0);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      if (!tokenId) return;
      
      // Evitar múltiples peticiones simultáneas
      if (fetchingRef.current) {
        console.log("Fetch ya en progreso, evitando llamada duplicada");
        return;
      }
      
      // Verificar caché
      const cacheKey = `nft-${tokenId}`;
      if (nftCache.has(cacheKey)) {
        console.log("Usando datos cacheados para NFT", tokenId);
        const cachedData = nftCache.get(cacheKey);
        setNft(cachedData.nft);
        setLikesCount(cachedData.likesCount);
        setHasLiked(cachedData.hasLiked);
        setLoading(false);
        return;
      }
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        // Validación mejorada con logging
        console.log("Validando dirección:", CONTRACT_ADDRESS);
        console.log("Es dirección válida:", ethers.isAddress(CONTRACT_ADDRESS));

        // Formato hexadecimal correcto para dirección Ethereum
        const formattedAddress = CONTRACT_ADDRESS.trim().toLowerCase();
        
        if (!formattedAddress || !ethers.isAddress(formattedAddress)) {
          console.error("Validación fallida para dirección:", formattedAddress);
          setError("Dirección de contrato inválida o no configurada.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Validar tokenId
        if (isNaN(tokenId) || Number(tokenId) < 0) {
          setError("ID de token inválido.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        console.log("Intentando conectar con dirección:", formattedAddress);
        
        // Conectar al provider con retardo para evitar límite de tasa
        await new Promise(resolve => setTimeout(resolve, 100));
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          formattedAddress,
          TokenizationAppABI.abi,
          provider
        );

        // Obtener URI del token
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(tokenId);
          if (!tokenURI) throw new Error("El contrato no devolvió un tokenURI válido.");
          console.log("Token URI obtenido:", tokenURI);
        } catch (err) {
          console.error("Error al obtener tokenURI:", err);
          setError("No se encontró el NFT o el contrato no devolvió datos válidos.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Obtener metadata desde IPFS
        const metadata = await fetchMetadata(tokenURI);
        console.log("Metadata:", metadata);
          // Obtener detalles del token en el marketplace
        let tokenDetails;
        try {
          tokenDetails = await contract.getListedToken(tokenId);
          console.log("Token details:", tokenDetails);
        } catch (err) {
          console.error("Error al obtener detalles del token:", err);
          setError("No se pudieron obtener los detalles del token en el marketplace.");
          setLoading(false);
          fetchingRef.current = false;
          return;
        }
        
        // Obtener conteo de likes y si el usuario actual ha dado like
        let likesCount = 0;
        let hasLiked = false;
        try {
          // Verificar primero si el contrato tiene estas funciones implementadas
          if (typeof contract.getLikesCount === 'function') {
            likesCount = await contract.getLikesCount(tokenId);
            
            if (walletConnected && typeof contract.hasUserLiked === 'function') {
              hasLiked = await contract.hasUserLiked(tokenId, account);
            }
          } else {
            console.log("El contrato no implementa la función getLikesCount");
          }
        } catch (err) {
          console.warn("Error al obtener likes:", err);
          // Si falla, continuar sin likes y agregar los logs necesarios
          console.log("Continuando sin información de likes");
        }
        
        // Obtener dirección del creador/propietario original
        let owner = "";
        try {
          owner = await contract.ownerOf(tokenId);
          if (!owner || owner === ethers.ZeroAddress) {
            owner = "0x0000000000000000000000000000000000000000";
          }
        } catch (err) {
          console.warn("Error al obtener propietario:", err);
          owner = "0x0000000000000000000000000000000000000000";
        }
        
        console.log("Datos del NFT recuperados con éxito");
        
        const nftData = {
          id: tokenId, // Add id property for consistency
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
          category: tokenDetails[6],
          standard: 'ERC721' // Add standard property
        };
        
        // Guardar en caché
        nftCache.set(`nft-${tokenId}`, {
          nft: nftData,
          likesCount: likesCount.toString(),
          hasLiked
        });
        
        setNft(nftData);
        setLikesCount(likesCount.toString());
        setHasLiked(hasLiked);
        
        // Check listing status after setting NFT data
        await checkListingStatus();
      } catch (err) {
        console.error("Error fetching NFT details:", err);
        setError(err.message || "Error al cargar los detalles del NFT");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    
    fetchNFTDetails();
    
    // Limpieza para evitar actualizaciones en componentes desmontados
    return () => {
      fetchingRef.current = true; // Evita más llamadas durante desmontaje
    };
  }, [tokenId, account, walletConnected]);

  // Remove the conflicting useEffect and merge its logic into checkListingStatus
  const checkListingStatus = async () => {
    try {
      if (!tokenId) return;
      
      const listing = await getListedToken(tokenId);
      if (listing && listing.isListed) {
        setIsListed(true);
        setListingData(listing);
      }
      
      // Also check if NFT exists in the nfts array from context
      const foundNft = nfts.find(n => n.id === tokenId || n.tokenId === tokenId);
      if (foundNft && !nft) {
        setNft({
          ...foundNft,
          id: foundNft.id || foundNft.tokenId,
          tokenId: foundNft.tokenId || foundNft.id,
          standard: foundNft.standard || 'ERC721'
        });
      }
    } catch (error) {
      console.error('Error checking listing status:', error);
    }
  };

  // Función auxiliar para obtener metadatos desde IPFS
  const fetchMetadata = async (uri) => {
    try {
      if (!uri) {
        return {
          name: `NFT #${tokenId}`,
          description: 'No hay descripción disponible',
          image: '/LogoNuvos.webp',
          attributes: []
        };
      }
      
      // Verificar caché global de metadatos
      if (metadataCache.has(uri)) {
        console.log("Usando metadatos en caché para:", uri);
        return metadataCache.get(uri);
      }
      
      // Manejar diferentes formatos de URI
      let url = uri;
      
      // Normalizar URIs IPFS
      if (uri.includes('ipfs')) {
        if (uri.startsWith('ipfs://')) {
          url = uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        }
      }
      
      // Control de tiempo para evitar errores de limitación de tasa
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Configurar timeout para la petición
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error fetching metadata: ${response.statusText}`);
        }
        
        const metadata = await response.json();
        
        // Guardar en caché
        metadataCache.set(uri, metadata);
        
        return metadata;
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error("Error en fetch de metadata:", fetchErr);
        return {
          name: `NFT #${tokenId}`,
          description: 'Error al cargar metadatos',
          image: '/LogoNuvos.webp',
          attributes: []
        };
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return {
        name: `NFT #${tokenId}`,
        description: 'Error al cargar metadatos',
        image: '/LogoNuvos.webp',
        attributes: []
      };
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
      
      // Verificar si el contrato tiene la función implementada
      if (typeof contract.toggleLike !== 'function') {
        console.warn("La función toggleLike no está implementada en el contrato");
        return;
      }
      
      const tx = await contract.toggleLike(tokenId, !hasLiked);
      await tx.wait();
      
      // Actualizar estado local
      setHasLiked(!hasLiked);
      setLikesCount(prev => !hasLiked ? String(Number(prev) + 1) : String(Math.max(0, Number(prev) - 1)));
    } catch (err) {
      console.error("Error al dar/quitar like:", err);
      // No mostrar error en la UI, simplemente registrar en consola
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

  const handleListNFT = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (!walletConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setShowListModal(false);
      
      const result = await listNFT(tokenId, listPrice, listCategory);
      
      if (result.success) {
        alert('NFT listed successfully!');
        setIsListed(true);
        setListingData({
          price: result.price,
          category: result.category,
          isListed: true
        });
        // Refresh NFT data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert(error.message || 'Error listing NFT. Please try again.');
    } finally {
      setListPrice('');
      setListCategory('collectible');
    }
  };

  // Add null checks for the NFT info section
  const renderNFTInfo = () => {
    if (!nft) return null;
    
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Información del NFT</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Token ID</span>
            <span className="text-white font-medium">{nft.id || nft.tokenId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Propietario</span>
            <span className="text-white font-medium font-mono">
              {nft.owner && nft.owner !== "0x0000000000000000000000000000000000000000" 
                ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}` 
                : 'No disponible'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estándar</span>
            <span className="text-white font-medium">{nft.standard || 'ERC721'}</span>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen pt-20 pb-24 bg-nuvo-gradient relative">
      <SpaceBackground />
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Navigation - More compact */}
          <div className="mb-2 md:mb-4">
            <Link to="/my-nfts" className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors group text-sm md:text-base">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform text-sm" /> 
              Volver a mi colección
            </Link>
          </div>
          
          {/* Main Content - Responsive grid */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl md:rounded-2xl border border-purple-500/20 overflow-hidden shadow-2xl">
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              {/* Mobile Header */}
              <div className="p-3 border-b border-purple-500/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-purple-600/80 text-purple-100 text-xs rounded-full">
                    {nft.category || 'Coleccionable'}
                  </span>
                  <span className="text-gray-400 text-xs bg-gray-800/50 px-2 py-1 rounded-full">
                    ID: {nft.tokenId}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  {nft.name}
                </h1>
              </div>

              {/* Mobile Main Section - 2 Columns */}
              <div className="p-3">
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {/* Left: Compact Image - 2 columns */}
                  <div className="col-span-2">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-black/50 border border-purple-500/20">
                      <IPFSImage 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-contain p-1"
                        placeholderSrc="/LogoNuvos.webp"
                      />
                      
                      {/* Like button overlay */}
                      <div className="absolute top-1 right-1">
                        <motion.button 
                          onClick={toggleLike}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-sm transition-all text-xs ${
                            hasLiked 
                              ? 'bg-red-500/80 text-white' 
                              : 'bg-black/60 text-gray-300'
                          }`}
                        >
                          <FaHeart className="text-xs" /> 
                          <span className="text-xs">{likesCount}</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Info - 3 columns with explicit height */}
                  <div className="col-span-3 h-full">
                    <div className="flex flex-col h-full">
                      {/* Price Card */}
                      {nft.isForSale && (
                        <div className="bg-gradient-to-r from-green-900/40 to-green-800/20 p-2 rounded-lg border border-green-500/30 mb-2 flex-shrink-0">
                          <div className="flex items-center gap-1 mb-1">
                            <FaEthereum className="text-green-400 text-xs" />
                            <span className="text-gray-300 text-xs">Precio</span>
                          </div>
                          <span className="text-green-400 font-bold text-sm">
                            {ethers.formatEther(nft.price)} MATIC
                          </span>
                        </div>
                      )}
                      
                      {/* Owner Card */}
                      <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 p-2 rounded-lg border border-blue-500/30 mb-2 flex-shrink-0">
                        <div className="flex items-center gap-1 mb-1">
                          <FaUser className="text-blue-400 text-xs" />
                          <span className="text-gray-300 text-xs">Propietario</span>
                        </div>
                        <span className="text-blue-400 font-mono text-xs">
                          {nft && nft.owner && nft.owner !== "0x0000000000000000000000000000000000000000"
                            ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`
                            : 'No disponible'}
                        </span>
                      </div>

                      {/* Share Button - Improved styling and spacing */}
                      <motion.button 
                        onClick={copyToClipboard}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          flex-1 rounded-lg transition-all text-xs flex items-center justify-center gap-2 min-h-0
                          px-3 py-2.5 font-medium
                          ${copied 
                            ? 'btn-nuvo-base btn-nuvo-success text-white' 
                            : 'btn-nuvo-base btn-nuvo-ghost text-purple-300'
                          }
                        `}
                      >
                        {copied ? <FaCheck className="text-green-400 text-xs" /> : <FaShareAlt className="text-xs" />}
                        <span>{copied ? 'Copiado!' : 'Compartir'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Description - Full width with "Read More" functionality */}
                {nft.description && (
                  <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30 mb-2">
                    <h4 className="text-white font-medium text-sm mb-1.5">Descripción</h4>
                    <div>
                      <p className={`text-gray-300 text-sm leading-relaxed ${
                        !showFullDescription && nft.description.length > 150 ? 'line-clamp-3' : ''
                      }`}>
                        {nft.description}
                      </p>
                      {nft.description.length > 150 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-1 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                        >
                          {showFullDescription ? 'Leer menos' : 'Leer más'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Attributes - Compact grid */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30 mb-2">
                    <h4 className="text-white font-medium text-sm mb-1.5">Atributos</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {nft.attributes.slice(0, 4).map((attr, index) => (
                        <div key={index} className="bg-purple-900/20 rounded p-1.5 border border-purple-500/20 text-center">
                          <span className="text-purple-300 text-xs block mb-1">{attr.trait_type}</span>
                          <span className="text-white font-medium text-xs">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                    {nft.attributes.length > 4 && (
                      <p className="text-purple-400 text-xs text-center mt-1.5">
                        +{nft.attributes.length - 4} más atributos
                      </p>
                    )}
                  </div>
                )}

                {/* Additional Info Card */}
                <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30 mb-6">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Fecha listado</span>
                      <span className="text-white text-xs">
                        {nft.listedTimestamp && nft.listedTimestamp !== '0' 
                          ? new Date(Number(nft.listedTimestamp) * 1000).toLocaleDateString() 
                          : 'No listado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Estándar</span>
                      <span className="text-white text-xs">{nft.standard || 'ERC721'}</span>
                    </div>
                  </div>
                </div>

                {/* Listing Status - Fixed position and improved styling */}
                {isListed && (
                  <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-3 text-center backdrop-blur-sm mb-4">
                    <p className="text-emerald-400 font-medium text-sm">✅ NFT listado para venta</p>
                  </div>
                )}
                
                {/* List NFT Button - Only show if not listed */}
                {!isListed && (
                  <div className="mb-6">
                    <motion.button
                      onClick={() => setShowListModal(true)}
                      className="w-full btn-nuvo-base bg-nuvo-gradient-button text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaTag className="text-sm" />
                      Listar para venta
                    </motion.button>
                  </div>
                )}

                {/* Mobile Action Buttons - MOVED TO BOTTOM with better spacing */}
                <div className="fixed bottom-0 left-0 right-0 px-3 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-6 pb-4 z-10">
                  <div className="max-w-md mx-auto">
                    <motion.button
                      onClick={() => navigate('/marketplace')}
                      className="w-full btn-nuvo-base btn-nuvo-outline text-white py-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
                      whileTap={{ scale: 0.98 }}
                      style={{ 
                        marginBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' 
                      }}
                    >
                      <FaStore className="text-sm" />
                      Visitar Marketplace
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-12 gap-6 p-6">
                
                {/* Left: Image - Smaller and more compact */}
                <div className="col-span-5">
                  <div className="sticky top-6">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-black/50 border border-purple-500/20 shadow-lg">
                      <IPFSImage 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-contain p-3"
                        placeholderSrc="/LogoNuvos.webp"
                      />
                    </div>
                    
                    {/* Desktop Action Buttons - Below image with improved styling */}
                    <div className="mt-4 flex gap-3">
                      <motion.button 
                        onClick={toggleLike}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                          hasLiked 
                            ? 'btn-nuvo-base btn-nuvo-error' 
                            : 'btn-nuvo-base btn-nuvo-ghost'
                        }`}
                      >
                        <FaHeart className={hasLiked ? "text-red-400" : ""} /> 
                        <span>{likesCount}</span>
                      </motion.button>
                      
                      <motion.button 
                        onClick={copyToClipboard}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                          copied 
                            ? 'btn-nuvo-base btn-nuvo-success' 
                            : 'btn-nuvo-base btn-nuvo-secondary'
                        }`}
                      >
                        {copied ? <FaCheck className="text-green-400" /> : <FaShareAlt />} 
                        <span>{copied ? 'Copiado!' : 'Compartir NFT'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Right: Info - More space */}
                <div className="col-span-7 space-y-5">
                  {/* Header Section */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-purple-600/80 text-purple-100 text-sm rounded-full shadow-sm">
                        {nft.category || 'Coleccionable'}
                      </span>
                      <span className="text-gray-400 text-sm bg-gray-800/50 px-3 py-1 rounded-full">
                        Token ID: {nft.tokenId}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                      {nft.name}
                    </h1>
                    {nft.description && (
                      <div className="mb-4">
                        <p className={`text-gray-300 leading-relaxed ${
                          !showFullDescription && nft.description.length > 300 ? 'line-clamp-4' : ''
                        }`}>
                          {nft.description}
                        </p>
                        {nft.description.length > 300 && (
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                          >
                            {showFullDescription ? 'Leer menos' : 'Leer más'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Price Card */}
                    {nft.isForSale && (
                      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <FaEthereum className="text-green-400" />
                          <span className="text-gray-300 text-sm">Precio de venta</span>
                        </div>
                        <span className="text-green-400 font-bold text-2xl">
                          {ethers.formatEther(nft.price)} MATIC
                        </span>
                      </div>
                    )}
                    
                    {/* Owner Card */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-lg border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaUser className="text-blue-400" />
                        <span className="text-gray-300 text-sm">Propietario</span>
                      </div>
                      <span className="text-blue-400 font-mono text-lg">
                        {nft && nft.owner && nft.owner !== "0x0000000000000000000000000000000000000000"
                          ? `${nft.owner.slice(0, 8)}...${nft.owner.slice(-6)}`
                          : 'No disponible'}
                      </span>
                    </div>
                    
                    {/* Date Card */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-purple-400" />
                        <span className="text-gray-300 text-sm">Fecha de listado</span>
                      </div>
                      <span className="text-purple-400 font-medium">
                        {nft.listedTimestamp && nft.listedTimestamp !== '0' 
                          ? new Date(Number(nft.listedTimestamp) * 1000).toLocaleDateString() 
                          : 'No listado'}
                      </span>
                    </div>
                    
                    {/* Standard Card */}
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 p-4 rounded-lg border border-gray-600/30">
                      <div className="flex items-center gap-2 mb-2">
                        <FaTags className="text-gray-400" />
                        <span className="text-gray-300 text-sm">Estándar</span>
                      </div>
                      <span className="text-gray-300 font-medium">{nft.standard || 'ERC721'}</span>
                    </div>
                  </div>
                  
                  {/* Attributes */}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                      <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                        <span className="w-1 h-5 bg-purple-500 rounded-full mr-2"></span>
                        Atributos
                      </h3>
                      <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                        {nft.attributes.map((attr, index) => (
                          <div key={index} className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all text-center">
                            <span className="text-purple-300 text-xs block mb-1">{attr.trait_type}</span>
                            <div className="text-white font-medium text-sm">{attr.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Listing Status - Desktop */}
                  {isListed && (
                    <div className="bg-emerald-600/20 border border-emerald-500 rounded-lg p-4 text-center backdrop-blur-sm">
                      <p className="text-emerald-400 font-medium text-lg">✅ NFT listado para la venta</p>
                    </div>
                  )}
                  
                  {/* Action Buttons - Desktop with better spacing */}
                  <div className="space-y-4 pt-2">
                    {!isListed && (
                      <motion.button
                        onClick={() => setShowListModal(true)}
                        className="w-full btn-nuvo-base bg-nuvo-gradient-button text-white py-4 font-medium flex items-center justify-center gap-2 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaTag />
                        Listar para venta
                      </motion.button>
                    )}
                    
                    <motion.button
                      onClick={() => navigate('/marketplace')}
                      className="w-full btn-nuvo-base btn-nuvo-outline text-white py-4 font-medium flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaStore />
                      Visitar Marketplace
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Modal para listar NFT */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Listar NFT para Venta</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Precio (MATIC)</label>
                <input
                  type="number"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Categoría</label>
                <select
                  value={listCategory}
                  onChange={(e) => setListCategory(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="collectible">Coleccionable</option>
                  <option value="art">Arte</option>
                  <option value="photography">Fotografía</option>
                  <option value="music">Música</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowListModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleListNFT}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Listando...' : 'Listar NFT'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NFTDetail;