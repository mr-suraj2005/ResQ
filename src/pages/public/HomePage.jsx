import React from 'react';
import { Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  AlertTriangle, 
  Building2, 
  ShieldAlert, 
  Truck, 
  MapPin, 
  Compass, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Droplets,
  Zap,
  HeartPulse,
  Package,
  BookOpen
} from 'lucide-react';

const CATEGORY_ICONS = {
  FLOOD: Droplets,
  FIRE: Flame,
  POWER: Zap,
  MEDICAL: HeartPulse,
  HAZMAT: AlertTriangle,
  INFRASTRUCTURE: Building2
};

export const HomePage = () => {
  const { 
    incidents, 
    activeIncidents, 
    openShelters, 
    criticalAlerts, 
    deployedUnits 
  } = useEmergencyData();

  // Filter verified / active incidents to show in the civic feed
  const recentIncidents = incidents
    .filter(inc => inc.status !== 'REJECTED')
    .slice(0, 6);

  return (
    <div className="container page-container">
      {/* High-Priority Command Header */}
      <section 
        style={{
          backgroundColor: 'var(--color-primary-900)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-labelledby="hero-title"
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.45rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '0.25rem 0.65rem', 
            borderRadius: 'var(--radius-pill)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: '#E2E8F0',
            marginBottom: '1rem',
            letterSpacing: '0.04em'
          }}>
            <ShieldAlert size={14} color="#F87171" />
            <span>OFFICIAL EMERGENCY MANAGEMENT NETWORK &bull; METRO SEATTLE</span>
          </div>

          <h1 
            id="hero-title"
            style={{ 
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', 
              fontWeight: 800, 
              lineHeight: 1.2, 
              color: '#FFFFFF',
              marginBottom: '1rem' 
            }}
          >
            Real-Time Crisis Coordination &amp; Citizen Relief
          </h1>

          <p style={{ 
            fontSize: 'var(--text-base)', 
            color: '#CBD5E1', 
            lineHeight: 1.6, 
            marginBottom: '2rem',
            maxWidth: '680px' 
          }}>
            ResQ synchronizes emergency telemetry between citizens, first responders, and municipal command centers. Report incidents instantly, monitor verified hazards on the live map, or locate active disaster shelters.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Strictly Reserved Emergency Red CTA */}
            <Link to="/report" className="btn btn-emergency btn-lg">
              <AlertTriangle size={18} strokeWidth={2.2} />
              <span>Report Emergency Incident</span>
            </Link>

            <Link to="/shelters" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#FFFFFF', color: 'var(--color-primary-900)' }}>
              <Building2 size={18} strokeWidth={1.75} />
              <span>Find Nearest Shelter</span>
            </Link>

            <Link to="/map" className="btn btn-outline btn-lg" style={{ color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.3)' }}>
              <Compass size={18} strokeWidth={1.75} />
              <span>Explore Threat Map</span>
            </Link>
          </div>
        </div>

        {/* Subtle geometric emblem backdrop */}
        <div 
          aria-hidden="true" 
          style={{ 
            position: 'absolute', 
            right: '-40px', 
            bottom: '-40px', 
            opacity: 0.05, 
            pointerEvents: 'none' 
          }}
        >
          <ShieldAlert size={360} />
        </div>
      </section>

      {/* 4 Live StatCard Counters */}
      <section aria-label="Regional Status Indicators" style={{ marginBottom: '2.5rem' }}>
        <div className="grid-4">
          <StatCard
            title="Active Incidents"
            value={activeIncidents.length}
            icon={AlertTriangle}
            accent="red"
            meta="Coordinated by Seattle EOC"
          />

          <StatCard
            title="Open Shelters & Hubs"
            value={openShelters.length}
            icon={Building2}
            accent="emerald"
            meta="Capacity tracked in real time"
          />

          <StatCard
            title="Critical Broadcasts"
            value={criticalAlerts.length}
            icon={ShieldAlert}
            accent="amber"
            meta="Issued by public authorities"
          />

          <StatCard
            title="Deployed Units"
            value={deployedUnits}
            icon={Truck}
            accent="blue"
            meta="Fire, Marine & Medical active"
          />
        </div>
      </section>

      {/* Main Grid: Verified Incidents + Preparedness Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Recent Incident Feed */}
        <section aria-labelledby="incidents-heading">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 id="incidents-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                Recent Operational Incidents
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>
                Field incidents validated and tracked across metro Seattle
              </p>
            </div>

            <Link to="/map" className="btn btn-outline btn-sm">
              <span>View On Live Map</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentIncidents.map((incident) => {
              const CategoryIcon = CATEGORY_ICONS[incident.category] || AlertTriangle;

              return (
                <article 
                  key={incident.id} 
                  className="card"
                  style={{ padding: '1.25rem', transition: 'box-shadow var(--transition-fast)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="mono-id">{incident.id}</span>
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                    </div>

                    <div className="timestamp" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      <span>{new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: '0.4rem' }}>
                    {incident.title}
                  </h3>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                    {incident.description}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    borderTop: '1px solid var(--color-border)', 
                    paddingTop: '0.75rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-neutral-500)',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} color="var(--color-primary-600)" />
                      <span>{incident.address}</span>
                    </div>

                    {incident.assignedUnit && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-neutral-700)', fontWeight: 500 }}>
                        <Truck size={13} />
                        <span>Unit: {incident.assignedUnit}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Right Column: Emergency Preparedness & Civic Directives */}
        <aside aria-labelledby="preparedness-heading">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 id="preparedness-heading" style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              Civic Preparedness
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>
              Standard operating procedures for emergencies
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Action Card 1: Flash Flood Safety */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--color-primary-100)', 
                  color: 'var(--color-primary-700)', 
                  padding: '0.4rem', 
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  <Droplets size={18} />
                </div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Flooding Protocols</h3>
              </div>
              <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-700)', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                <li>Do NOT walk or drive through flowing water (&ldquo;Turn Around, Don&rsquo;t Drown&rdquo;).</li>
                <li>Disconnect electrical appliances if water enters your premises.</li>
                <li>Move vital documents and medication to highest floor.</li>
              </ul>
            </div>

            {/* Action Card 2: 72-Hour Go-Bag Checklist */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--color-warning-100)', 
                  color: 'var(--color-warning-800)', 
                  padding: '0.4rem', 
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  <Package size={18} />
                </div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>72-Hour Evacuation Go-Bag</h3>
              </div>
              <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-700)', paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                <li>1 Gallon of water per person per day.</li>
                <li>Non-perishable rations &amp; manual can opener.</li>
                <li>Battery-powered or hand-crank NOAA radio.</li>
                <li>N95 particulate masks &amp; first aid supplies.</li>
              </ul>
            </div>

            {/* Action Card 3: Gas & Utility Safety */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--color-emergency-100)', 
                  color: 'var(--color-emergency-700)', 
                  padding: '0.4rem', 
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  <Zap size={18} />
                </div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>Utility Gas &amp; Power Safety</h3>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-700)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                If you smell natural gas (sulfur / rotten eggs), evacuate immediately. Do NOT toggle light switches or operate cellular phones indoors.
              </p>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-emergency-700)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span>National Emergency: <a href="tel:112" style={{ color: 'inherit', textDecoration: 'underline' }}>112</a></span>
                <span>&bull;</span>
                <span>Gas Leakage Toll-Free: <a href="tel:1906" style={{ color: 'inherit', textDecoration: 'underline' }}>1906</a></span>
              </div>
            </div>

            {/* Direct report promo */}
            <div style={{ 
              backgroundColor: 'var(--color-neutral-100)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.25rem',
              border: '1px solid var(--color-border)' 
            }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)', marginBottom: '0.35rem' }}>
                Witnessed an emergency?
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)', marginBottom: '0.75rem' }}>
                Your citizen report notifies EOC dispatch and alerts local responders within seconds.
              </p>
              <Link to="/report" className="btn btn-emergency btn-sm btn-block">
                <span>Submit Citizen Report</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

