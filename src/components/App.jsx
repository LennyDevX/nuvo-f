// src/components/App.jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './ErrorBoundary';

// Lazy loading components
const Home = lazy(() => import('./pages/home/Home'));
const SwapToken = lazy(() => import('./pages/SwapToken'));
const About = lazy(() => import('./pages/about/About'));
const AirdropDashboard = lazy(() => import('./layout/AirdropDashboard/AirdropDashboard'));
const TokenomicsDashboard = lazy(() => import('./pages/tokenomics/TokenomicsDashboard'));
const DashboardStaking = lazy(() => import('./pages/StakingDashboard/DashboardStaking'));
const Roadmap = lazy(() => import('./pages/roadmap/Roadmap'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const App = () => {
  const routes = [
    {
      path: "/",
      element: (
        <MainLayout showFooter={true}>
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/tokenomics",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <TokenomicsDashboard />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/staking",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardStaking />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/swaptoken",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <SwapToken />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/about",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <About />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/airdrops",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <AirdropDashboard />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "/roadmap",
      element: (
        <MainLayout showFooter={true}>
          <Suspense fallback={<LoadingSpinner />}>
            <Roadmap />
          </Suspense>
        </MainLayout>
      ),
    },
    {
      path: "*",
      element: (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        </MainLayout>
      ),
    },
  ];

  const router = createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <RouterProvider router={router} />
      </div>
    </ErrorBoundary>
  );
};

export default App;