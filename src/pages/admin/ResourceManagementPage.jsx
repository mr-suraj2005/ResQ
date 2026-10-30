import React, { useState } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  Building2, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  HeartPulse, 
  Warehouse, 
  ShieldCheck, 
  MapPin,
  Phone
} from 'lucide-react';

export const ResourceManagementPage = () => {
  const { 
    shelters, 
    inventory, 
    updateShelter, 
    updateInventory 
  } = useEmergencyData();

  const [activeTab, setActiveTab] = useState('shelters'); // 'shelters' | 'inventory'

  // Summary Metrics
  const totalBeds = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const occupiedBeds = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const lowStockItems = inventory.filter(i => i.status !== 'SUFFICIENT').length;

  return (
    <div>
      <PageHeader
        title="National Disaster Facilities &amp; Resource Logistics"
        subtitle="Operational command and live tracking of verified national apex trauma centers, cyclone shelter networks, and response forces across India."
        breadcrumb="ADMINISTRATION / NATIONAL RESOURCES"
      />

      {/* Resource Health Overview Row */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            National Intake &amp; Readiness Load
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {occupiedBeds.toLocaleString()} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-neutral-500)' }}>/ {totalBeds.toLocaleString()} capacity ({Math.round((occupiedBeds / totalBeds) * 100)}%)</span>
          </div>
          <div className="occupancy-bar-bg" style={{ marginTop: '0.65rem', height: 7 }}>
            <div 
              className="occupancy-bar-fill occupancy-normal"
              style={{ width: `${Math.round((occupiedBeds / totalBeds) * 100)}%` }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            Verified National Facilities
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {shelters.length} Strategic Hubs
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 600, marginTop: '0.5rem' }}>
            10 Apex Hospitals &bull; 10 Shelter Networks &bull; 10 NDRF Battalions
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            National Relief Stockpiles
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: lowStockItems > 0 ? 'var(--color-warning-700)' : 'var(--color-success-700)' }}>
            {lowStockItems > 0 ? `${lowStockItems} Low Stock Alerts` : 'All Stockpiles Healthy'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
            Trauma kits, inflatable zodiacs, potable water &amp; emergency generators
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'shelters' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('shelters')}
          style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
        >
          <Building2 size={16} />
          <span>Verified National Facilities Directory ({shelters.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inventory')}
          style={{ borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)' }}
        >
          <Boxes size={16} />
          <span>National Relief Stockpiles &amp; Depots ({inventory.length})</span>
        </button>
      </div>

      {/* Tab 1: Shelters Manager */}
      {activeTab === 'shelters' ? (
        <div className="table-container" style={{ borderRadius: 'var(--radius-lg)' }}>
          <table className="civic-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Facility &amp; Location</th>
                <th>Type</th>
                <th>Verified Details</th>
                <th>Intake / Capacity</th>
                <th>Operational Status</th>
                <th>Emergency Contact</th>
                <th style={{ textAlign: 'right' }}>Capacity Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((s) => {
                const pct = Math.round((s.occupancy / s.capacity) * 100);
                const isHospital = s.type === 'Hospital' || s.type === 'HOSPITAL';
                const isResponse = s.type === 'Response Force';

                return (
                  <tr key={s.id}>
                    <td>
                      <span 
                        className="mono-id"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-pill)'
                        }}
                      >
                        {s.id}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-neutral-900)' }}>{s.facility || s.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <MapPin size={11} color="var(--color-primary-600)" />
                        <span>{s.location || s.district} &bull; {s.address}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        fontWeight: 700, 
                        color: isHospital ? '#1E40AF' : isResponse ? '#B45309' : '#065F46',
                        backgroundColor: isHospital ? '#EFF6FF' : isResponse ? '#FEF3C7' : '#ECFDF5',
                        border: isHospital ? '1px solid #BFDBFE' : isResponse ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-pill)'
                      }}>
                        {s.type}
                      </span>
                    </td>

                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: '#15803D',
                        backgroundColor: '#DCFCE7',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-pill)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        <ShieldCheck size={12} />
                        <span>{s.verifiedDetails}</span>
                      </span>
                    </td>

                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span>{s.occupancy.toLocaleString()} / {s.capacity.toLocaleString()}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="occupancy-bar-bg" style={{ height: 6 }}>
                        <div 
                          className="occupancy-bar-fill occupancy-normal"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className="badge severity-low" style={{ borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>
                        {s.status}
                      </span>
                    </td>

                    <td>
                      <a 
                        href={`tel:${(s.emergencyContact || s.phone || '112').split('/')[0].trim()}`} 
                        style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-600)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Phone size={12} />
                        <span>{s.emergencyContact || s.phone}</span>
                      </a>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateShelter(s.id, Math.max(0, s.occupancy - 100))}
                          title="Decrease occupied by 100"
                        >
                          <Minus size={11} /> 100
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateShelter(s.id, Math.min(s.capacity, s.occupancy + 100))}
                          title="Increase occupied by 100"
                        >
                          <Plus size={11} /> 100
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tab 2: Relief Inventory Manager */
        <div className="table-container" style={{ borderRadius: 'var(--radius-lg)' }}>
          <table className="civic-table">
            <thead>
              <tr>
                <th>Stockpile ID</th>
                <th>Item Description &amp; Depot</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Minimum Reserve</th>
                <th>Health Status</th>
                <th style={{ textAlign: 'right' }}>Adjust Stockpile Count</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isCrit = item.status === 'CRITICAL';
                const isWarn = item.status === 'WARNING';

                return (
                  <tr key={item.id}>
                    <td><span className="mono-id">{item.id}</span></td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{item.item}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Warehouse size={11} />
                        <span>{item.warehouse}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {item.quantity.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginLeft: '0.25rem' }}>
                        {item.unit}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-600)' }}>
                        {item.minThreshold.toLocaleString()} {item.unit}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${
                        isCrit ? 'severity-critical' : isWarn ? 'severity-high' : 'severity-low'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateInventory(item.id, Math.max(0, item.quantity - 50))}
                          title="Decrease quantity by 50"
                        >
                          <Minus size={11} /> 50
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateInventory(item.id, item.quantity + 50)}
                          title="Increase quantity by 50"
                        >
                          <Plus size={11} /> 50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
