import { routes } from '../router/routes';

/**
 * Utility class to manage route prefetching
 */
class RoutePrefetcher {
  constructor() {
    this.preloadedRoutes = new Set();
    this.visibleNavLinks = new Set();
    this.isInitialized = false;
    this.idleCallbackSupported = 'requestIdleCallback' in window;
    this.intersectionObserverSupported = 'IntersectionObserver' in window;
  }
  
  /**
   * Initialize the prefetcher
   */
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    // Set up link hover detection
    document.addEventListener('mouseover', this.handleLinkHover);
    
    // Set up viewport link detection
    if (this.intersectionObserverSupported) {
      this.setupLinkObserver();
    }
    
    // Initial routes preloading
    this.preloadInitialRoutes();
    
    // Set up navigation prediction
    this.setupNavigationPrediction();
  }
  
  /**
   * Preload a specific route
   */
  preloadRoute = (route) => {
    if (!route || !route.preload || this.preloadedRoutes.has(route.path)) return;
    
    this.preloadedRoutes.add(route.path);
    
    try {
      route.preload();
      if (process.env.NODE_ENV === 'development') {
        console.debug(`Prefetched route: ${route.path}`);
      }
    } catch (err) {
      console.error(`Failed to prefetch route: ${route.path}`, err);
    }
  }
  
  /**
   * Handle mouse hover over links
   */
  handleLinkHover = (() => {
    let hoverTimer;
    let lastHoveredLink = null;
    
    return (event) => {
      const link = event.target.closest('a');
      if (!link || !link.href) return;
      
      try {
        const url = new URL(link.href);
        const pathname = url.pathname;
        
        // Skip if it's the same link or external
        if (pathname === window.location.pathname || url.origin !== window.location.origin) return;
        
        // Find corresponding route
        const route = routes.find(r => r.path === pathname);
        if (!route) return;

        // Clear previous timer if user moves between links
        if (lastHoveredLink !== link.href) {
          clearTimeout(hoverTimer);
          lastHoveredLink = link.href;
          
          // Intentional delay for hover
          hoverTimer = setTimeout(() => {
            this.preloadRoute(route);
          }, 100);
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
    };
  })();
  
  /**
   * Set up observer for links in viewport
   */
  setupLinkObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = entry.target;
        
        if (entry.isIntersecting) {
          this.visibleNavLinks.add(link);
          this.scheduleVisibleLinkPreload(link);
        } else {
          this.visibleNavLinks.delete(link);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe all navigation links
    setTimeout(() => {
      document.querySelectorAll('nav a[href], .main-navigation a[href]').forEach(link => {
        observer.observe(link);
      });
    }, 1000); // Delay to ensure DOM is ready
  }
  
  /**
   * Schedule preloading of visible links during idle times
   */
  scheduleVisibleLinkPreload(link) {
    const scheduleIdleTask = (callback) => {
      if (this.idleCallbackSupported) {
        requestIdleCallback(callback, { timeout: 1000 });
      } else {
        setTimeout(callback, 500);
      }
    };
    
    scheduleIdleTask(() => {
      try {
        const pathname = new URL(link.href).pathname;
        const route = routes.find(r => r.path === pathname);
        if (route) this.preloadRoute(route);
      } catch (e) {
        // Ignore URL parsing errors
      }
    });
  }
  
  /**
   * Preload initial routes based on priority
   */
  preloadInitialRoutes() {
    // Immediately preload critical routes
    routes
      .filter(route => route.priority === 'critical')
      .forEach(this.preloadRoute);
    
    // Schedule high priority routes after a short delay
    setTimeout(() => {
      routes
        .filter(route => route.priority === 'high')
        .forEach(this.preloadRoute);
    }, 1000);
    
    // Using idle callback for medium priority routes
    if (this.idleCallbackSupported) {
      requestIdleCallback(() => {
        routes
          .filter(route => route.priority === 'medium')
          .forEach(this.preloadRoute);
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        routes
          .filter(route => route.priority === 'medium')
          .forEach(this.preloadRoute);
      }, 3000);
    }
  }
  
  /**
   * Set up navigation prediction based on user behavior
   */
  setupNavigationPrediction() {
    // This could be enhanced with actual ML models
    // For now, just preload based on common patterns
    const predictRoutes = () => {
      // Current path-based prediction
      const currentPath = window.location.pathname;
      
      if (currentPath === '/') {
        // From home page, users often go to About or Features
        this.preloadRoute(routes.find(r => r.path === '/about'));
        this.preloadRoute(routes.find(r => r.path === '/staking'));
      } 
      else if (currentPath === '/about') {
        // From about, often to home or staking
        this.preloadRoute(routes.find(r => r.path === '/staking'));
      }
      else if (currentPath === '/staking') {
        // From staking, often to swap
        this.preloadRoute(routes.find(r => r.path === '/swaptoken'));
      }
    };
    
    // Schedule prediction after page has settled
    setTimeout(predictRoutes, 2000);
  }
}

// Create singleton instance
const prefetcher = new RoutePrefetcher();

export default prefetcher;
