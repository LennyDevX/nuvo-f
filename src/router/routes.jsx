import { lazy } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { withSuspense } from './guards';

// Define route priority for strategic loading
const PRIORITY = {
  CRITICAL: 'critical',  // Essential routes loaded immediately
  HIGH: 'high',          // Important routes loaded soon after critical 
  MEDIUM: 'medium',      // Secondary routes
  LOW: 'low'             // Rarely accessed routes
};

// Enhanced preloading with priority and performance metrics
const preloadRoute = (importFn, priority = PRIORITY.MEDIUM) => {
  const Component = lazy(() => {
    // Track loading performance
    const startTime = performance.now();
    
    return importFn()
      .then(module => {
        const loadTime = performance.now() - startTime;
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Route loaded in ${loadTime.toFixed(2)}ms (priority: ${priority})`);
        }
        return module;
      })
      .catch(error => {
        console.error('Failed to load component:', error);
        return {
          default: () => (
            <div className="text-center p-4">
              <p className="text-red-500">Failed to load component</p>
            </div>
          )
        };
      });
  });
  
  // Store metadata for preloading strategies
  Component._priority = priority;
  Component._preload = () => importFn();
  
  return Component;
};

// Optimized component imports with appropriate priority levels
const Home = preloadRoute(() => import('../components/pages/home/Home'), PRIORITY.CRITICAL);
const About = preloadRoute(() => import('../components/pages/about/About'), PRIORITY.HIGH);
const SwapToken = preloadRoute(() => import('../components/pages/SwapToken'), PRIORITY.HIGH);
const DashboardStaking = preloadRoute(() => import('../components/pages/StakingDashboard/DashboardStaking'), PRIORITY.HIGH);
const TokenomicsDashboard = preloadRoute(() => import('../components/pages/tokenomics/TokenomicsDashboard'), PRIORITY.MEDIUM);
const AirdropDashboard = preloadRoute(() => import('../components/pages/AirdropDashboard/AirdropDashboard'), PRIORITY.MEDIUM);
const Roadmap = preloadRoute(() => import('../components/pages/roadmap/Roadmap.jsx'), PRIORITY.MEDIUM);
const P2E = preloadRoute(() => import('../components/pages/P2E/Game'), PRIORITY.LOW);
const NotFound = preloadRoute(() => import('../components/pages/NotFound'), PRIORITY.LOW);
import AIHub from '../components/pages/AIHub';

// Routes configuration with metadata for preloading
export const routes = [
  {
    path: "/",
    element: withSuspense(
      <MainLayout showFooter={true}>
        <Home />
      </MainLayout>
    ),
    preload: Home._preload,
    priority: PRIORITY.CRITICAL
  },
  {
    path: "/tokenomics",
    element: withSuspense(<MainLayout><TokenomicsDashboard /></MainLayout>),
    preload: TokenomicsDashboard._preload,
    priority: PRIORITY.MEDIUM
  },
  {
    path: "/staking",
    element: withSuspense(<MainLayout><DashboardStaking /></MainLayout>),
    preload: DashboardStaking._preload,
    priority: PRIORITY.HIGH
  },
  {
    path: "/swaptoken",
    element: withSuspense(<MainLayout><SwapToken /></MainLayout>),
    preload: SwapToken._preload,
    priority: PRIORITY.HIGH
  },
  {
    path: "/about",
    element: withSuspense(<MainLayout><About /></MainLayout>),
    preload: About._preload,
    priority: PRIORITY.HIGH
  },
  {
    path: "/airdrops",
    element: withSuspense(<MainLayout><AirdropDashboard /></MainLayout>),
    preload: AirdropDashboard._preload,
    priority: PRIORITY.MEDIUM
  },
  {
    path: "/roadmap",
    element: withSuspense(<MainLayout showFooter={true}><Roadmap /></MainLayout>),
    preload: Roadmap._preload,
    priority: PRIORITY.MEDIUM
  },
  {
    path: "/game",
    element: withSuspense(<MainLayout><P2E/></MainLayout>),
    preload: P2E._preload,
    priority: PRIORITY.LOW
  },
  {
    path: "*",
    element: withSuspense(<MainLayout><NotFound /></MainLayout>),
    // No preload for NotFound since it's fallback
  },
  {
    path: "/ai",
    element: withSuspense(<MainLayout><AIHub /></MainLayout>),
    // AIHub is directly imported (not lazy loaded)
  }
];
