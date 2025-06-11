import { useCallback, useRef, useEffect } from 'react';

// Haptic feedback utility
const triggerHaptic = (type = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50, 50, 50]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

// Touch gesture detection hook
export const useSwipeGesture = (onSwipe, options = {}) => {
  const {
    threshold = 50,
    restraint = 100,
    allowedTime = 300,
    preventDefault = true
  } = options;

  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  
  const handleTouchStart = useCallback((e) => {
    if (preventDefault) e.preventDefault();
    
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e) => {
    if (preventDefault) e.preventDefault();
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    
    if (deltaTime <= allowedTime) {
      if (Math.abs(deltaX) >= threshold && Math.abs(deltaY) <= restraint) {
        const direction = deltaX > 0 ? 'right' : 'left';
        triggerHaptic('medium');
        onSwipe?.(direction, { deltaX, deltaY, deltaTime });
      } else if (Math.abs(deltaY) >= threshold && Math.abs(deltaX) <= restraint) {
        const direction = deltaY > 0 ? 'down' : 'up';
        triggerHaptic('medium');
        onSwipe?.(direction, { deltaX, deltaY, deltaTime });
      }
    }
  }, [allowedTime, threshold, restraint, onSwipe, preventDefault]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
};

// Long press gesture hook
export const useLongPress = (onLongPress, options = {}) => {
  const { delay = 500, preventDefault = true } = options;
  const timeoutRef = useRef(null);
  const isPressed = useRef(false);

  const start = useCallback((e) => {
    if (preventDefault) e.preventDefault();
    
    isPressed.current = true;
    timeoutRef.current = setTimeout(() => {
      if (isPressed.current) {
        triggerHaptic('heavy');
        onLongPress?.(e);
      }
    }, delay);
  }, [onLongPress, delay, preventDefault]);

  const cancel = useCallback((e) => {
    if (preventDefault) e.preventDefault();
    
    isPressed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [preventDefault]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel
  };
};

// Pull to refresh gesture
export const usePullToRefresh = (onRefresh, options = {}) => {
  const { threshold = 80, resistance = 0.5 } = options;
  const touchStart = useRef({ y: 0, pullDistance: 0 });
  const [isPulling, setIsPulling] = React.useState(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      touchStart.current.y = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (window.scrollY === 0 && touchStart.current.y > 0) {
      const currentY = e.touches[0].clientY;
      const pullDistance = (currentY - touchStart.current.y) * resistance;
      
      if (pullDistance > 0) {
        e.preventDefault();
        touchStart.current.pullDistance = pullDistance;
        setIsPulling(pullDistance > threshold);
      }
    }
  }, [threshold, resistance]);

  const handleTouchEnd = useCallback(() => {
    if (touchStart.current.pullDistance > threshold) {
      triggerHaptic('medium');
      onRefresh?.();
    }
    
    touchStart.current = { y: 0, pullDistance: 0 };
    setIsPulling(false);
  }, [threshold, onRefresh]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    isPulling
  };
};

// Gesture handler hook that combines multiple gestures
export const useGestureHandlers = (handlers = {}) => {
  const swipeGesture = useSwipeGesture(handlers.onSwipe);
  const longPressGesture = useLongPress(handlers.onLongPress);
  
  return {
    ...swipeGesture,
    ...longPressGesture,
    triggerHaptic
  };
};

export default useGestureHandlers;
