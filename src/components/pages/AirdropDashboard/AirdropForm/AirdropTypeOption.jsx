import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { m } from 'framer-motion';
import { useAnimationConfig } from '../../../animation/AnimationProvider';
import memoWithName from '../../../../utils/performance/memoWithName';

const AirdropTypeOption = ({ type, formData, handleChange, getAirdropTypeStatus }) => {
  const [status, setStatus] = useState({ isRegistered: false });
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Determinar si las animaciones deben estar habilitadas
  const reduceAnimations = shouldReduceMotion || isLowPerformance;

  // Memoizar la comprobación de estado seleccionado para evitar recálculos
  const isSelected = useMemo(() => formData.airdropType === type.id, [formData.airdropType, type.id]);

  // Usar useCallback para evitar re-renderizados
  const handleClick = useCallback(() => {
    if (!type.comingSoon) {
      handleChange('airdropType', type.id);
    }
  }, [type.id, type.comingSoon, handleChange]);

  // Optimizar las llamadas al status con useEffect
  useEffect(() => {
    // Crear un flag de montado para evitar actualizar estado en componentes desmontados
    let isMounted = true;
    
    const fetchStatus = async () => {
      try {
        const result = await getAirdropTypeStatus(type.id);
        if (isMounted) {
          setStatus(result);
        }
      } catch (error) {
        console.error("Error fetching airdrop type status:", error);
      }
    };
    
    fetchStatus();
    
    return () => {
      isMounted = false;
    };
  }, [type.id, getAirdropTypeStatus]);

  // Animaciones condicionales según preferencias
  const animationProps = useMemo(() => {
    if (reduceAnimations) {
      return {};
    }
    return {
      whileHover: { scale: 1.02 }
    };
  }, [reduceAnimations]);

  return (
    <m.div
      {...animationProps}
      className={`p-4 rounded-lg cursor-pointer border ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
      } ${type.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-xl text-gray-300">{type.icon}</div>
        <div>
          <h3 className="text-gray-200">{type.name}</h3>
          <p className="text-sm text-gray-400">{type.description}</p>
          {type.comingSoon && <span className="text-xs text-yellow-500">Coming Soon</span>}
          {status.isRegistered && <span className="text-xs text-green-500">Already Registered</span>}
        </div>
      </div>
    </m.div>
  );
};

export default memoWithName(AirdropTypeOption);
