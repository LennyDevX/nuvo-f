import { useState, useEffect } from 'react';
import Tooltip from '../../common/Tooltip';
import TicketList from './TicketList';
import { motion } from 'framer-motion';
import { FaTrophy, FaHistory, FaChartLine } from 'react-icons/fa';
import { TICKET_COST, COUNTDOWN_SECONDS, TICKET_TIERS } from './constants';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const generateTicketWeight = () => Math.floor(Math.random() * 901) + 100;

const TicketStore = () => {
  const [tokens, setTokens] = useState(100);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [treasury, setTreasury] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [lotteryHistory, setLotteryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userStats, setUserStats] = useState({
    totalWins: 0,
    bestTier: null,
    totalSpent: 0,
    totalEarned: 0
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const determineTicketTier = (weight) => {
    return Object.entries(TICKET_TIERS).find(([_, tier]) => 
      weight >= tier.weight[0] && weight <= tier.weight[1]
    )[0];
  };

  const buyTicket = () => {
    if (tokens < TICKET_COST) return alert('Tokens insuficientes');
    const weight = generateTicketWeight();
    const tier = determineTicketTier(weight);
    
    setTokens(prev => prev - TICKET_COST);
    setTreasury(prev => prev + TICKET_COST);
    setTickets(prev => [...prev, {
      id: prev.length + 1,
      weight,
      tier,
      purchaseDate: new Date()
    }]);
  };

  useEffect(() => {
    if (countdown <= 0 && tickets.length > 0) {
      const totalWeight = tickets.reduce((sum, ticket) => sum + ticket.weight, 0);
      const rnd = Math.random() * totalWeight;
      let cumulative = 0, winnerTicket = null;
      
      for (let ticket of tickets) {
        cumulative += ticket.weight;
        if (rnd <= cumulative) {
          winnerTicket = ticket;
          break;
        }
      }

      const prize = treasury * 0.85;
      
      setLotteryHistory(prev => [{
        date: new Date(),
        winnerTicket,
        prize,
        totalTickets: tickets.length
      }, ...prev]);

      setTreasury(0);
      setTickets([]);
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [countdown, tickets, treasury]);

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-12 text-center">
          <header className="relative z-10">
            <motion.h1 
              className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              Nuvo Lottery
            </motion.h1>
            <p className="text-gray-400">Participa en el sorteo más exclusivo de la blockchain</p>
          </header>
          
          {/* Nueva barra de progreso circular */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-20">
            <div className="w-48 h-48">
              <CircularProgressbar 
                value={(COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS * 100}
                strokeWidth={2}
                styles={buildStyles({
                  pathColor: '#8b5cf6',
                  trailColor: '#1f2937'
                })}
              />
            </div>
          </div>
        </div>

        {/* Nueva sección de estadísticas personales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatsCard
            title="Tus Tokens"
            value={`${tokens} NUVO`}
            icon={<FaChartLine />}
            gradient="from-purple-500/20 to-purple-900/20"
          />
          <StatsCard
            title="Bolsa Actual"
            value={`${treasury} NUVO`}
            icon={<FaTrophy />}
            gradient="from-blue-500/20 to-blue-900/20"
          />
          <StatsCard
            title="Próximo Sorteo"
            value={formatTime(countdown)}
            icon={<FaHistory />}
            gradient="from-pink-500/20 to-pink-900/20"
          />
          <StatsCard
            title="Tus Victorias"
            value={userStats.totalWins}
            icon={<FaTrophy />}
            gradient="from-yellow-500/20 to-yellow-900/20"
          />
        </div>

        {/* Botón de compra mejorado */}
        <div className="flex justify-center mb-12">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={buyTicket}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                     rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            Comprar Ticket ({TICKET_COST} NUVO)
          </motion.button>
        </div>

        {/* Grid de contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TicketList tickets={tickets} />
          </div>
          
          {/* Panel lateral con historial y ranking */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" />
                Ranking de Ganadores
              </h3>
              {lotteryHistory.slice(0, 5).map((lottery, index) => (
                <div key={index} 
                     className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Ticket #{lottery.winnerTicket.id}</span>
                    <span className="text-purple-400">{lottery.prize.toFixed(2)} NUVO</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatsCard = ({ title, value, icon, gradient }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`bg-gradient-to-br ${gradient} p-6 rounded-xl border border-slate-700/50`}
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-gray-400 font-medium">{title}</h3>
    </div>
    <p className="text-2xl font-semibold text-white">{value}</p>
  </motion.div>
);

export default TicketStore;
