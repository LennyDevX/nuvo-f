export const checkRegionalEligibility = () => {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language || navigator.userLanguage;
        
        // Enhanced device information
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: language,
            timeZone: timeZone,
            vendor: navigator.vendor,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            }
        };
        
        // Lista de regiones restringidas
        const restrictedRegions = ['CN', 'HK', 'CU', 'IR', 'KP', 'SY'];
        const restrictedTimezones = ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Pyongyang', 'Asia/Tehran'];
        
        const isRestrictedByCode = restrictedRegions.some(region => 
            language.toUpperCase().includes(region) || 
            timeZone.toUpperCase().includes(region)
        );
        
        const isRestrictedByTimezone = restrictedTimezones.some(tz => 
            timeZone.includes(tz)
        );

        return {
            isEligible: !isRestrictedByCode && !isRestrictedByTimezone,
            details: {
                ...deviceInfo,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Region check error:', error);
        return {
            isEligible: false,
            error: 'Unable to verify region'
        };
    }
};
