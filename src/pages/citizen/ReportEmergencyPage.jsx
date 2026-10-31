import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LocationPickerMap } from '../../components/map/LocationPickerMap';
import { 
  AlertTriangle, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  X, 
  Flame, 
  Droplets, 
  HeartPulse, 
  Zap, 
  Building2, 
  Construction, 
  LocateFixed, 
  ChevronDown, 
  ChevronUp, 
  Users,
  Camera,
  Send
} from 'lucide-react';

const CATEGORY_CARDS = [
  { id: 'FIRE', label: 'Fire / Smoke', icon: Flame, color: '#DC2626', bg: '#FEE2E2', border: '#F87171' },
  { id: 'FLOOD', label: 'Flood / Surge', icon: Droplets, color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  { id: 'MEDICAL', label: 'Medical Trauma', icon: HeartPulse, color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' },
  { id: 'COLLAPSE', label: 'Collapse / Landslide', icon: Building2, color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  { id: 'ROAD_BLOCK', label: 'Road Blocked', icon: Construction, color: '#475569', bg: '#E2E8F0', border: '#CBD5E1' },
  { id: 'POWER', label: 'Hazard / Power', icon: Zap, color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' }
];

const PEOPLE_OPTIONS = [
  { label: '1–5 People', value: 3, desc: 'Individual / Small Group' },
  { label: '5–20 People', value: 12, desc: 'Multiple Families' },
  { label: '50+ People', value: 65, desc: 'Mass Casualty Scale' }
];

export const ReportEmergencyPage = () => {
  const { reportIncident, isSubmitting } = useEmergencyData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: WHAT
  const [selectedCategory, setSelectedCategory] = useState('FIRE');
  const [severity, setSeverity] = useState('CRITICAL'); // 'CRITICAL' | 'HIGH'

  // Step 2: WHERE
  const [position, setPosition] = useState([28.6139, 77.2090]);
  const [address, setAddress] = useState('Connaught Place / Central Delhi, New Delhi 110001');
  const [isLocating, setIsLocating] = useState(false);

  // Step 3: HOW MANY
  const [peopleCount, setPeopleCount] = useState(12);

  // Optional Collapsible Details
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const [createdIncident, setCreatedIncident] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
          setIsLocating(false);
        },
        () => {
          // Fallback location
          setPosition([28.6139, 77.2090]);
          setAddress('National Capital Region, New Delhi, India');
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryItem = CATEGORY_CARDS.find(c => c.id === selectedCategory) || CATEGORY_CARDS[0];
    const generatedTitle = customTitle.trim() || `${categoryItem.label} Reported at ${address.split(',')[0]}`;
    const generatedDescription = customDescription.trim() || 
      `Immediate citizen report for ${categoryItem.label}. Estimated ${peopleCount} people in proximity or need of assistance. Lat/Lng: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}.`;

    const payload = {
      title: generatedTitle,
      category: selectedCategory === 'COLLAPSE' ? 'INFRASTRUCTURE' : (selectedCategory === 'ROAD_BLOCK' ? 'INFRASTRUCTURE' : selectedCategory),
      severity,
      address,
      latitude: position[0],
      longitude: position[1],
      peopleAffected: peopleCount,
      description: generatedDescription,
      imageUrl: previewImage,
      reportedBy: currentUser?.name || 'Citizen User'
    };

    const result = await reportIncident(payload);
    setCreatedIncident(result);
    setShowSuccessDialog(true);
  };

  return (
    <div className="container-narrow page-container" style={{ maxWidth: '640px', paddingTop: '1.25rem', paddingBottom: '3rem' }}>
      
      {/* High-Contrast Civic Advisory Alert */}
      <div 
        style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-lg)',
          padding: '0.65rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: '#991B1B', fontWeight: 600 }}>
          <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
          <span>Life-Threatening Distress? Call Central Helpline:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <a href="tel:112" className="btn btn-xs" style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
            112
          </a>
          <a href="tel:1078" className="btn btn-xs" style={{ backgroundColor: '#D97706', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
            1078
          </a>
        </div>
      </div>

      {/* Main 3-Step Rapid SOS Form */}
      <form 
        onSubmit={handleSubmit} 
        className="card" 
        style={{ 
          padding: '1.75rem', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-neutral-900)', letterSpacing: '-0.02em' }}>
            Emergency Dispatch Report
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: '0.2rem' }}>
            Immediate priority transmission to Unified Emergency Operations Center &amp; tactical units
          </p>
        </div>

        {/* =========================================================================
            STEP 1: WHAT (2x3 Visual Category Grid + Priority Switch)
            ========================================================================= */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-900)', letterSpacing: '0.04em' }}>
              Step 1: What is the Emergency?
            </span>

            {/* Critical vs High Toggle */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--color-neutral-100)', padding: '3px', borderRadius: 'var(--radius-pill)' }}>
              <button
                type="button"
                onClick={() => setSeverity('CRITICAL')}
                style={{
                  padding: '0.25rem 0.65rem',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: severity === 'CRITICAL' ? '#DC2626' : 'transparent',
                  color: severity === 'CRITICAL' ? '#FFFFFF' : 'var(--color-neutral-600)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                CRITICAL
              </button>
              <button
                type="button"
                onClick={() => setSeverity('HIGH')}
                style={{
                  padding: '0.25rem 0.65rem',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: severity === 'HIGH' ? '#D97706' : 'transparent',
                  color: severity === 'HIGH' ? '#FFFFFF' : 'var(--color-neutral-600)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                HIGH
              </button>
            </div>
          </div>

          {/* 2x3 Visual Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            {CATEGORY_CARDS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.85rem 0.5rem',
                    border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? cat.bg : '#FFFFFF',
                    color: isSelected ? cat.color : 'var(--color-neutral-800)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={24} strokeWidth={2.2} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            STEP 2: WHERE (Location Picker Map & GPS Locator)
            ========================================================================= */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-900)', letterSpacing: '0.04em' }}>
              Step 2: Where is the Incident?
            </span>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="btn btn-xs"
              style={{
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <LocateFixed size={13} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
            </button>
          </div>

          {/* Mini Interactive Map */}
          <div style={{ marginBottom: '0.65rem' }}>
            <LocationPickerMap
              position={position}
              onChange={(newPos) => setPosition(newPos)}
              onAddressResolve={(resolved) => setAddress(resolved)}
              height="150px"
            />
          </div>

          {/* Address input */}
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary-600)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Landmark or street address"
              required
            />
          </div>
        </div>

        {/* =========================================================================
            STEP 3: HOW MANY (People in Danger)
            ========================================================================= */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-900)', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            Step 3: How Many People in Immediate Danger?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            {PEOPLE_OPTIONS.map((opt) => {
              const isSelected = peopleCount === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeopleCount(opt.value)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-pill)',
                    border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-900)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--color-neutral-800)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                >
                  <span>{opt.label}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isSelected ? '#93C5FD' : 'var(--color-neutral-500)' }}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            COLLAPSIBLE: Add Details or Photo (Optional)
            ========================================================================= */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: 'var(--color-neutral-600)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Camera size={14} />
              <span>Add Scene Details or Photo (Optional)</span>
            </span>
            {showOptionalDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showOptionalDetails && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}
                placeholder="Custom headline (e.g. Submerged Basement at 5th St)"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />

              <textarea
                className="form-textarea"
                rows="2"
                style={{ borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}
                placeholder="Specific hazards, trapped victims, water height, electrical sparking..."
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label 
                  className="btn btn-outline btn-xs" 
                  style={{ borderRadius: 'var(--radius-pill)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Upload size={13} />
                  <span>Attach Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>

                {previewImage && (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={previewImage}
                      alt="Thumbnail"
                      style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--color-border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            PROMINENT RED PILL CTA BUTTON
            ========================================================================= */}
        <button
          type="submit"
          className="btn btn-emergency btn-block btn-lg"
          disabled={isSubmitting}
          style={{
            borderRadius: 'var(--radius-pill)',
            padding: '1rem',
            fontSize: 'var(--text-base)',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 18px rgba(220, 38, 38, 0.45)',
            letterSpacing: '0.02em'
          }}
        >
          {isSubmitting ? (
            <span>Broadcasting Emergency Alert...</span>
          ) : (
            <>
              <AlertTriangle size={20} strokeWidth={2.4} />
              <span>Broadcast Emergency Alert</span>
            </>
          )}
        </button>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSuccessDialog}
        title="Incident Transmitted to Unified EOC"
        confirmText="Track in My Reports"
        cancelText="View on Live Map"
        confirmVariant="primary"
        onConfirm={() => navigate('/my-reports')}
        onCancel={() => navigate('/map')}
      >
        {createdIncident && (
          <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-100)',
              color: 'var(--color-success-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-neutral-500)', fontWeight: 700, letterSpacing: '0.04em' }}>
              Generated Official Tracking ID
            </div>

            <div style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary-900)',
              margin: '0.4rem 0 1rem',
              backgroundColor: 'var(--color-neutral-100)',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              letterSpacing: '0.04em'
            }}>
              {createdIncident.id}
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-700)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
              Your report <strong>&ldquo;{createdIncident.title}&rdquo;</strong> has been assigned to the <code>PENDING_REVIEW</code> triage queue.
            </p>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
              Coordinates <code>{createdIncident.latitude.toFixed(4)}, {createdIncident.longitude.toFixed(4)}</code> are instantly plotted on the Live Threat Map.
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};
