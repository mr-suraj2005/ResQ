import React, { useState, useMemo } from 'react';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  RefreshCw, 
  Navigation, 
  ShieldAlert, 
  Users, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';

export const AIAnalysisPanel = ({ compact = false, className = '' }) => {
  const { incidents, shelters, blockedRoads, responseResources } = useEmergencyData();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalTime, setEvalTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const handleReEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1200);
  };

  // Dynamic Situational Computations
  const analysis = useMemo(() => {
    const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
    const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;
    const highCount = activeIncidents.filter(i => i.severity === 'HIGH').length;
    const unverifiedCount = activeIncidents.filter(i => !i.isVerified).length;
    
    const totalPeopleAffected = activeIncidents.reduce((sum, inc) => sum + (Number(inc.peopleAffected) || 0), 0);
    const blockedCount = blockedRoads.length;

    // Computed Threat Score (15 - 98)
    let score = 25 + (criticalCount * 16) + (highCount * 9) + (blockedCount * 5) + Math.min(20, Math.floor(totalPeopleAffected / 5));
    if (score > 98) score = 98;
    if (score < 15) score = 15;

    let threatLevel = 'ELEVATED';
    let threatColor = 'var(--color-warning-600)';
    let threatBg = '#FEF3C7';
    if (score >= 75) {
      threatLevel = 'CRITICAL ALERT';
      threatColor = 'var(--color-emergency-600)';
      threatBg = '#FEE2E2';
    } else if (score < 45) {
      threatLevel = 'MODERATE VIGILANCE';
      threatColor = 'var(--color-primary-600)';
      threatBg = '#DBEAFE';
    }

    // Hotspot detection: Group incidents by location
    const locationMap = {};
    activeIncidents.forEach(inc => {
      const locKey = inc.location?.split(',')[0]?.trim() || 'Central Metro';
      if (!locationMap[locKey]) {
        locationMap[locKey] = { name: locKey, count: 0, people: 0, critical: 0 };
      }
      locationMap[locKey].count += 1;
      locationMap[locKey].people += (Number(inc.peopleAffected) || 0);
      if (inc.severity === 'CRITICAL') locationMap[locKey].critical += 1;
    });

    const hotspots = Object.values(locationMap)
      .sort((a, b) => (b.critical * 3 + b.people) - (a.critical * 3 + a.people))
      .slice(0, 2);

    // Route & Logistics warnings
    const routeAdvisories = blockedRoads.map(br => ({
      road: br.name,
      reason: br.reason,
      advice: br.bypassAdvice || 'Divert heavy emergency apparatus via arterial bypass routes.'
    })).slice(0, 2);

    // Resource Gap recommendations
    const gaps = [];
    if (totalPeopleAffected > 40 && responseResources.filter(r => r.status === 'AVAILABLE').length <= 2) {
      gaps.push({
        title: 'High Casualty Load vs. Active Units',
        desc: `Estimated ${totalPeopleAffected} citizens affected across active zones. Recommend mobilizing 2 additional Field Medical & Watercraft teams immediately.`,
        priority: 'HIGH'
      });
    }

    const overcrowdedShelter = shelters.find(s => (s.occupancy / s.capacity) >= 0.85);
    if (overcrowdedShelter) {
      gaps.push({
        title: `Shelter Threshold Exceeded: ${overcrowdedShelter.name}`,
        desc: `Capacity at ${Math.round((overcrowdedShelter.occupancy / overcrowdedShelter.capacity) * 100)}%. Divert incoming evacuees to secondary facilities.`,
        priority: 'MEDIUM'
      });
    } else {
      gaps.push({
        title: 'Tactical Corridor Clearance',
        desc: 'Maintain clear right-of-way for emergency convoys connecting Downtown to Level-1 Trauma Centers.',
        priority: 'NORMAL'
      });
    }

    return {
      score,
      threatLevel,
      threatColor,
      threatBg,
      activeIncidentsCount: activeIncidents.length,
      criticalCount,
      totalPeopleAffected,
      hotspots,
      routeAdvisories,
      gaps
    };
  }, [incidents, shelters, blockedRoads, responseResources]);

  return (
    <div 
      className={`card ${className}`} 
      style={{ 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid #C7D2FE',
        backgroundColor: '#FFFFFF',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}
    >
      {/* AI Header */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)', 
          color: '#FFFFFF', 
          padding: compact ? '0.85rem 1.15rem' : '1.15rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div 
            style={{ 
              width: 34, 
              height: 34, 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#93C5FD'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', letterSpacing: '-0.01em' }}>
                ResQ Situation AI Engine
              </span>
              <span 
                style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(59, 130, 246, 0.35)', 
                  color: '#BFDBFE',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-pill)',
                  textTransform: 'uppercase'
                }}
              >
                v2.4 Live
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={11} />
              <span>Evaluated: {evalTime}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReEvaluate}
          disabled={isEvaluating}
          className="btn btn-xs"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 'var(--radius-pill)',
            padding: '0.35rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: isEvaluating ? 'not-allowed' : 'pointer'
          }}
          title="Trigger instantaneous model re-evaluation"
        >
          <RefreshCw size={13} className={isEvaluating ? 'spin-animation' : ''} />
          <span>{isEvaluating ? 'Evaluating...' : 'Re-Evaluate'}</span>
        </button>
      </div>

      <div style={{ padding: compact ? '1rem' : '1.25rem 1.5rem' }}>
        {/* Threat Meter & Dynamic Score */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '1rem', 
            padding: '0.85rem 1rem',
            backgroundColor: analysis.threatBg,
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            border: `1px solid ${analysis.threatColor}40`
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: analysis.threatColor, letterSpacing: '0.04em' }}>
              Dynamic Threat Level
            </div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={18} color={analysis.threatColor} />
              <span>{analysis.threatLevel}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: analysis.threatColor, lineHeight: 1 }}>
              {analysis.score}<span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: '#64748B' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>
              AI Risk Index
            </div>
          </div>
        </div>

        {/* Hotspot Clusters */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={13} color="var(--color-primary-600)" />
            <span>Active Impact Hotspots</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '0.65rem' }}>
            {analysis.hotspots.map((hs, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '0.65rem 0.85rem', 
                  backgroundColor: 'var(--color-neutral-50)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-900)' }}>
                  {hs.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-600)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{hs.count} Active Incidents</span>
                  <span>&bull;</span>
                  <span style={{ color: 'var(--color-emergency-600)', fontWeight: 600 }}>~{hs.people} Impacted</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logistics & Route Advisories */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={13} color="var(--color-emergency-600)" />
            <span>Tactical Route &amp; Obstruction Advisories</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analysis.routeAdvisories.map((ra, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '0.65rem 0.85rem', 
                  backgroundColor: '#FEF2F2', 
                  border: '1px solid #FECACA', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <div style={{ fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={13} color="#DC2626" />
                  <span>{ra.road}: {ra.reason}</span>
                </div>
                <div style={{ color: '#7F1D1D', marginTop: '0.25rem', fontSize: '0.72rem', lineHeight: 1.4 }}>
                  <strong>Advisory:</strong> {ra.advice}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Allocation Gap */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-500)', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cpu size={13} color="var(--color-primary-600)" />
            <span>Algorithmic Recommendations</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {analysis.gaps.map((gap, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: '0.65rem 0.85rem', 
                  backgroundColor: '#F8FAFC', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-800)' }}>
                    {gap.title}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: gap.priority === 'HIGH' ? '#FEE2E2' : '#EFF6FF',
                      color: gap.priority === 'HIGH' ? '#B91C1C' : '#1D4ED8'
                    }}
                  >
                    {gap.priority}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-600)', lineHeight: 1.4 }}>
                  {gap.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

