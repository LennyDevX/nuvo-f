import { motion } from 'framer-motion';
import Tooltip from '../../common/Tooltip';
import { TICKET_TIERS } from './constants';

const TicketList = ({ tickets }) => {
  const totalWeight = tickets.reduce((acc, ticket) => acc + ticket.weight, 0);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20"
    >
      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
        Tus Tickets
      </h2>
      {tickets && tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const chance = totalWeight > 0 ? (ticket.weight / totalWeight) * 100 : 0;
            const tierData = TICKET_TIERS[ticket.tier];
            
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/30 to-slate-800/30 
                         rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tierData.color }}
                    whileHover={{ scale: 1.5 }}
                  />
                  <span className="text-white font-medium">#{ticket.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${tierData.color}20`,
                          color: tierData.color,
                          border: `1px solid ${tierData.color}40`
                        }}>
                    {tierData.name}
                  </span>
                </div>
                <Tooltip text="Probabilidad de ganar">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${chance}%`,
                          backgroundColor: tierData.color 
                        }}
                      />
                    </div>
                    <span className="text-gray-300 text-sm">{chance.toFixed(1)}%</span>
                  </div>
                </Tooltip>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-400 p-8">
          No tienes tickets activos
        </motion.p>
      )}
    </motion.div>
  );
};

export default TicketList;
