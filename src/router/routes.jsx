import { lazy } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { withSuspense } from './guards';

// Enhanced component loading with performance metrics
const createLazyComponent = (importFn) => {
  return lazy(() => {
    // Track loading performance
    const startTime = performance.now();
    
    return importFn()
      .then(module => {
        const loadTime = performance.now() - startTime;
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Route loaded in ${loadTime.toFixed(2)}ms`);
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
};

// Lazy loaded components using React Router's native prefetching
const Home = createLazyComponent(() => import('../components/pages/home/Home'));
const About = createLazyComponent(() => import('../components/pages/about/About'));
const SwapToken = createLazyComponent(() => import('../components/pages/SwapToken'));
const Base = createLazyComponent(() => import('../components/pages/StakingDashboard/Base'));
const TokenomicsDashboard = createLazyComponent(() => import('../components/pages/tokenomics/TokenomicsDashboard'));
const AirdropDashboard = createLazyComponent(() => import('../components/pages/AirdropDashboard/AirdropDashboard'));
const Roadmap = createLazyComponent(() => import('../components/pages/roadmap/Roadmap.jsx'));
const P2E = createLazyComponent(() => import('../components/pages/P2E/Game'));
const NotFound = createLazyComponent(() => import('../components/pages/NotFound'));
const AIHub = createLazyComponent(() => import('../components/pages/AIHub/AIHub.jsx'));
const NFTsPage = createLazyComponent(() => import('../components/pages/nfts/NFTHome.jsx'));
const NFTDashboard = createLazyComponent(() => import('../components/pages/TokenizationApp/dashboard/NFTDashboard.jsx'));
const NFTDetail = createLazyComponent(() => import('../components/pages/TokenizationApp/components/NFTDetail.jsx'));
const TokenizationTool = createLazyComponent(() => import('../components/pages/TokenizationApp/steps/TokenizationTool.jsx'));
const ProfilePage = createLazyComponent(() => import('../components/pages/profile/ProfilePage'));
const ChatPage = createLazyComponent(() => import('../components/pages/chat/ChatPage'));

// Routes configuration with React Router's native prefetching via loaders
export const routes = [
  {
    path: "/",
    element: withSuspense(
      <MainLayout showFooter={true}>
        <Home />
      </MainLayout>
    ),
    // Loader function for native prefetching
    loader: async () => {
      return null;
    }
  },
  {
    path: "/tokenomics",
    element: withSuspense(<MainLayout><TokenomicsDashboard /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/staking",
    element: withSuspense(<MainLayout><Base /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/swaptoken",
    element: withSuspense(<MainLayout><SwapToken /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/about",
    element: withSuspense(<MainLayout><About /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/airdrops",
    element: withSuspense(<MainLayout><AirdropDashboard /></MainLayout>),
    loader: async () => {
      // Prefetch para mejorar el rendimiento
      import('../components/pages/AirdropDashboard/AirdropDashboard');
      return null;
    }
  },
  {
    path: "/roadmap",
    element: withSuspense(<MainLayout showFooter={true}><Roadmap /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/game",
    element: withSuspense(<MainLayout><P2E/></MainLayout>),
    loader: async () => null
  },
  {
    path: "*",
    element: withSuspense(<MainLayout><NotFound /></MainLayout>)
  },
  {
    path: "/ai",
    element: withSuspense(<MainLayout><AIHub /></MainLayout>)
  },
  {
    path: "/chat",
    element: withSuspense(<MainLayout><ChatPage /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/nfts",
    element: withSuspense(<MainLayout><NFTsPage /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/my-nfts",
    element: withSuspense(<MainLayout><NFTDashboard /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/nft/:tokenId",
    element: withSuspense(<MainLayout><NFTDetail /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/tokenize",
    element: withSuspense(<MainLayout><TokenizationTool /></MainLayout>),
    loader: async () => null
  },
  {
    path: "/profile",
    element: withSuspense(<MainLayout><ProfilePage /></MainLayout>),
    loader: async () => null
  }
];
