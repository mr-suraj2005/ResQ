import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimulationBanner } from '../components/common/SimulationBanner';
import { Navbar } from '../components/common/Navbar';
import { AlertBanner } from '../components/common/AlertBanner';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SimulationBanner />
      <Navbar />
      <AlertBanner />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

