import React, { useState, useEffect, useMemo } from 'react';
import { m } from 'framer-motion';
import { FaUsers, FaChartLine, FaLayerGroup, FaRocket, FaExchangeAlt, FaCalendarAlt, FaLightbulb, FaCheckCircle, FaTrophy, FaGlobe } from 'react-icons/fa';

const KeyMetrics = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let timeoutId = null;
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const ecosystemServices = useMemo(() => [
    { 
      name: "Cloud Storage & Computing", 
      status: "Active",
      date: "Current" 
    },
    { 
      name: "Developer Rewards Program", 
      status: "Coming Soon",
      date: "Q3 2025" 
    },
    { 
      name: "NFT Infrastructure", 
      status: "Planned",
      date: "Q4 2025" 
    },
    { 
      name: "DeFi Integration Suite", 
      status: "Planned",
      date: "Q2 2026" 
    },
    { 
      name: "Enterprise Solutions", 
      status: "Roadmap",
      date: "Q3 2026" 
    }
  ], []);

  const getStatusClass = useMemo(() => (status) => {
    switch (status) {
      case 'Active': return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'Coming Soon': return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      default: return 'bg-purple-900/30 text-purple-300 border border-purple-500/30';
    }
  }, []);

  const gridClass = useMemo(() => 
    `grid grid-cols-1 ${isMobile ? 'md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-5`,
    [isMobile]
  );

  const MissionVisionCard = useMemo(() => (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-5 border border-purple-500/30 transition-all hover:border-purple-500/50">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-purple-500/30 rounded-lg mr-4">
          <FaLightbulb className="text-purple-300 text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-lg">Nuestra Visión para NUVOS CLOUD</h3>
          <p className="text-gray-300 text-sm mt-1">Transformando el almacenamiento y computación en la nube con tecnología blockchain</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-400 mr-2" />
            <h4 className="text-white font-medium">Descentralización</h4>
          </div>
          <p className="text-gray-400 text-sm">Infraestructura cloud distribuida y resistente a censura para un internet más libre.</p>
        </div>
        <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaTrophy className="text-yellow-400 mr-2" />
            <h4 className="text-white font-medium">Ecosistema Sostenible</h4>
          </div>
          <p className="text-gray-400 text-sm">We're building tools that empower anyone to tokenize assets without technical expertise. From collectibles to real estate, from artwork to equipment, our platform enables users to transform physical value into digital opportunities through a seamless, accessible process.</p>
        </div>
        <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
          <div className="flex items-center mb-2">
            <FaGlobe className="text-blue-400 mr-2" />
            <h4 className=" font-medium">Adopción Global</h4>
          </div>
          <p className='text-gray-400'>Our platform serves as a foundation where tokenized assets can interact with the broader digital economy. Users can showcase their tokenized items in our NFT marketplace, implement novel utility through smart contracts, or integrate with complementary services in the web3 ecosystem. </p></div>
      </div>
    </div>
  ), []);

  const UtilityGrowthCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaChartLine className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Evolución de Utilidad</h3>
      </div>
      
      <p className="text-xs text-gray-400 mb-4">Expansión planificada de servicios y utilidad del token NUVOS dentro del ecosistema</p>
      
      <div className="space-y-4">
        {['Current', 'Q1 2025', 'Q4 2027'].map((period, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{period}</span>
              <span className="text-purple-300">
                {period === 'Current' ? 'Servicios Básicos' : 
                 period === 'Q1 2025' ? 'Integración Completa' : 'Adopción Global'}
              </span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div 
                className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                style={{ 
                  width: period === 'Current' ? '10%' : 
                         period === 'Q1 2025' ? '40%' : '90%',
                  transition: 'width 1s ease-out'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {period === 'Current' ? 'Almacenamiento cloud básico, staking y recompensas' : 
               period === 'Q1 2025' ? 'NFTs, marketplace, computación distribuida' : 
               'Sistema completo con integraciones enterprise y DeFi'}
            </p>
          </div>
        ))}
      </div>
    </div>
  ), []);

  const TokenEconomicsCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaExchangeAlt className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Tokenomics</h3>
      </div>
      
      <p className="text-xs text-gray-400 mb-4">Diseñado para maximizar utilidad y asegurar sostenibilidad a largo plazo</p>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-black/40 p-3 rounded-lg border border-purple-500/10">
          <p className="text-gray-400 text-xs">Suministro Total</p>
          <p className="text-white font-medium">21,000,000</p>
          <p className="text-gray-500 text-xs mt-1">Suministro fijo y deflacionario</p>
        </div>
        <div className="bg-black/40 p-3 rounded-lg border border-purple-500/10">
          <p className="text-gray-400 text-xs">Suministro Circulante Inicial</p>
          <p className="text-white font-medium">1,000,000</p>
          <p className="text-gray-500 text-xs mt-1">~4.8% del total</p>
        </div>
        <div className="bg-black/40 p-3 rounded-lg border border-purple-500/10">
          <p className="text-gray-400 text-xs">Tipo de Token</p>
          <p className="text-white font-medium">ERC-20</p>
          <p className="text-gray-500 text-xs mt-1">En red Polygon</p>
        </div>
        <div className="bg-black/40 p-3 rounded-lg border border-purple-500/10">
          <p className="text-gray-400 text-xs">Utilidad Principal</p>
          <p className="text-white font-medium">Acceso a Servicios</p>
          <p className="text-gray-500 text-xs mt-1">Almacenamiento, computación, NFTs</p>
        </div>
      </div>
    </div>
  ), []);

  const DevelopmentTimelineCard = useMemo(() => (
    <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaRocket className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Timeline de Desarrollo</h3>
      </div>
      
      <div className="relative pl-6 mt-6">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-600/40"></div>
        
        <div className="mb-6 relative">
          <div className="absolute left-[-12px] w-5 h-5 rounded-full bg-green-500 border-2 border-green-700"></div>
          <div className="ml-4">
            <h4 className="text-green-400 font-medium text-sm">Completado (Q2 2023)</h4>
            <p className="text-white text-xs mt-1">Lanzamiento inicial de NUVOS CLOUD</p>
            <p className="text-gray-400 text-xs mt-1">Infraestructura básica, staking y creación del token</p>
          </div>
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute left-[-12px] w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-700"></div>
          <div className="ml-4">
            <h4 className="text-blue-400 font-medium text-sm">En Progreso (Q2 2024)</h4>
            <p className="text-white text-xs mt-1">Expansión de Servicios</p>
            <p className="text-gray-400 text-xs mt-1">Almacenamiento mejorado, programa de recompensas y descentralización</p>
          </div>
        </div>
        
        <div className="mb-6 relative">
          <div className="absolute left-[-12px] w-5 h-5 rounded-full bg-purple-500/70 border-2 border-purple-700"></div>
          <div className="ml-4">
            <h4 className="text-purple-300 font-medium text-sm">Próximamente (Q1 2025)</h4>
            <p className="text-white text-xs mt-1">Marketplace de NFTs</p>
            <p className="text-gray-400 text-xs mt-1">Lanzamiento del mercado NFT integrado con utilidad en el ecosistema</p>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute left-[-12px] w-5 h-5 rounded-full bg-purple-500/40 border-2 border-purple-700"></div>
          <div className="ml-4">
            <h4 className="text-purple-300 font-medium text-sm">Futuro (Q4 2025)</h4>
            <p className="text-white text-xs mt-1">Integración DeFi y Exchange</p>
            <p className="text-gray-400 text-xs mt-1">Listado en DEX y desarrollo de integraciones DeFi nativas</p>
          </div>
        </div>
      </div>
    </div>
  ), []);

  const AdoptionMetricsCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaUsers className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Adoption Projections</h3>
      </div>
      <div className="space-y-4 mt-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Current Participants</span>
            <span className="text-purple-300">2,500+</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
              style={{ width: '5%' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Q4 2025 Target</span>
            <span className="text-purple-300">25,000+</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
              style={{ width: '25%' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Q4 2026 Projection</span>
            <span className="text-purple-300">100,000+</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    </div>
  ), []);

  const EcosystemServicesCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaLayerGroup className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Ecosystem Services</h3>
      </div>
      <ul className="space-y-2 text-sm">
        {ecosystemServices.map((service, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="text-gray-300">{service.name}</span>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">{service.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(service.status)}`}>
                {service.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ), [ecosystemServices, getStatusClass]);

  const ReleaseScheduleCard = useMemo(() => (
    <div className="bg-purple-900/20 rounded-lg p-5 border border-purple-500/20 transition-all hover:border-purple-500/40 hover:bg-purple-900/30">
      <div className="flex items-center mb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
          <FaCalendarAlt className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Release Schedule</h3>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between items-center">
          <span className="text-gray-300">Seed Round</span>
          <span className="text-xs text-purple-300">10% (10M) - 2-year lockup</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-gray-300">Team & Advisors</span>
          <span className="text-xs text-purple-300">15% (15M) - 4-year vest</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-gray-300">Platform Rewards</span>
          <span className="text-xs text-purple-300">25% (25M) - 5-year unlocks</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-gray-300">Ecosystem Growth</span>
          <span className="text-xs text-purple-300">30% (30M) - Conditional</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-gray-300">Community Reserve</span>
          <span className="text-xs text-purple-300">20% (20M) - Time-locked</span>
        </li>
      </ul>
    </div>
  ), []);

  return (
    <m.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Tokenomics and roadmap </h2>
          <p className="text-gray-400 text-sm mt-1">
            Transformando el poder de la tokenizacion y expandiendo las utilidades de la nube con tecnología blockchain al mundo fisico y real.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 bg-purple-900/30 px-3 py-1 rounded-md border border-purple-500/20">
          <span className="text-xs text-purple-300">Estado: <span className="text-green-400 font-medium">En Desarrollo Activo</span></span>
        </div>
      </div>

      {MissionVisionCard}
      
      <div className={`${gridClass} mt-6`}>
        {UtilityGrowthCard}
        {EcosystemServicesCard}
        {AdoptionMetricsCard}
        {DevelopmentTimelineCard}
        {TokenEconomicsCard}
        {ReleaseScheduleCard}
      </div>
      
      <div className="mt-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-5 border border-blue-500/30">
        <div className="flex items-start">
          <div className="p-3 bg-blue-500/20 rounded-full mr-4">
            <FaRocket className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-blue-300 font-medium text-lg">Próximos Objetivos Estratégicos</h3>
            <p className="text-gray-400 text-sm mt-2">
              Estamos enfocados en construir una infraestructura robusta y una utilidad real antes de buscar listados en exchanges y pools de liquidez. Este enfoque garantiza que NUVOS CLOUD ofrezca un valor genuino y una propuesta sostenible a largo plazo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-black/30 p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-sm font-medium">Infraestructura</h4>
                <p className="text-gray-500 text-xs mt-1">Mejora continua de la estabilidad, seguridad y capacidad del sistema</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-sm font-medium">Comunidad</h4>
                <p className="text-gray-500 text-xs mt-1">Expansión de la base de usuarios y mejora del programa de participación</p>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-blue-500/20">
                <h4 className="text-white text-sm font-medium">Desarrollo</h4>
                <p className="text-gray-500 text-xs mt-1">Implementación de nuevas funciones y servicios basados en feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default React.memo(KeyMetrics);
