import React, { useEffect, useRef, useState } from 'react';

const SpaceBackground = ({ customClass = "", starDensity = "medium" }) => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isVisible, setIsVisible] = useState(true);
  const frameRef = useRef(null);
  
  // Check if device is mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Visibility API to pause animation when tab is not visible (battery saving)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Canvas animation for subtle stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Throttle resize for better performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars();
      }, 200); // Debounce resize events
    };
    
    window.addEventListener('resize', handleResize);
    
    // Mobile-optimized star properties
    const getStarCount = () => {
      // Reduce star density on mobile
      const baseDensity = isMobile ? 2 : 1;
      
      switch(starDensity) {
        case "low": return Math.floor(canvas.width * canvas.height / (20000 * baseDensity));
        case "high": return Math.floor(canvas.width * canvas.height / (5000 * baseDensity));
        default: return Math.floor(canvas.width * canvas.height / (10000 * baseDensity)); // medium
      }
    };
    
    // Star objects with subtle twinkling
    const stars = [];
    const createStars = () => {
      stars.length = 0; // Clear existing stars
      const count = getStarCount();
      
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * (isMobile ? 1.2 : 1.5), // Slightly smaller stars on mobile
          opacity: Math.random() * 0.8 + 0.2,
          // Slower animation on mobile to save battery
          twinkleSpeed: Math.random() * (isMobile ? 0.01 : 0.02) + (isMobile ? 0.002 : 0.003),
          twinkleDirection: Math.random() < 0.5 ? 1 : -1
        });
      }
    };
    
    createStars();
    
    // Animation with frame rate control for mobile
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Lower FPS on mobile
    const frameDelay = 1000 / targetFPS;
    
    const animate = (timestamp) => {
      if (!isVisible) {
        frameRef.current = requestAnimationFrame(animate);
        return; // Skip rendering when tab is not visible
      }
      
      const elapsed = timestamp - lastFrameTime;
      
      // Control frame rate
      if (elapsed > frameDelay) {
        lastFrameTime = timestamp - (elapsed % frameDelay);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw and animate each star
        stars.forEach(star => {
          // Update opacity for twinkling effect
          star.opacity += star.twinkleSpeed * star.twinkleDirection;
          
          // Reverse direction when reaching opacity limits
          if (star.opacity <= 0.2 || star.opacity >= 1) {
            star.twinkleDirection *= -1;
          }
          
          // Draw star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        });
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [starDensity, isMobile, isVisible]);
  
  return (
    <div className={`fixed inset-0 z-0 ${customClass}`}>
      
      {/* Vignette effect for depth - menos intensivo en mobile */}
      <div className="absolute inset-0 bg-nuvo-solid-gradient pointer-events-none"></div>
      
      {/* Star canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      ></canvas>
    </div>
  );
};

export default SpaceBackground;
