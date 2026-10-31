import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SimulationBanner } from '../components/common/SimulationBanner';
import { Navbar } from '../components/common/Navbar';
import { AlertBanner } from '../components/common/AlertBanner';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div 
      className={`main-layout ${isHomePage ? 'main-layout-home' : ''}`} 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: isHomePage ? 'var(--color-primary-900)' : 'var(--color-bg-canvas)'
      }}
    >
      <SimulationBanner />
      <Navbar />
      {/* On the homepage, Critical Emergency Alerts is Section 4 in the requested homepage sequence */}
      {!isHomePage && <AlertBanner />}
      <main className="main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};


