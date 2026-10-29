import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  AlertOctagon, 
  Building2, 
  Truck, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Activity,
  Layers,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const CATEGORY_COLORS = {
  FLOOD: '#2563EB',
  FIRE: '#DC2626',
  HAZMAT: '#D97706',
  INFRASTRUCTURE: '#475569',
  POWER: '#EAB308',
  MEDICAL: '#10B981',
  GENERAL: '#8B5CF6'
};

const STATUS_COLORS = {
  PENDING_REVIEW: '#F59E0B',
  VERIFIED: '#3B82F6',
  DISPATCHED: '#8B5CF6',
  EN_ROUTE: '#06B6D4',
  ON_SCENE: '#DC2626',
  RESOLVED: '#10B981',
  REJECTED: '#64748B'
};

export const AdminDashboardPage = () => {
  const { 
    incidents, 
    alerts, 
    shelters, 
    activeIncidents, 
    pendingIncidents, 
    criticalAlerts, 
    deployedUnits,
    verifyIncident,
    rejectIncident
  } = useEmergencyData();

  const { currentUser } = useAuth();

  // Chart 1: Incidents by Category / Type
  const categoryChartData = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      const cat = inc.category || 'OTHER';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      fill: CATEGORY_COLORS[category] || '#1D4ED8'
    }));
  }, [incidents]);

  // Chart 2: Incidents by Operational Status Breakdown
  const statusChartData = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      const stat = inc.status || 'PENDING_REVIEW';
      counts[stat] = (counts[stat] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count,
      color: STATUS_COLORS[status] || '#64748B'
    }));
  }, [incidents]);

  // Total capacity across all shelters
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const overallOccupancyPct = totalShelterCapacity > 0 
    ? Math.round((totalShelterOccupancy / totalShelterCapacity) * 100) 
    : 0;

  return (
    <div>
      <PageHeader
        title="Unified Command Intelligence"
        subtitle="Live incident dispatch analytics, threat distribution metrics, and priority citizen triage queue."
        breadcrumb="EOC ADMINISTRATION / EXECUTIVE OVERVIEW"
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Link to="/admin/incidents" className="btn btn-primary btn-sm">
              <AlertOctagon size={15} />
              <span>Full Incident Queue</span>
            </Link>
            <Link to="/admin/alerts" className="btn btn-emergency btn-sm">
              <BellRing size={15} />
              <span>Broadcast Emergency</span>
            </Link>
          </div>
        }
      />

      {/* 4 Executive KPI StatCards */}
      <section aria-label="Executive KPIs" style={{ marginBottom: '2rem' }}>
        <div className="grid-4">
          <StatCard
            title="Active Emergencies"
            value={activeIncidents.length}
            icon={AlertOctagon}
            accent="red"
            meta={`${criticalAlerts.length} Critical Public Broadcasts`}
          />

          <StatCard
            title="Pending Verification"
            value={pendingIncidents.length}
            icon={Clock}
            accent="amber"
            meta="Awaiting dispatcher clearance"
          />

          <StatCard
            title="Deployed CAD Units"
            value={deployedUnits}
            icon={Truck}
            accent="blue"
            meta="Fire, Marine &amp; Medic units on scene"
          />

          <StatCard
            title="Shelter System Load"
            value={`${overallOccupancyPct}%`}
            icon={Building2}
            accent="emerald"
            meta={`${totalShelterOccupancy} of ${totalShelterCapacity} beds occupied`}
          />
        </div>
      </section>

      {/* Analytics Recharts Visualizations */}
      <section aria-label="Incident Analytics" style={{ marginBottom: '2rem' }}>
        <div className="grid-2">
          {/* Chart 1: Incidents by Category */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-header" style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <div>
                <h3 className="card-title">
                  <Activity size={18} color="var(--color-primary-600)" />
                  <span>Incidents by Disaster Classification</span>
                </h3>
                <div className="card-subtitle">Volume distribution across regional threat classes</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#475569' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderRadius: '6px', 
                      color: '#FFFFFF', 
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
                    }}
                    cursor={{ fill: 'rgba(29, 78, 216, 0.06)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Status Breakdown Pie Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="card-header" style={{ padding: '0 0 1rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <div>
                <h3 className="card-title">
                  <TrendingUp size={18} color="var(--color-warning-600)" />
                  <span>Incident Operational Status Breakdown</span>
                </h3>
                <div className="card-subtitle">Active lifecycle pipeline from review to resolution</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderRadius: '6px', 
                      color: '#FFFFFF', 
                      fontSize: '12px',
                      border: 'none' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Status Chart Legend */}
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '0.5rem' }}>
                {statusChartData.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '2px', backgroundColor: item.color, flexShrink: 0 }}></span>
                      <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-neutral-600)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priority Action Queue: Pending Citizen Reports Table */}
      <section className="card" aria-labelledby="queue-heading">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span id="queue-heading" className="card-title">
              <Clock size={18} color="var(--color-warning-600)" />
              <span>Priority Action Queue: Unverified Citizen Reports</span>
            </span>
            {pendingIncidents.length > 0 && (
              <span className="sidebar-badge danger">{pendingIncidents.length} Awaiting Action</span>
            )}
          </div>

          <Link to="/admin/incidents" className="btn btn-outline btn-xs">
            <span>Open Incident Management Table</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          {pendingIncidents.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-100)',
                color: 'var(--color-success-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}>
                <CheckCircle2 size={24} />
              </div>
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Triage Queue Clear
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', maxWidth: '420px', margin: '0.25rem auto 0' }}>
                All incoming citizen reports have been verified or resolved. New submissions will immediately populate here.
              </p>
            </div>
          ) : (
            <table className="civic-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Incident Summary &amp; Address</th>
                  <th>Classification</th>
                  <th>Assessed Severity</th>
                  <th>Reporting Party</th>
                  <th style={{ textAlign: 'right' }}>Direct Triage Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingIncidents.map(inc => (
                  <tr key={inc.id}>
                    <td><span className="mono-id">{inc.id}</span></td>
                    <td style={{ maxWidth: '340px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{inc.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <MapPin size={11} color="var(--color-primary-600)" />
                        <span>{inc.address}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                        {inc.category}
                      </span>
                    </td>
                    <td><SeverityBadge severity={inc.severity} /></td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{inc.reportedBy}</div>
                      <div className="timestamp">{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          onClick={() => verifyIncident(inc.id, currentUser.name)}
                          title="Authorize and verify incident"
                        >
                          <CheckCircle size={13} />
                          <span>Verify</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          style={{ color: 'var(--color-emergency-600)', borderColor: 'var(--color-emergency-200)' }}
                          onClick={() => rejectIncident(inc.id, 'Deemed duplicate or non-actionable by EOC dispatcher', currentUser.name)}
                          title="Reject report"
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};
