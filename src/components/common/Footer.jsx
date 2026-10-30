import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Mail, Radio, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="main-footer" role="contentinfo">
      <div className="container footer-top">
        <div className="footer-grid">
          {/* Col 1: Authority & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#FFFFFF', fontWeight: 700 }}>
              <Shield size={20} color="#3B82F6" />
              <span>ResQ Disaster Response Hub</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: 'var(--text-sm)', marginBottom: '1rem', maxWidth: '380px' }}>
              Interagency emergency coordination, incident reporting, and real-time situational telemetry synchronized with national and regional disaster mitigation authorities.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="system-status-indicator">
                <span className="system-status-dot" aria-hidden="true"></span>
                <span>National Telemetry Feed Active &amp; Operational</span>
              </div>
            </div>
          </div>

          {/* Col 2: Centralized Helplines (India) */}
          <div>
            <h4 className="footer-col-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PhoneCall size={14} color="#F87171" />
              <span>Centralized Helplines (India)</span>
            </h4>

            <ul className="footer-helplines">
              {/* 1. National Disaster Helpline & Delhi Control */}
              <li className="helpline-group">
                <div className="helpline-agency">
                  <span>National Emergency &amp; Delhi Control:</span>
                </div>
                <div className="helpline-numbers">
                  <a href="tel:112" className="helpline-badge-critical" title="Call National Emergency 112">
                    112 (National Helpline)
                  </a>
                  <span className="helpline-sep">|</span>
                  <a href="tel:1077" className="helpline-badge-warning" title="Call Delhi Disaster Control 1077">
                    1077 (Delhi Control)
                  </a>
                </div>
              </li>

              {/* 2. NDMA India */}
              <li className="helpline-group">
                <div className="helpline-agency">
                  <span>NDMA Control Room:</span>
                </div>
                <div className="helpline-numbers">
                  <a href="tel:1078" className="helpline-badge-warning" title="Call NDMA Shortcode 1078">
                    1078
                  </a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:0111078">011-1078</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01126701700">011-26701700</a>
                </div>
              </li>

              {/* 3. NDRF Control Room */}
              <li className="helpline-group">
                <div className="helpline-agency">
                  <span>NDRF Control Room &amp; Operations:</span>
                </div>
                <div className="helpline-numbers">
                  <a href="tel:09711077372">09711077372</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01126107953">011-26107953</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01124363260">011-24363260</a>
                </div>
                <div style={{ fontSize: '0.74rem', marginTop: '0.15rem' }}>
                  <a 
                    href="mailto:ndrfhq@nic.in" 
                    style={{ color: '#38BDF8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}
                  >
                    <Mail size={12} />
                    <span>ndrfhq@nic.in</span>
                  </a>
                </div>
              </li>

              {/* 4. Army Helpline */}
              <li className="helpline-group">
                <div className="helpline-agency">
                  <span>Army Disaster Support Cell:</span>
                </div>
                <div className="helpline-numbers">
                  <a href="tel:01123332045">011-23332045</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123019831">011-23019831</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123322045">011-23322045</a>
                </div>
              </li>

              {/* 5. MHA Control Room */}
              <li className="helpline-group">
                <div className="helpline-agency">
                  <span>Ministry of Home Affairs (MHA) Control:</span>
                </div>
                <div className="helpline-numbers">
                  <a href="tel:01123093054">011-23093054</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123092763">23092763</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123092923">23092923</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123093566">23093566</a>
                  <span className="helpline-sep">&middot;</span>
                  <a href="tel:01123093563">23093563</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Public Services */}
          <div>
            <h4 className="footer-col-title">Public Portals</h4>
            <ul className="footer-links">
              <li><Link to="/map" className="footer-link">Live Incident Map</Link></li>
              <li><Link to="/alerts" className="footer-link">Emergency Broadcasts</Link></li>
              <li><Link to="/shelters" className="footer-link">Shelter Directory</Link></li>
              <li><Link to="/report" className="footer-link">Report an Emergency</Link></li>
              <li><Link to="/my-reports" className="footer-link">Citizen Incident Tracking</Link></li>
            </ul>
          </div>

          {/* Col 4: Administrative */}
          <div>
            <h4 className="footer-col-title">Operations</h4>
            <ul className="footer-links">
              <li><Link to="/responder" className="footer-link">Field Responder Terminal</Link></li>
              <li><Link to="/login" className="footer-link">Staff Authentication</Link></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Spring Boot REST v1.4</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <div>
          &copy; 2026 ResQ Incident Management System. Educational &amp; Technical Portfolio Demonstration.
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>Privacy Policy</span>
          <span>Security Standard NIST 800-53</span>
          <span>Open Civic Telemetry</span>
        </div>
      </div>
    </footer>
  );
};
