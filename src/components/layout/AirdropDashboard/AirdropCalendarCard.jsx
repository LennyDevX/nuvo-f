import React, { useMemo } from 'react';
import { FaCalendar, FaClock, FaInfoCircle } from 'react-icons/fa';

const AirdropCalendarCard = ({ weekDays, monthDays, getDateClassName }) => {
    const {
        currentMonth,
        currentYear,
        daysRemaining,
        isStarted,
        isEnded,
        startDate,
        endDate,
        statusColor,
        statusText
    } = useMemo(() => {
        const now = new Date();
        const airdropStart = new Date('2024-12-14');
        const airdropEnd = new Date('2024-12-28');
        
        // Calculate days remaining
        const timeUntilEnd = airdropEnd.getTime() - now.getTime();
        const daysUntilEnd = Math.ceil(timeUntilEnd / (1000 * 3600 * 24));
        
        // Check airdrop status
        const hasStarted = now >= airdropStart;
        const hasEnded = now >= airdropEnd;
        
        // Determine status color and text
        let color, text;
        if (hasEnded) {
            color = "text-red-400";
            text = "Airdrop Ended";
        } else if (hasStarted) {
            color = "text-green-400";
            text = `${daysUntilEnd} Days Left`;
        } else {
            color = "text-yellow-400";
            text = `Starts in ${Math.ceil((airdropStart.getTime() - now.getTime()) / (1000 * 3600 * 24))} Days`;
        }

        return {
            currentMonth: airdropStart.toLocaleString('default', { month: 'long' }),
            currentYear: airdropStart.getFullYear(),
            daysRemaining: daysUntilEnd,
            isStarted: hasStarted,
            isEnded: hasEnded,
            startDate: airdropStart.toLocaleDateString(),
            endDate: airdropEnd.toLocaleDateString(),
            statusColor: color,
            statusText: text
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaCalendar className="text-purple-400 text-xl" />
                    <h3 className="text-lg font-semibold text-white">{currentMonth} {currentYear}</h3>
                </div>
                <div className={`flex items-center gap-2 bg-purple-900/30 px-3 py-1 rounded-full ${statusColor}`}>
                    <FaClock />
                    <span className="text-sm">{statusText}</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-purple-900/30 rounded-lg p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center p-1 text-gray-400 text-sm font-medium">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {monthDays.map((day, index) => (
                        <div 
                            key={index}
                            className={`text-center p-2 ${getDateClassName(day)}`}
                        >
                            {day || '-'}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-900/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                            <div className="text-sm text-gray-300">Start</div>
                            <div className="text-blue-400 font-medium">Dec 14, 2024</div>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                            <div className="text-sm text-gray-300">Deadline</div>
                            <div className="text-red-400 font-medium">Dec 28, 2024</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-purple-400 mt-1" />
                    <p className="text-sm text-gray-300">
                        Register early to secure your spot. Limited to first <span className="text-purple-400">250</span> eligible participants.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AirdropCalendarCard;
