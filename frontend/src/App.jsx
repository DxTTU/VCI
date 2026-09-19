import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthScreen from './pages/AuthScreen';
import DashboardLayout from './pages/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * App Root Component
 * Configures React Router and Authentication Gatekeeping:
 * - / -> Public Landing Page (Unified Digital Community Portal)
 * - /login -> Public Authentication Screen (Sign In & Sign Up / Onboarding)
 * - /dashboard/* -> Protected Chapter Portal Layout (Sidebar, Header, Dashboard & Masters)
 * - /member-master -> Protected Member Master View
 * - /club-master -> Protected Club Master View
 * - /pst-master -> Protected PST Master View
 * - /audit-logs -> Protected Dedicated System Telemetry / Audit Records Route
 * - Fallback -> Redirects back to /
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Authentication Screen */}
          <Route path="/login" element={<AuthScreen />} />

          {/* Protected Chapter Management Console */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Protected Direct Master Modules */}
          <Route
            path="/member-master"
            element={
              <ProtectedRoute>
                <DashboardLayout initialView="member-master" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/club-master"
            element={
              <ProtectedRoute>
                <DashboardLayout initialView="club-master" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pst-master"
            element={
              <ProtectedRoute>
                <DashboardLayout initialView="pst-master" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/drz-master"
            element={
              <ProtectedRoute>
                <DashboardLayout initialView="drz-master" />
              </ProtectedRoute>
            }
          />

          {/* Protected Dedicated System Telemetry / Audit Records Route */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <DashboardLayout initialView="audit-logs" />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
