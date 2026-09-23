import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AssetsPage } from './pages/assets/AssetsPage';
import { AssetDetailPage } from './pages/assets/AssetDetailPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { AuditPage } from './pages/audit/AuditPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
function ProtectedRoute({
  children,
  requiredRole
}: {
  children: JSX.Element;
  requiredRole?: 'ADMIN' | 'MANAGER';
}) {
  const { user, loading, isAdmin, isManager } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading AssetFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'MANAGER' && !isManager && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Login Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Authenticated Layout and Nested Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Assets */}
          <Route path="assets" element={<AssetsPage />} />
          <Route path="assets/:id" element={<AssetDetailPage />} />

          {/* Assignments */}
          <Route path="assignments" element={<AssignmentsPage />} />

          {/* Maintenance (Manager / Admin Only) */}
          <Route
            path="maintenance"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <MaintenancePage />
              </ProtectedRoute>
            }
          />

          {/* Issue Reports */}
          <Route path="reports" element={<ReportsPage />} />

          {/* Analytics & Reports (Manager / Admin Only) */}
          <Route
            path="analytics"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* User Management (Admin Only) */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* System Audit Trail (Admin Only) */}
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="audit"
            element={<Navigate to="/audit-logs" replace />}
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
