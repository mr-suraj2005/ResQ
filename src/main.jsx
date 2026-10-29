import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Global Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Civic Authority Design System CSS
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
