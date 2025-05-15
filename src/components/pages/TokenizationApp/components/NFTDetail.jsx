import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaArrowLeft, FaEthereum, FaHeart, FaShareAlt, FaTags, FaClock, FaUser, FaCheck, FaCopy } from 'react-icons/fa';
import { WalletContext } from '../../../../context/WalletContext';
import SpaceBackground from '../../../effects/SpaceBackground';
import LoadingOverlay from '../../../ui/LoadingOverlay';
import TokenizationAppABI from '../../../../Abi/TokenizationApp.json';

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
  const { account, walletConnected } = useContext(WalletContext);
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
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
  
  // Función auxiliar para obtener metadatos desde IPFS
  const fetchMetadata = async (uri) => {
    try {
      if (!uri) {
        return {
          name: `NFT #${tokenId}`,
          description: 'No hay descripción disponible',
          image: '/NFT-X1.webp',
          attributes: []
        };      }
      
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
          image: '/NFT-X1.webp',
          attributes: []
        };
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return {
        name: `NFT #${tokenId}`,
        description: 'Error al cargar metadatos',
        image: '/NFT-X1.webp',
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