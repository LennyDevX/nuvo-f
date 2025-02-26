import { useContext, useState } from 'react';
import { WalletContext } from '../../../context/WalletContext';
import TicketStore from './TicketStore';
import GameModal from '../../../components/modals/GameModal'; // Nueva importación

const Game = () => {
  const { walletConnected } = useContext(WalletContext);
  const [modalOpen, setModalOpen] = useState(true); // Estado para el modal

  if (!walletConnected) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-white">
        <p>Por favor conecta tu wallet para acceder al juego.</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal para explicar el juego */}
      <GameModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <TicketStore />
    </>
  );
};

export default Game;
