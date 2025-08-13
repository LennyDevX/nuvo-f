import React, { useState, useRef, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { ActionButton } from '../../ui/CommonComponents';

const EmergencyControls = ({ 
  isContractPaused, 
  totalStaked, 
  isPending, 
  showToast,
  showErrorToast,
  onEmergencyWithdraw 
}) => {
  const [showEmergencyTooltip, setShowEmergencyTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showEmergencyTooltip &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowEmergencyTooltip(false);
      }
    }

    if (showEmergencyTooltip) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmergencyTooltip]);

  // Show emergency mode panel when contract is paused
  if (isContractPaused) {
    return (
      <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <FaExclamationTriangle className="text-red-400" />
          <h3 className="text-base font-medium text-red-300">Emergency Mode Active</h3>
        </div>
        <p className="text-sm text-red-200/80 mb-3">
          The staking contract is currently paused. Emergency withdrawal is available to recover your funds.
        </p>
        <ActionButton
          onClick={onEmergencyWithdraw}
          icon={<FaExclamationTriangle />}
          label="Emergency Withdraw"
          isPrimary={false}
          disabled={isPending || totalStaked <= 0}
          className="bg-red-900/50 hover:bg-red-800/70 border-red-700/50 text-red-100"
        />
      </div>
    );
  }

  // Show subtle link when not in emergency mode but user has staked tokens
  if (totalStaked > 0) {
    return (
      <div className="text-right relative">
        <button
          ref={buttonRef}
          onClick={() => setShowEmergencyTooltip(!showEmergencyTooltip)}
          className="text-xs text-slate-500 underline flex items-center gap-1 ml-auto"
          disabled={isPending}
        >
          <FaExclamationTriangle className="text-slate-500" />
          Emergency Withdraw
        </button>

        {showEmergencyTooltip && (
          <div
            ref={tooltipRef}
            className="absolute right-0 bottom-full mb-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-left max-w-xs z-10"
          >
            <div className="font-medium text-white mb-1">Emergency Withdraw Notice</div>
            <p className="text-slate-300">
              This function is only available when the contract is paused by the administrator.
              Currently, the contract is active and operating normally.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700">
              <span className="text-green-400">Use "Withdraw All" for normal withdrawals</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default EmergencyControls;
