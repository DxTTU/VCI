import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App Root Component
 * Configures React Router and Authentication Gatekeeping:
 * - / -> AuthGate: Full-screen Sign In & Sign Up (redirects to /dashboard if authenticated)
 * - /dashboard/* -> Protected Chapter Portal Layout (Sidebar, Header, Dashboard & Masters)
 * - Fallback -> Redirects unauthenticated access back to /
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Auth Gate (Sign In & Sign Up) */}
          <Route path="/" element={<AuthPage />} />

          {/* Protected Chapter Management Console */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
