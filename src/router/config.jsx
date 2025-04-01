import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

// Router configuration with future flags
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

// Create router with React Router's native data APIs
export const router = createBrowserRouter(routes, routerConfig);
