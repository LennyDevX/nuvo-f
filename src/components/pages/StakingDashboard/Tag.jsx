// src/components/layout/DashboardStaking/NetworkTag.jsx
import React from "react";

const Tag = ({ network }) => {
  return (
    <div className="text-center mt-6 space-y-2">
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-300 border border-gray-600">
        Network: <span className="text-purple-400">{network}</span>
      </span>
      <div>
        <span className="text-sm text-gray-400">Staking Protocol V1</span>
      </div>
    </div>
  );
};

export default Tag;