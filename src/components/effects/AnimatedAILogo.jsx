import React, { useEffect, useRef, useState } from 'react';
import './AnimatedAILogo.css';
import { 
  addDebouncedResizeListener, 
  addThrottledMouseListener,
  addThrottledTouchListener,
  combineEventListeners
} from '../../utils/eventHandlers';
import { 
  isMobileDevice, 
  isLowPerformanceDevice,
  getRecommendedParticleCount 
} from '../../utils/MobileUtils';

const AnimatedAILogo = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const fpsRef = useRef({ value: 0, lastLoop: 0, lastFpsUpdate: 0, frameCount: 0 });
  const rippleTimeoutsRef = useRef([]);
  const interactionPointRef = useRef({ x: null, y: null });
  const perfModeRef = useRef('high');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    ctx.imageSmoothingEnabled = true;
    
    let containerRect = container.getBoundingClientRect();
    
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    const radius = Math.min(canvas.width, canvas.height) / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const detectPerformance = () => {
      if (isLowPerformanceDevice()) {
        perfModeRef.current = 'low';
        return 80;
      } else if (isMobileDevice()) {
        perfModeRef.current = 'medium';
        return 120;
      } else {
        perfModeRef.current = 'high';
        return 200;
      }
    };
    
    const createParticles = () => {
      const particleCount = detectPerformance();
      const particles = [];
      
      const phi = Math.PI * (3 - Math.sqrt(5));
      
      for (let i = 0; i < particleCount; i++) {
        const y = 1 - (i / (particleCount - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        
        const theta = phi * i;
        
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        
        const distance = Math.random() * 0.7 + 0.3;
        
        const posX = centerX + radius * distance * x;
        const posY = centerY + radius * distance * y;
        const posZ = radius * distance * z;
        
        const speedFactor = perfModeRef.current === 'high' ? 1.0 : 
                           (perfModeRef.current === 'medium' ? 0.8 : 0.6);
        
        particles.push({
          x: posX,
          y: posY,
          z: posZ,
          origX: posX,
          origY: posY,
          origZ: posZ,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * speedFactor,
          speedY: (Math.random() - 0.5) * speedFactor,
          speedZ: (Math.random() - 0.5) * speedFactor,
          color: generateParticleColor(distance),
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.004 * speedFactor,
          interacting: false,
          interactionForce: 0,
          interactionAngle: 0,
          wobble: Math.random() * 2 - 1,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
          wobbleAngle: Math.random() * Math.PI * 2
        });
      }
      
      particlesRef.current = particles;
    };
    
    const generateParticleColor = (distanceFactor) => {
      const colorSchemes = [
        { baseHue: 220, hueVariation: 40 }, // Blue
        { baseHue: 280, hueVariation: 40 }, // Purple
        { baseHue: 350, hueVariation: 20 }  // Red
      ];
      
      const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      const baseHue = isActive ? scheme.baseHue : scheme.baseHue - 10;
      const hue = baseHue + (scheme.hueVariation * distanceFactor) + (Math.random() * 20 - 10);
      
      const saturation = 70 + Math.random() * 30;
      const lightness = 40 + (distanceFactor * 30) + (Math.random() * 20);
      const alpha = 0.3 + (distanceFactor * 0.7);
      
      return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    };
    
    const updateFps = (now) => {
      if (!fpsRef.current.lastLoop) {
        fpsRef.current.lastLoop = now;
        return;
      }
      
      const elapsed = now - fpsRef.current.lastLoop;
      fpsRef.current.lastLoop = now;
      
      fpsRef.current.frameCount++;
      
      if (now - fpsRef.current.lastFpsUpdate > 1000) {
        fpsRef.current.value = Math.round((fpsRef.current.frameCount * 1000) / (now - fpsRef.current.lastFpsUpdate));
        fpsRef.current.lastFpsUpdate = now;
        fpsRef.current.frameCount = 0;
      }
    };
    
    const createRippleEffect = (x, y) => {
      const ripple = document.createElement('div');
      ripple.className = 'ai-logo-ripple';
      ripple.style.width = '10px';
      ripple.style.height = '10px';
      ripple.style.left = `${x - 5}px`;
      ripple.style.top = `${y - 5}px`;
      container.appendChild(ripple);
      
      const timeoutId = setTimeout(() => {
        if (container.contains(ripple)) {
          container.removeChild(ripple);
        }
      }, 800);
      
      rippleTimeoutsRef.current.push(timeoutId);
    };
    
    const handleInteraction = (x, y) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = x - rect.left;
      const mouseY = y - rect.top;
      
      interactionPointRef.current = { x: mouseX, y: mouseY };
      
      setIsInteracting(true);
      setIsActive(true);
      setTimeout(() => setIsInteracting(false), 800);
      
      createRippleEffect(mouseX, mouseY);
      
      const interactionRadius = radius * 0.6;
      particlesRef.current.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < interactionRadius) {
          particle.interacting = true;
          particle.interactionForce = Math.pow(1 - (distance / interactionRadius), 2) * 2;
          particle.interactionAngle = Math.atan2(dy, dx);
          
          const force = particle.interactionForce;
          particle.speedX = Math.cos(particle.interactionAngle) * force;
          particle.speedY = Math.sin(particle.interactionAngle) * force;
          particle.speedZ += (Math.random() - 0.5) * force * 0.5;
        }
      });
    };
    
    const animate = (timestamp) => {
      updateFps(timestamp);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      if (isActive) {
        gradient.addColorStop(0, 'rgba(88, 28, 135, 0.15)');
        gradient.addColorStop(0.6, 'rgba(76, 29, 149, 0.08)');
        gradient.addColorStop(1, 'rgba(20, 0, 50, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(88, 28, 135, 0.1)');
        gradient.addColorStop(0.6, 'rgba(76, 29, 149, 0.05)');
        gradient.addColorStop(1, 'rgba(20, 0, 50, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      const time = timestamp * 0.001;
      const pulseSize = radius * 0.4 + Math.sin(time * 1.5) * radius * 0.1;
      const pulseGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulseSize
      );
      
      if (isActive) {
        pulseGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        pulseGradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.05)');
        pulseGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      } else {
        pulseGradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        pulseGradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.03)');
        pulseGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      }
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = pulseGradient;
      ctx.fill();
      
      particlesRef.current.sort((a, b) => b.z - a.z);
      
      const connections = [];
      const connectionDistance = radius * (isActive ? 0.45 : 0.35);
      
      particlesRef.current.forEach((particle, i) => {
        const wobbleOffset = Math.sin(time * particle.wobbleSpeed + particle.wobbleAngle) * particle.wobble;
        
        particle.angle += particle.rotationSpeed;
        
        if (particle.interacting) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          particle.z += particle.speedZ;
          
          particle.interactionForce *= 0.95;
          particle.speedX *= 0.97;
          particle.speedY *= 0.97;
          particle.speedZ *= 0.97;
          
          if (particle.interactionForce < 0.05) {
            particle.interacting = false;
            particle.interactionForce = 0;
          }
        } else {
          const orbitFactor = perfModeRef.current === 'high' ? 0.98 : 0.985;
          
          particle.x = (particle.x * orbitFactor) + (particle.origX * (1 - orbitFactor)) + 
                       particle.speedX + wobbleOffset * 0.3;
          particle.y = (particle.y * orbitFactor) + (particle.origY * (1 - orbitFactor)) + 
                       particle.speedY + wobbleOffset * 0.3;
          particle.z = (particle.z * orbitFactor) + (particle.origZ * (1 - orbitFactor)) + 
                       particle.speedZ;
          
          particle.speedX += (Math.random() - 0.5) * 0.03;
          particle.speedY += (Math.random() - 0.5) * 0.03;
          particle.speedZ += (Math.random() - 0.5) * 0.01;
          
          particle.speedX *= 0.98;
          particle.speedY *= 0.98;
          particle.speedZ *= 0.98;
        }
        
        const distanceFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + 
          Math.pow(particle.y - centerY, 2) + 
          Math.pow(particle.z, 2)
        );
        
        if (distanceFromCenter > radius * 0.95) {
          const normalizedX = (particle.x - centerX) / distanceFromCenter;
          const normalizedY = (particle.y - centerY) / distanceFromCenter;
          const normalizedZ = particle.z / distanceFromCenter;
          
          particle.x = centerX + normalizedX * radius * 0.95;
          particle.y = centerY + normalizedY * radius * 0.95;
          particle.z = normalizedZ * radius * 0.95;
          
          particle.speedX *= -0.5;
          particle.speedY *= -0.5;
          particle.speedZ *= -0.5;
        }
        
        const scale = (radius + particle.z) / (radius * 2);
        const size = particle.size * scale * 2;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        
        if (particle.interacting) {
          const glowIntensity = particle.interactionForce * 0.5;
          ctx.fillStyle = `hsla(280, 100%, 70%, ${0.5 + glowIntensity})`;
          
          if (perfModeRef.current === 'high') {
            ctx.shadowBlur = 5 * particle.interactionForce;
            ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
          }
        } else {
          ctx.fillStyle = particle.color;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (perfModeRef.current !== 'low') {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const otherParticle = particlesRef.current[j];
            
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const dz = particle.z - otherParticle.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < connectionDistance) {
              const opacityFactor = perfModeRef.current === 'high' ? 0.15 : 0.1;
              const opacity = opacityFactor * (1 - distance / connectionDistance);
              
              connections.push({
                x1: particle.x,
                y1: particle.y,
                x2: otherParticle.x,
                y2: otherParticle.y,
                z: (particle.z + otherParticle.z) / 2,
                opacity: opacity,
                interacting: particle.interacting || otherParticle.interacting,
                interactionForce: Math.max(particle.interactionForce, otherParticle.interactionForce)
              });
            }
          }
        }
      });
      
      if (perfModeRef.current !== 'low') {
        connections.sort((a, b) => b.z - a.z);
        
        connections.forEach(conn => {
          ctx.beginPath();
          
          if (conn.interacting) {
            const glowOpacity = Math.min(0.8, conn.opacity + conn.interactionForce * 0.3);
            ctx.strokeStyle = `rgba(59, 130, 246, ${glowOpacity})`; // Blue color
          } else {
            ctx.strokeStyle = `rgba(59, 130, 246, ${conn.opacity})`; // Blue color
          }
          
          const lineWidthBase = perfModeRef.current === 'high' ? 0.5 : 0.3;
          ctx.lineWidth = lineWidthBase + ((conn.z / (radius * 2)) * 0.5);
          
          ctx.moveTo(conn.x1, conn.y1);
          ctx.lineTo(conn.x2, conn.y2);
          ctx.stroke();
        });
      }
      
      if (interactionPointRef.current.x !== null && isActive) {
        if (timestamp % 50 === 0) {
          setIsActive(prevActive => {
            if (prevActive) {
              return Math.random() > 0.1;
            }
            return prevActive;
          });
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    const cleanupListeners = combineEventListeners([
      () => addDebouncedResizeListener(() => {
        containerRect = container.getBoundingClientRect();
        canvas.width = containerRect.width;
        canvas.height = containerRect.height;
        createParticles();
      }),
      () => addThrottledMouseListener(canvas, handleInteraction),
      () => addThrottledTouchListener(canvas, handleInteraction)
    ]);
    
    createParticles();
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cleanupListeners();
      cancelAnimationFrame(animationRef.current);
      rippleTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [isActive]);

  return (
    <div 
      ref={containerRef} 
      className={`ai-logo-container ${isInteracting ? 'ai-logo-interactive-mode' : ''} ${isActive ? 'ai-logo-active' : ''}`}
    >
      <canvas 
        ref={canvasRef} 
        className="ai-logo-canvas"
      />
      <div className="ai-logo-energy"></div>
      <div className="ai-logo-glow-overlay"></div>
      <div className="ai-logo-inner-ring"></div>
      <div className="ai-logo-ring"></div>
    </div>
  );
};

export default AnimatedAILogo;
