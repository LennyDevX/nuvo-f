import { createBrowserRouter } from 'react-router-dom';
import TokenomicsDashboard from '../components/pages/tokenomics/TokenomicsDashboard';

export const router = createBrowserRouter([
  {
    path: '/tokenomics',
    element: <TokenomicsDashboard />,
  },
  // ...other routes...
]);
