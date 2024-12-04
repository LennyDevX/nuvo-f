// src/components/layout/TokenomicsDashboard/Roadmap.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Roadmap = () => {
  const roadmapItems = [
    { quarter: 'Q1 2024', goals: ['Lanzamiento del token', 'Auditoría de seguridad'] },
    { quarter: 'Q2 2024', goals: ['Implementación del staking', 'Expansión de la comunidad'] },
    // Añade más trimestres y objetivos según sea necesario
  ];

  return (
    <div className="bg-black/30 rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-xl font-bold text-white mb-6">Hoja de Ruta</h2>
      <div className="space-y-8">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={index}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <h3 className="text-lg font-semibold text-purple-400">{item.quarter}</h3>
            <ul className="list-disc list-inside text-gray-300">
              {item.goals.map((goal, idx) => (
                <li key={idx}>{goal}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;