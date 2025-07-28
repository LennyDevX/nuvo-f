import React, { useState, useEffect, useCallback } from 'react';
import { FaEllipsisV, FaUpload, FaSearch, FaBrain, FaImage, FaCode, FaMicrophone } from 'react-icons/fa';

const futureFeatures = [
    { id: 'web-search', icon: FaSearch, label: 'Web Search', description: 'Real-time web information' },
    { id: 'reasoning', icon: FaBrain, label: 'Advanced Reasoning', description: 'Deep analysis mode' },
    { id: 'image-gen', icon: FaImage, label: 'Image Generation', description: 'Create AI images' },
    { id: 'code-assist', icon: FaCode, label: 'Code Assistant', description: 'Programming help' },
    { id: 'voice', icon: FaMicrophone, label: 'Voice Input', description: 'Speak to chat' }
];

const FeaturesMenu = ({ isMobile, isKeyboardOpen }) => {
    const [showFeaturesMenu, setShowFeaturesMenu] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showFeaturesMenu && !e.target.closest('.features-menu-container')) {
                setShowFeaturesMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showFeaturesMenu]);

    const handleFeatureClick = useCallback((featureId) => {
        console.log(`Future feature clicked: ${featureId}`);
        setShowFeaturesMenu(false);
        // TODO: Implement feature handlers
    }, []);

    return (
        <div className={`features-menu-container relative ${isMobile && isKeyboardOpen ? 'hidden' : ''}`}>
            <button
                type="button"
                onClick={() => setShowFeaturesMenu(!showFeaturesMenu)}
                className="
                  flex items-center justify-center 
                  w-12 h-12 md:w-10 md:h-10 rounded-xl
                  bg-gray-500/30 hover:bg-gray-600 text-gray-300 hover:text-white
                  border-2 border-purple-800/20 hover:border-purple-500/50
                  transition-all duration-200 ease-out
                  shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                  touch-manipulation
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800
                "
                aria-label="More features"
                aria-expanded={showFeaturesMenu}
            >
                <FaEllipsisV className="w-4 h-4 md:w-3.5 md:h-3.5" />
            </button>

            {showFeaturesMenu && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    onClick={() => setShowFeaturesMenu(false)}
                />
            )}

            {showFeaturesMenu && (
                <div className={`
                  absolute bottom-full mb-3
                  bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl
                  overflow-hidden z-[101] animate-in slide-in-from-bottom-2 fade-in-0 duration-200
                  ${isMobile
                        ? 'right-0 w-80 max-w-[95vw]'
                        : 'right-0 w-80 max-w-[90vw]'
                    }
                `}>
                    <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-800/20 to-pink-800/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-semibold text-base">Coming Soon</h3>
                                <p className="text-gray-300 text-sm mt-1">Advanced AI features in development</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent">
                        {futureFeatures.map((feature, index) => (
                            <button
                                key={feature.id}
                                onClick={() => handleFeatureClick(feature.id)}
                                className="
                                  w-full flex items-center gap-4 p-4 
                                  text-left hover:bg-purple-600/10 active:bg-purple-600/20
                                  transition-all duration-200 ease-out
                                  min-h-[68px] touch-manipulation group
                                  focus:outline-none focus:bg-purple-600/10
                                  disabled:opacity-60 disabled:cursor-not-allowed
                                  border-b border-gray-700/50 last:border-b-0
                                "
                                disabled={true}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'fadeInUp 300ms ease-out forwards'
                                }}
                            >
                                <div className="
                                  w-12 h-12 rounded-xl 
                                  bg-gradient-to-br from-purple-600/30 to-pink-600/30
                                  flex items-center justify-center 
                                  flex-shrink-0 group-hover:scale-110 transition-transform duration-200
                                  border border-purple-500/20
                                ">
                                    <feature.icon className="w-5 h-5 text-purple-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium text-sm mb-1 group-hover:text-purple-200 transition-colors">
                                        {feature.label}
                                    </h4>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className="text-xs bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 px-3 py-1.5 rounded-full border border-yellow-500/20 font-medium">
                                        Soon
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="p-3 bg-gray-800/50 border-t border-purple-500/20">
                        <p className="text-xs text-gray-400 text-center">
                            🚀 More features coming in future updates
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturesMenu;
