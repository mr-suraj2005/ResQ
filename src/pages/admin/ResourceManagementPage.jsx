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
  Droplet, 
  BatteryCharging,
  Warehouse,
  ShieldAlert,
  MapPin
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
        title="Resource &amp; Logistics Command"
        subtitle="Live tracking of municipal shelter capacity, critical disaster stockpiles, and relief warehouse inventory."
        breadcrumb="ADMINISTRATION / RESOURCE LOGISTICS"
      />

      {/* Resource Health Overview Row */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            Shelter Capacity Load
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {occupiedBeds} <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-neutral-500)' }}>/ {totalBeds} beds ({Math.round((occupiedBeds / totalBeds) * 100)}%)</span>
          </div>
          <div className="occupancy-bar-bg" style={{ marginTop: '0.65rem' }}>
            <div 
              className="occupancy-bar-fill occupancy-normal"
              style={{ width: `${Math.round((occupiedBeds / totalBeds) * 100)}%` }}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            Facilities Monitored
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {shelters.length} Facilities
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', fontWeight: 600, marginTop: '0.5rem' }}>
            {shelters.filter(s => s.status === 'OPEN').length} Open &bull; {shelters.filter(s => s.status === 'NEAR_CAPACITY').length} Near Capacity
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
            Inventory Reserves
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: lowStockItems > 0 ? 'var(--color-warning-700)' : 'var(--color-success-700)' }}>
            {lowStockItems > 0 ? `${lowStockItems} Low Stock Alerts` : 'All Stockpiles Healthy'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
            Water, trauma kits, food rations &amp; generators
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'shelters' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('shelters')}
        >
          <Building2 size={16} />
          <span>Shelter Facilities Directory ({shelters.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Boxes size={16} />
          <span>Relief Stockpiles &amp; Warehouses ({inventory.length})</span>
        </button>
      </div>

      {/* Tab 1: Shelters Manager */}
      {activeTab === 'shelters' ? (
        <div className="table-container">
          <table className="civic-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Facility &amp; Location</th>
                <th>Classification</th>
                <th>Occupancy / Capacity</th>
                <th>Status</th>
                <th>Medical Supplies</th>
                <th>Bed Adjustments</th>
                <th style={{ textAlign: 'right' }}>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((s) => {
                const pct = Math.round((s.occupancy / s.capacity) * 100);
                const isFull = pct >= 100;
                const isNearCapacity = pct >= 80 && pct < 100;

                const barClass = isFull 
                  ? 'occupancy-critical' 
                  : isNearCapacity 
                    ? 'occupancy-warning' 
                    : 'occupancy-normal';

                return (
                  <tr key={s.id}>
                    <td><span className="mono-id">{s.id}</span></td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{s.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={11} color="var(--color-primary-600)" />
                        <span>{s.address} ({s.district})</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        fontWeight: 700, 
                        color: s.type === 'HOSPITAL' ? '#15803D' : '#0A192F',
                        backgroundColor: s.type === 'HOSPITAL' ? '#DCFCE7' : '#DBEAFE',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-xs)'
                      }}>
                        {s.type}
                      </span>
                    </td>

                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <span>{s.occupancy} / {s.capacity} beds</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="occupancy-bar-bg" style={{ height: 6 }}>
                        <div 
                          className={`occupancy-bar-fill ${barClass}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </td>

                    <td>
                      <span className={`badge ${
                        s.status === 'OPEN' ? 'severity-low' : s.status === 'NEAR_CAPACITY' ? 'severity-high' : 'severity-critical'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        fontWeight: 600,
                        color: s.medicalSupplies === 'FULL' ? 'var(--color-success-700)' : 'var(--color-warning-800)'
                      }}>
                        {s.medicalSupplies}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateShelter(s.id, Math.max(0, s.occupancy - 10))}
                          title="Decrease beds occupied by 10"
                        >
                          <Minus size={11} /> 10
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => updateShelter(s.id, Math.min(s.capacity, s.occupancy + 10))}
                          title="Increase beds occupied by 10"
                        >
                          <Plus size={11} /> 10
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)', width: 'auto', display: 'inline-block' }}
                        value={s.status}
                        onChange={(e) => updateShelter(s.id, undefined, e.target.value)}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="NEAR_CAPACITY">NEAR CAPACITY</option>
                        <option value="FULL">FULL</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Tab 2: Relief Inventory Manager */
        <div className="table-container">
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
