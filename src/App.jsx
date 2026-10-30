import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EmergencyDataProvider } from './context/EmergencyDataContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { ResponderLayout } from './layouts/ResponderLayout';

// Public & Citizen Pages
import { HomePage } from './pages/public/HomePage';
import { DisasterMapPage } from './pages/public/DisasterMapPage';
import { AlertsPage } from './pages/public/AlertsPage';
import { ShelterFinderPage } from './pages/public/ShelterFinderPage';
import { ReportEmergencyPage } from './pages/citizen/ReportEmergencyPage';
import { CitizenReportsPage } from './pages/citizen/CitizenReportsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Responder Page
import { ResponderDashboardPage } from './pages/responder/ResponderDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmergencyDataProvider>
          <Routes>
            {/* Public & Citizen Portal */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="map" element={<DisasterMapPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="shelters" element={<ShelterFinderPage />} />
              <Route path="report" element={<ReportEmergencyPage />} />
              <Route path="my-reports" element={<CitizenReportsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="official-login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Emergency Responder Portal */}
            <Route path="/responder" element={<ResponderLayout />}>
              <Route index element={<ResponderDashboardPage />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EmergencyDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
