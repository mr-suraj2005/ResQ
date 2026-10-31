import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Activity, 
  Building2, 
  Radio, 
  Compass,
  ExternalLink
} from 'lucide-react';

const CATEGORY_ICONS = {
  FLOOD: Droplets,
  FIRE: Flame,
  MEDICAL: HeartPulse,
  POWER: Activity,
  HAZMAT: AlertTriangle,
  INFRASTRUCTURE: Building2
};

const SEVERITY_COLORS = {
  CRITICAL: {
    bg: '#FEE2E2',
    border: '#F87171',
    text: '#B91C1C',
    dot: '#DC2626',
    label: 'Critical'
  },
  HIGH: {
    bg: '#FFEDD5',
    border: '#FB923C',
    text: '#C2410C',
    dot: '#EA580C',
    label: 'High'
  },
  MEDIUM: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    text: '#B45309',
    dot: '#CA8A04',
    label: 'Medium'
  },
  WARNING: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    text: '#B45309',
    dot: '#CA8A04',
    label: 'Medium'
  },
  LOW: {
    bg: '#DCFCE7',
    border: '#86EFAC',
    text: '#15803D',
    dot: '#16A34A',
    label: 'Low'
  },
  INFO: {
    bg: '#E0F2FE',
    border: '#7DD3FC',
    text: '#0369A1',
    dot: '#0284C7',
    label: 'Low'
  }
};

export const EmergencySlider = ({ incidents = [] }) => {
  const navigate = useNavigate();
  // Filter for valid active/triaged incidents
  const validIncidents = incidents.filter(i => i.status !== 'REJECTED');
  const items = validIncidents.length > 0 ? validIncidents : incidents;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = items.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Auto-play interval: every 4.5 seconds when not paused
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  // Handle touch events
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped left -> next
      nextSlide();
    } else if (diff < -45) {
      // Swiped right -> prev
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // If no incidents exist, render professional empty state
  if (total === 0) {
    return (
      <div 
        className="card emergency-slider-container"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '340px'
        }}
      >
        <div 
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}
        >
          <ShieldCheck size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
          No Active Emergencies Reported
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', maxWidth: '380px', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          All regional monitoring sensors and emergency response battalions are active and standing by across India.
        </p>
        <Link 
          to="/report" 
          className="btn btn-outline btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', padding: '0.45rem 1.25rem', fontWeight: 600 }}
        >
          <span>Report an Incident</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const current = items[currentIndex] || items[0];
  const CategoryIcon = CATEGORY_ICONS[current.category] || AlertTriangle;
  const sevConfig = SEVERITY_COLORS[current.severity?.toUpperCase()] || SEVERITY_COLORS.MEDIUM;
  const people = Number(current.peopleAffected) || 12;

  const formattedTime = current.createdAt 
    ? new Date(current.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div 
      className="emergency-slider-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '340px'
      }}
      aria-roledescription="carousel"
      aria-label="Live Emergency Incidents Slider"
    >
      {/* Top Slider Header Bar */}
      <div 
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', width: 8, height: 8 }}>
            <span 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                borderRadius: '50%', 
                backgroundColor: '#DC2626', 
                animation: 'pulse 1.5s infinite',
                opacity: 0.75 
              }} 
            />
            <span 
              style={{ 
                position: 'relative', 
                display: 'block', 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#DC2626' 
              }} 
            />
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-neutral-800)' }}>
            Live Emergency Stream
          </span>
          <span 
            style={{ 
              fontSize: '0.68rem', 
              fontWeight: 700, 
              backgroundColor: '#EFF6FF', 
              color: '#1D4ED8', 
              padding: '0.15rem 0.5rem', 
              borderRadius: 'var(--radius-pill)' 
            }}
          >
            {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Manual Previous / Next Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Emergency Slide"
            className="btn-ghost"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Emergency Slide"
            className="btn-ghost"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Slide Content */}
      <div 
        key={current.id || currentIndex}
        style={{
          padding: '1.25rem 1.25rem 1rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.25s ease'
        }}
      >
        <div>
          {/* Category & Severity Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: 34, 
                  height: 34, 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: '#EFF6FF', 
                  color: 'var(--color-primary-600)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                <CategoryIcon size={18} strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-neutral-700)', letterSpacing: '0.03em' }}>
                  {current.category || 'INCIDENT'}
                </span>
                <span className="mono-id" style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-neutral-400)' }}>
                  {current.id}
                </span>
              </div>
            </div>

            {/* Severity Badge with strictly specified colors */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: sevConfig.bg,
                color: sevConfig.text,
                border: `1px solid ${sevConfig.border}`,
                borderRadius: 'var(--radius-pill)',
                padding: '0.25rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <span 
                style={{ 
                  width: 7, 
                  height: 7, 
                  borderRadius: '50%', 
                  backgroundColor: sevConfig.dot 
                }} 
              />
              <span>{sevConfig.label} Severity</span>
            </span>
          </div>

          {/* Incident Title */}
          <h3 
            style={{ 
              fontSize: '1.15rem', 
              fontWeight: 800, 
              color: 'var(--color-neutral-900)', 
              lineHeight: 1.35, 
              marginBottom: '0.5rem' 
            }}
          >
            {current.title}
          </h3>

          {/* Location Address */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: 'var(--text-xs)', 
              color: 'var(--color-neutral-600)', 
              marginBottom: '0.65rem' 
            }}
          >
            <MapPin size={14} color="#2563EB" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {current.address || 'Location Coordinates Mapped'}
            </span>
          </div>

          {/* Description */}
          {current.description && (
            <p 
              style={{ 
                fontSize: '0.8rem', 
                color: 'var(--color-neutral-600)', 
                lineHeight: 1.5, 
                marginBottom: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {current.description}
            </p>
          )}
        </div>

        {/* Telemetry Footer inside card */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderTop: '1px solid var(--color-border)', 
            paddingTop: '0.75rem', 
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span 
              style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                backgroundColor: people > 25 ? '#FEE2E2' : '#F1F5F9', 
                color: people > 25 ? '#DC2626' : '#475569', 
                padding: '0.2rem 0.55rem', 
                borderRadius: 'var(--radius-pill)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Users size={12} />
              <span>~{people} Affected</span>
            </span>

            <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              <span>{formattedTime}</span>
            </span>
          </div>

          {/* View Details Action Button */}
          <Link
            to={current.latitude != null ? `/map?lat=${current.latitude}&lng=${current.longitude}&zoom=14` : '/map'}
            className="btn btn-sm"
            style={{
              backgroundColor: 'var(--color-primary-900)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-pill)',
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              textDecoration: 'none'
            }}
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Slide Indicators (Dots) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem 0.75rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #F1F5F9'
        }}
      >
        {items.map((item, idx) => (
          <button
            key={item.id || idx}
            type="button"
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === currentIndex ? 20 : 7,
              height: 7,
              borderRadius: 'var(--radius-pill)',
              backgroundColor: idx === currentIndex ? 'var(--color-primary-600)' : '#CBD5E1',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};
