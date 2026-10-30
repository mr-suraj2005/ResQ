import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SimulationBanner } from '../components/common/SimulationBanner';
import { DashboardSidebar } from '../components/common/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import { Radio, MapPin, Wifi, Shield } from 'lucide-react';

export const ResponderLayout = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SimulationBanner />

      <div className="dashboard-layout">
        <DashboardSidebar type="responder" />

        <div className="dashboard-main">
          {/* Top Responder Tactical Bar */}
          <header className="dashboard-header" role="banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                backgroundColor: 'var(--color-success-100)', 
                color: 'var(--color-success-800)', 
                padding: '0.4rem', 
                borderRadius: 'var(--radius-sm)' 
              }}>
                <Radio size={18} strokeWidth={2} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                  Tactical Unit MDT (Mobile Data Terminal)
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                  Unit: {currentUser?.unit || 'Marine Rescue Unit 1'} &bull; Operator: {currentUser?.name || 'Field Operator'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: 'var(--text-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success-700)', fontWeight: 600 }}>
                <Wifi size={14} />
                <span>Encrypted CAD Stream Connected</span>
              </div>

              <Link to="/map" className="btn btn-outline btn-xs">
                <MapPin size={12} />
                <span>Tactical Map</span>
              </Link>
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

