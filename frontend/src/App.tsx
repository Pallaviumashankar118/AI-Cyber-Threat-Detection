import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ThreatMonitorPage from './pages/ThreatMonitorPage';
import AttackLabPage from './pages/AttackLabPage';
import AIAnalyticsPage from './pages/AIAnalyticsPage';
import IncidentCenterPage from './pages/IncidentCenterPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#111C2F',
                color: '#FFFFFF',
                border: '1px solid rgba(18, 216, 250, 0.2)',
                borderRadius: '12px',
                fontSize: '13px',
              },
              success: {
                iconTheme: { primary: '#2DE37C', secondary: '#08111F' },
              },
              error: {
                iconTheme: { primary: '#FF5B6B', secondary: '#08111F' },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="threats" element={<ThreatMonitorPage />} />
              <Route path="attack-lab" element={<AttackLabPage />} />
              <Route path="ai-analytics" element={<AIAnalyticsPage />} />
              <Route path="incidents" element={<IncidentCenterPage />} />
              <Route path="prediction-history" element={<PredictionHistoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SecurityProvider>
    </AuthProvider>
  );
}
