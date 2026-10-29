import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SimulationBanner } from '../components/common/SimulationBanner';
import { DashboardSidebar } from '../components/common/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import { useEmergencyData } from '../context/EmergencyDataContext';
import { Shield, Bell, ExternalLink, RefreshCw } from 'lucide-react';

export const AdminLayout = () => {
  const { currentUser } = useAuth();
  const { criticalAlerts, pendingIncidents, resetToFactoryData } = useEmergencyData();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SimulationBanner />
      
      <div className="dashboard-layout">
        <DashboardSidebar type="admin" />

        <div className="dashboard-main">
          {/* Top Admin Telemetry Header */}
          <header className="dashboard-header" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                backgroundColor: 'var(--color-primary-100)', 
                color: 'var(--color-primary-700)', 
                padding: '0.4rem', 
                borderRadius: 'var(--radius-sm)' 
              }}>
                <Shield size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                  EOC Unified Command Dashboard
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  Spring Boot REST v1.4 &bull; Multi-Agency Incident Dispatch
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)' }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: '#22C55E', 
                  display: 'inline-block' 
                }}></span>
                <span style={{ fontWeight: 600, color: 'var(--color-neutral-700)' }}>Dispatch Link Active</span>
              </div>

              <Link 
                to="/map" 
                className="btn btn-outline btn-xs"
                target="_blank"
                rel="noreferrer"
                title="Open Public Threat Map in new tab"
              >
                <span>Live Map</span>
                <ExternalLink size={12} />
              </Link>

              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={resetToFactoryData}
                title="Reset simulation data to default initial seed"
              >
                <RefreshCw size={13} />
                <span>Reset Seed</span>
              </button>
            </div>
          </header>

          <main className="dashboard-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

