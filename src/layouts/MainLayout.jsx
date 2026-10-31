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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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


