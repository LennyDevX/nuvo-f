import React, { useMemo } from 'react';
import { 
    FaCalendar, 
    FaClock,
    FaRocket,
    FaGift,
    FaFlag,
    FaUsers,
    FaInfoCircle
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const AirdropCalendarCard = () => {
    const currentPhase = {
        phase: 1,
        start: new Date('2025-01-15'),
        end: new Date('2025-01-31'),
        maxParticipants: 50,
        reward: '5 POL'
    };

    const getPhaseStatus = (startDate, endDate) => {
        const now = new Date();
        
        if (now < startDate) {
            return {
                color: "text-yellow-400",
                text: "Coming Soon",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-500/20"
            };
        } else if (now >= startDate && now <= endDate) {
            return {
                color: "text-green-400",
                text: "Live",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-500/20"
            };
        } else {
            return {
                color: "text-red-400",
                text: "Ended",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-500/20"
            };
        }
    };

    const calendarData = useMemo(() => {
        const now = new Date();
        const timeUntilStart = currentPhase.start.getTime() - now.getTime();
        const daysUntilStart = Math.ceil(timeUntilStart / (1000 * 3600 * 24));
        const phaseStatus = getPhaseStatus(currentPhase.start, currentPhase.end);
        
        let statusText;
        if (phaseStatus.text === "Coming Soon") {
            statusText = `Starts in ${daysUntilStart} Days`;
        } else if (phaseStatus.text === "Live") {
            const daysLeft = Math.ceil((currentPhase.end - now) / (1000 * 3600 * 24));
            statusText = `${daysLeft} Days Left`;
        } else {
            statusText = "Phase Ended";
        }

        return { 
            ...currentPhase, 
            statusColor: phaseStatus.color,
            statusText,
            phaseStatus
        };
    }, []);

    const keyDates = [
        {
            date: 'Jan 15',
            event: 'Registration Opens',
            icon: <FaRocket className="text-blue-400" />
        },
        {
            date: 'Jan 25',
            event: 'Distribution Starts',
            icon: <FaGift className="text-green-400" />
        },
        {
            date: 'Jan 31',
            event: 'Phase 1 Ends',
            icon: <FaFlag className="text-red-400" />
        }
    ];

    const InfoRow = ({ icon: Icon, label, value, className = "" }) => (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <Icon className="text-purple-400" />
                <span className="text-gray-300">{label}</span>
            </div>
            <span className={`text-gray-200 ${className}`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaCalendar className="text-purple-400" />
                    <h3 className="text-lg font-medium text-gray-200">Phase 1 Calendar</h3>
                </div>
                <motion.div 
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${calendarData.phaseStatus.bgColor} ${calendarData.statusColor}`}
                    animate={{ opacity: calendarData.phaseStatus.text === "Live" ? [0.5, 1, 0.5] : 1 }}
                    transition={{ duration: 2, repeat: calendarData.phaseStatus.text === "Live" ? Infinity : 0 }}
                >
                    <FaClock className="text-sm" />
                    <span className="text-sm font-medium">
                        {calendarData.phaseStatus.text}
                    </span>
                </motion.div>
            </div>

            <div className={`bg-black/20 rounded-lg p-4 space-y-3 border ${calendarData.phaseStatus.borderColor}`}>
                <InfoRow 
                    icon={FaUsers}
                    label="Max Participants"
                    value={`${calendarData.maxParticipants} wallets`}
                />
                <InfoRow 
                    icon={FaGift}
                    label="Reward per Wallet"
                    value={calendarData.reward}
                    className="text-purple-400"
                />
                {keyDates.map((date, index) => (
                    <motion.div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-black/20"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-2">
                            {date.icon}
                            <span className="text-gray-300">{date.event}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{date.date}</span>
                    </motion.div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-400 mt-1" />
                    <div className="text-sm text-gray-300">
                        {calendarData.phaseStatus.text === "Coming Soon" 
                            ? `Registration opens January 15, 2025. First ${calendarData.maxParticipants} participants will receive ${calendarData.reward} tokens each.`
                            : calendarData.phaseStatus.text === "Live"
                            ? "Registration is now open! Claim your tokens while spots are available."
                            : "Phase 1 registration has ended. Stay tuned for the next phase!"
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AirdropCalendarCard;
