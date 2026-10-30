import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EmergencyDataProvider } from './context/EmergencyDataContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ResponderLayout } from './layouts/ResponderLayout';

// Public & Citizen Pages
import { HomePage } from './pages/public/HomePage';
import { DisasterMapPage } from './pages/public/DisasterMapPage';
import { AlertsPage } from './pages/public/AlertsPage';
import { ShelterFinderPage } from './pages/public/ShelterFinderPage';
import { ReportEmergencyPage } from './pages/citizen/ReportEmergencyPage';
import { CitizenReportsPage } from './pages/citizen/CitizenReportsPage';
import { CitizenLoginPage } from './pages/auth/CitizenLoginPage';
import { OfficialLoginPage } from './pages/auth/OfficialLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { IncidentManagementPage } from './pages/admin/IncidentManagementPage';
import { AlertManagementPage } from './pages/admin/AlertManagementPage';
import { ResourceManagementPage } from './pages/admin/ResourceManagementPage';

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
              <Route path="login" element={<CitizenLoginPage />} />
              <Route path="official-login" element={<OfficialLoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Administrator Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="incidents" element={<IncidentManagementPage />} />
              <Route path="alerts" element={<AlertManagementPage />} />
              <Route path="resources" element={<ResourceManagementPage />} />
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
