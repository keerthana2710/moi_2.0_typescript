import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from '../App';
import NotFoundPage from '../pages/error/NotFoundPage';

import PayerListing from '../pages/Payers/PayerListing';

import FunctionsListingPage from '../pages/Functions/FuntionsListingPage';
import CreateFunctionPage from '../pages/Functions/CreateFunctionPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import FunctionBinListing from '@/pages/Functions/bin/FunctionBinListing';
import PayerBinListing from '@/pages/Payers/bin/PayerBinListing';
import ProtectedRoute from '@/pages/ProtectedRoute/ProtectedRoute';
import ReportsPage from '@/pages/reports/ReportsPage';
import ChartsPage from '@/pages/reports/ChartsPage';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { path: '/', element: <FunctionsListingPage /> },
          { path: '/create_functions', element: <CreateFunctionPage /> },
          { path: '/charts', element: <ChartsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: '/payers', element: <PayerListing /> },
          { path: '/bin/functions_bin', element: <FunctionBinListing /> },
          { path: '/bin/payers_bin', element: <PayerBinListing /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
