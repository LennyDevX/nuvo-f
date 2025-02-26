import { lazy } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { withSuspense } from './guards';

// Better error handling for lazy loading
const preloadRoute = (importFn) => {
  const Component = lazy(() => 
    importFn().catch(error => {
      console.error('Failed to load component:', error);
      return {
        default: () => (
          <div className="text-center p-4">
            <p className="text-red-500">Failed to load component</p>
          </div>
        )
      };
    })
  );
  return Component;
};

// Update component imports with correct paths
const Home = preloadRoute(() => import('../components/pages/home/Home'));
const SwapToken = preloadRoute(() => import('../components/pages/SwapToken'));
const About = preloadRoute(() => import('../components/pages/about/About'));
const AirdropDashboard = preloadRoute(() => import('../components/pages/AirdropDashboard/AirdropDashboard'));
const TokenomicsDashboard = preloadRoute(() => import('../components/pages/tokenomics/TokenomicsDashboard'));
const DashboardStaking = preloadRoute(() => import('../components/pages/StakingDashboard/DashboardStaking'));
// Add loading delay for non-critical routes
const Roadmap = preloadRoute(() => 
  import('../components/pages/roadmap/Roadmap').then(module => {
    // Add artificial delay only in development
    if (process.env.NODE_ENV === 'development') {
      return new Promise(resolve => {
        setTimeout(() => resolve(module), 0);
      });
    }
    return module;
  })
);
const P2E = preloadRoute(() => import('../components/pages/P2E/Game'));
const NotFound = preloadRoute(() => import('../components/pages/NotFound'));
import AIHub from '../components/pages/AIHub';


export const routes = [
  {
    path: "/",
    element: withSuspense(
      <MainLayout showFooter={true}>
        <Home />
      </MainLayout>
    )
  },
  {
    path: "/tokenomics",
    element: withSuspense(<MainLayout><TokenomicsDashboard /></MainLayout>),
  },
  {
    path: "/staking",
    element: withSuspense(<MainLayout><DashboardStaking /></MainLayout>)
  },
  {
    path: "/swaptoken",
    element: withSuspense(<MainLayout><SwapToken /></MainLayout>),
  },
  {
    path: "/about",
    element: withSuspense(<MainLayout><About /></MainLayout>),
  },
  {
    path: "/airdrops",
    element: withSuspense(<MainLayout><AirdropDashboard /></MainLayout>),
  },
  {
    path: "/roadmap",
    element: withSuspense(<MainLayout showFooter={true}><Roadmap /></MainLayout>),
  },
  {
    path: "/game",
    element: withSuspense(<MainLayout><P2E/></MainLayout>),
  },
  {
    path: "*",
    element: withSuspense(<MainLayout><NotFound /></MainLayout>),
  },
  {
    path: "/ai",
    element: withSuspense(<MainLayout><AIHub /></MainLayout>),
  }
];
