// src/components/layout/AirdropDashboard/CalendarModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';

const CalendarModal = ({ isOpen, onClose, nextAirdropDate }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create calendar days array
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Add empty cells for days before first of month
    const emptyCells = Array.from({ length: firstDay }, (_, i) => null);
    
    // Check if a date is the airdrop date
    const isAirdropDate = (day) => {
        const date = new Date(currentYear, currentMonth, day);
        return date.toDateString() === nextAirdropDate.toDateString();
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 z-10 border border-purple-500/30"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-2xl text-purple-400" />
                                <h3 className="text-xl font-bold text-white">
                                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Week days */}
                            {weekDays.map(day => (
                                <div
                                    key={day}
                                    className="text-center text-sm font-medium text-gray-400 py-2"
                                >
                                    {day}
                                </div>
                            ))}
                            
                            {/* Empty cells */}
                            {emptyCells.map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square" />
                            ))}
                            
                            {/* Days */}
                            {days.map(day => (
                                <div
                                    key={day}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-lg text-sm
                                        ${isAirdropDate(day) 
                                            ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30' 
                                            : 'text-gray-300 hover:bg-purple-500/20'}
                                        ${day === currentDate.getDate() && !isAirdropDate(day)
                                            ? 'border border-purple-500/50'
                                            : ''}
                                    `}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-600" />
                                <span className="text-gray-300">Airdrop Date</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-purple-500/50" />
                                <span className="text-gray-300">Current Date</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CalendarModal;