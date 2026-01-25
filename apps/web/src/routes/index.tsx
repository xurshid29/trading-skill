import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ScreeningsPage } from '../pages/ScreeningsPage';
import { ScreeningDetailPage } from '../pages/ScreeningDetailPage';
import { AnalysisPage } from '../pages/AnalysisPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'screenings', element: <ScreeningsPage /> },
      { path: 'screenings/:id', element: <ScreeningDetailPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'analysis/:ticker', element: <AnalysisPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
