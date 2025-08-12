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
                        ? 'left-1/2 transform -translate-x-1/2 w-[75vw] max-w-[280px]'
                        : 'right-0 w-80 max-w-[90vw]'
                    }
                `}>
                    <div className={`border-b border-purple-500/20 bg-gradient-to-r from-purple-800/20 to-pink-800/20 ${
                        isMobile ? 'p-3' : 'p-4'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-white font-semibold ${
                                    isMobile ? 'text-sm' : 'text-base'
                                }`}>Coming Soon</h3>
                                <p className={`text-gray-300 mt-1 ${
                                    isMobile ? 'text-xs' : 'text-sm'
                                }`}>Advanced AI features in development</p>
                            </div>
                            <div className={`rounded-full bg-purple-600/20 flex items-center justify-center ${
                                isMobile ? 'w-6 h-6' : 'w-8 h-8'
                            }`}>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    <div className={`overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-transparent ${
                        isMobile ? 'max-h-56' : 'max-h-72'
                    }`}>
                        {futureFeatures.map((feature, index) => (
                            <button
                                key={feature.id}
                                onClick={() => handleFeatureClick(feature.id)}
                                className={`
                                  w-full flex items-center text-left hover:bg-purple-600/10 active:bg-purple-600/20
                                  transition-all duration-200 ease-out touch-manipulation group
                                  focus:outline-none focus:bg-purple-600/10
                                  disabled:opacity-60 disabled:cursor-not-allowed
                                  border-b border-gray-700/50 last:border-b-0
                                  ${
                                    isMobile 
                                      ? 'gap-3 p-3 min-h-[56px]' 
                                      : 'gap-4 p-4 min-h-[68px]'
                                  }
                                `}
                                disabled={true}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'fadeInUp 300ms ease-out forwards'
                                }}
                            >
                                <div className={`
                                  rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30
                                  flex items-center justify-center 
                                  flex-shrink-0 group-hover:scale-110 transition-transform duration-200
                                  border border-purple-500/20
                                  ${
                                    isMobile 
                                      ? 'w-10 h-10' 
                                      : 'w-12 h-12'
                                  }
                                `}>
                                    <feature.icon className={`text-purple-300 ${
                                        isMobile ? 'w-4 h-4' : 'w-5 h-5'
                                    }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-white font-medium group-hover:text-purple-200 transition-colors ${
                                        isMobile ? 'text-xs mb-0.5' : 'text-sm mb-1'
                                    }`}>
                                        {feature.label}
                                    </h4>
                                    <p className={`text-gray-400 leading-relaxed ${
                                        isMobile ? 'text-[10px]' : 'text-xs'
                                    }`}>
                                        {feature.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <div className={`bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full border border-yellow-500/20 font-medium ${
                                        isMobile ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'
                                    }`}>
                                        Soon
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className={`bg-gray-800/50 border-t border-purple-500/20 ${
                        isMobile ? 'p-2' : 'p-3'
                    }`}>
                        <p className={`text-gray-400 text-center ${
                            isMobile ? 'text-[10px]' : 'text-xs'
                        }`}>
                            🚀 More features coming in future updates
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeaturesMenu;
