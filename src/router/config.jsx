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

// Add route preloading on hover
const preloadRouteOnHover = (event) => {
  const link = event.target.closest('a');
  if (link && link.href) {
    const route = routes.find(r => r.path === new URL(link.href).pathname);
    route?.loader?.();
  }
};

document.addEventListener('mouseover', preloadRouteOnHover);

export const router = createBrowserRouter(routes, routerConfig);
