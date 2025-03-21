import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_prependBasename: true
  },
  hydrationData: window.__HYDRATION_DATA__
};

// Preload management 
const preloadedRoutes = new Set();

// Enhanced route preloading with timing and throttling
const preloadRoute = (route) => {
  if (!route || !route.preload || preloadedRoutes.has(route.path)) return;
  
  // Add to tracking set to avoid duplicate preloads
  preloadedRoutes.add(route.path);
  
  // Execute the preload
  try {
    route.preload();
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Preloaded route: ${route.path} (priority: ${route.priority})`);
    }
  } catch (err) {
    console.error(`Failed to preload route: ${route.path}`, err);
  }
};

// Strategic preloading on mouse hover with intent detection
const preloadRouteOnHover = (() => {
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

      // Clear previous timer if user moves between links quickly
      if (lastHoveredLink !== link.href) {
        clearTimeout(hoverTimer);
        lastHoveredLink = link.href;
        
        // Set hover timer for intent detection (wait briefly before preloading)
        hoverTimer = setTimeout(() => {
          preloadRoute(route);
        }, 100); // Short delay to confirm hover intent
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  };
})();

// Initial routes preloading strategy
const preloadInitialRoutes = () => {
  // Step 1: Preload critical routes immediately
  routes
    .filter(route => route.priority === 'critical')
    .forEach(preloadRoute);
  
  // Step 2: Schedule high priority routes to load after a delay
  setTimeout(() => {
    routes
      .filter(route => route.priority === 'high')
      .forEach(preloadRoute);
  }, 1000);
  
  // Step 3: Schedule medium priority routes for later
  setTimeout(() => {
    routes
      .filter(route => route.priority === 'medium')
      .forEach(preloadRoute);
  }, 3000);
  
  // Step 4: Use Intersection Observer for visible nav links
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          try {
            const pathname = new URL(link.href).pathname;
            const route = routes.find(r => r.path === pathname);
            if (route) preloadRoute(route);
          } catch (e) {
            // Ignore URL parsing errors
          }
          observer.unobserve(link);
        }
      });
    }, { threshold: 0.1 });
    
    // Observe all navigation links
    document.querySelectorAll('nav a[href]').forEach(link => {
      observer.observe(link);
    });
  }
};

// Set up event listeners
document.addEventListener('mouseover', preloadRouteOnHover);

// Trigger initial preloading after first paint
if (document.readyState === 'complete') {
  preloadInitialRoutes();
} else {
  window.addEventListener('load', preloadInitialRoutes);
}

export const router = createBrowserRouter(routes, routerConfig);
