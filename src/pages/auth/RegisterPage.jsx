import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Mail, Phone, MapPin, Lock, ShieldAlert, Check } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: 'Downtown Waterfront',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFillDemo = () => {
    setFormData({
      name: 'Elena Rostova',
      email: 'elena.rostova@seattle-resident.org',
      phone: '(206) 555-0428',
      zone: 'Capitol Hill',
      password: 'DemoPassword2026!'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register(formData);
    navigate('/my-reports');
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '600px', paddingTop: '2rem' }}>
      <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 44, 
            height: 44, 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--color-primary-600)', 
            color: '#FFFFFF',
            marginBottom: '0.75rem' 
          }}>
            <User size={22} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Citizen Registration</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: '0.25rem' }}>
            Register to submit localized disaster incident reports and receive emergency notifications
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginBottom: '1rem' 
        }}>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleFillDemo}
            style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}
          >
            Auto-fill Sample Citizen Profile
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Legal Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Contact Email <span className="required">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                required
                placeholder="citizen@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Mobile Phone (SMS Alerts)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="(206) 555-0199"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zone">
              Primary Residential / Work Zone
            </label>
            <select
              id="zone"
              name="zone"
              className="form-select"
              value={formData.zone}
              onChange={handleChange}
            >
              <option value="Downtown Waterfront">Downtown Waterfront &amp; Pioneer Square</option>
              <option value="Capitol Hill">Capitol Hill &amp; First Hill</option>
              <option value="South Lake Union">South Lake Union &amp; Cascade</option>
              <option value="Ballard">Ballard &amp; Magnolia</option>
              <option value="SoDo Industrial">SoDo Industrial District</option>
              <option value="West Seattle">West Seattle</option>
              <option value="Rainier Valley">Rainier Valley &amp; Beacon Hill</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Secure Password <span className="required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              required
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }}>
            <span>Complete Registration &amp; Enter Portal</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign In Here</Link>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '0.85rem', 
          backgroundColor: '#FFFBEB', 
          border: '1px solid #FDE68A', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '0.65rem'
        }}>
          <ShieldAlert size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: 'var(--text-xs)', color: '#92400E', lineHeight: 1.5 }}>
            <strong>Demo Sandbox:</strong> Registrations are persisted in local browser storage only for continuous testing without external telemetry leak.
          </div>
        </div>
      </div>
    </div>
  );
};

