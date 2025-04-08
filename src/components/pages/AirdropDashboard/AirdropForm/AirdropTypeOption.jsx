import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion'; // Changed motion to m

const AirdropTypeOption = ({ type, formData, handleChange, getAirdropTypeStatus }) => {
  const [status, setStatus] = useState({ isRegistered: false });

  useEffect(() => {
    const fetchStatus = async () => {
      const result = await getAirdropTypeStatus(type.id);
      setStatus(result);
    };
    fetchStatus();
  }, [type.id, getAirdropTypeStatus]);

  const isSelected = formData.airdropType === type.id;

  return (
    <m.div // Changed from motion.div to m.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg cursor-pointer border ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
      } ${type.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => {
        if (!type.comingSoon) {
          handleChange('airdropType', type.id);
        }
      }}
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

export default AirdropTypeOption;
