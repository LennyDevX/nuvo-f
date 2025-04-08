import { m, AnimatePresence } from 'framer-motion'; // Changed motion to m

const GameModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <m.div // Changed from motion.div to m.div
        className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <m.div // Changed from motion.div to m.div
          className="bg-gradient-to-br from-gray-900/95 via-purple-900/20 to-gray-900/95 rounded-xl p-6 sm:p-8 max-w-md w-full border border-purple-500/20 shadow-[0_0_3rem_-0.5rem_#8b5cf6] relative"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Nuvo Lottery
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Beta
            </span>
          </div>

          <div className="space-y-4 text-gray-100">
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <h3 className="text-sm font-medium text-purple-400 mb-2">
                🎮 Cómo Jugar
              </h3>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Compra tickets usando tus tokens NUVO</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Cada ticket tiene un peso aleatorio que afecta tus probabilidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Existen 4 niveles de tickets: Común, Raro, Épico y Legendario</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>El sorteo se realiza automáticamente al finalizar el contador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>El ganador recibe el 85% del pozo acumulado</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <h3 className="text-sm font-medium text-blue-400 mb-2">
                💎 Probabilidades por Nivel
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>Común: 100-300</div>
                <div>Raro: 301-600</div>
                <div>Épico: 601-800</div>
                <div>Legendario: 801-1000</div>
              </div>
            </div>

            <p className="text-xs text-gray-400 italic">
              Nota: Cuanto mayor sea el peso de tu ticket, mayores serán tus probabilidades de ganar.
            </p>
          </div>

          <m.button // Changed from motion.button to m.button
            onClick={onClose}
            className="w-full mt-6 py-2.5 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 
                     text-white font-medium text-sm hover:from-purple-600 hover:to-blue-600 
                     transition-all duration-300 transform hover:scale-[1.02] 
                     shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ¡Empezar a Jugar!
          </m.button>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
};

export default GameModal;
