import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEmergencyData } from '../../context/EmergencyDataContext';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LocationPickerMap } from '../../components/map/LocationPickerMap';
import { 
  AlertTriangle, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  X, 
  ShieldAlert,
  Flame,
  Droplets,
  HeartPulse,
  Zap,
  Building2,
  FileText,
  Navigation
} from 'lucide-react';

export const ReportEmergencyPage = () => {
  const { reportIncident, isSubmitting } = useEmergencyData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Initial Seattle Downtown coordinates
  const [position, setPosition] = useState([47.6062, -122.3321]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'FLOOD',
    severity: 'HIGH',
    address: '4th Ave & Pike St, Seattle, WA',
    description: '',
    reportedBy: currentUser?.name || 'Sarah Jenkins (Citizen)'
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [createdIncident, setCreatedIncident] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image file size exceeds 5MB limit.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setErrors(prev => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Incident title is required. Please provide a concise summary.';
    } else if (formData.title.trim().length < 6) {
      errs.title = 'Incident summary must be at least 6 characters.';
    }

    if (!formData.address.trim()) {
      errs.address = 'Street address or landmark is required for dispatch geolocation.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Please describe the emergency conditions, hazards, and any people in need of aid.';
    } else if (formData.description.trim().length < 15) {
      errs.description = 'Description is too brief (minimum 15 characters required).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      latitude: position[0],
      longitude: position[1],
      imageUrl: previewImage,
      reportedBy: currentUser?.name || 'Citizen Report'
    };

    const result = await reportIncident(payload);
    setCreatedIncident(result);
    setShowSuccessDialog(true);
  };

  return (
    <div className="container-narrow page-container">
      <PageHeader
        title="Report an Emergency Incident"
        subtitle="Broadcast verified situational telemetry to the Emergency Operations Center and immediate local first responders."
        breadcrumb="CITIZEN PORTAL / REPORT INCIDENT"
      />

      {/* High-Contrast Civic Advisory Alert */}
      <div 
        style={{
          backgroundColor: 'var(--color-emergency-50)',
          border: '1px solid var(--color-emergency-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}
      >
        <AlertTriangle size={22} color="var(--color-emergency-600)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-emergency-800)', lineHeight: 1.5 }}>
          <strong>Critical Life Safety Reminder:</strong> For immediate structure fires, life-threatening medical emergencies, or disaster distress, call <strong>112 (National Emergency Number)</strong> or <strong>1078 (NDMA Helpline)</strong> immediately. This portal is synchronized with interagency CAD for community hazard mapping and priority queuing.
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }} noValidate>
        {/* Incident Summary */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Incident Headline / Summary <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            placeholder="e.g. Seawall Overwash &amp; Commercial Basement Submerged"
            value={formData.title}
            onChange={handleChange}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <div id="title-error" className="form-error">
              <AlertTriangle size={12} />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Category & Severity Grid */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Disaster Classification <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="FLOOD">Flooding &amp; Seawall Inundation</option>
              <option value="FIRE">Structural Fire / Wildfire</option>
              <option value="HAZMAT">Chemical Spill / Hazardous Materials</option>
              <option value="INFRASTRUCTURE">Roadway / Bridge Failure</option>
              <option value="POWER">Power Grid Blackout / Downed Lines</option>
              <option value="MEDICAL">Mass Casualty / Health Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="severity">
              Assessed Threat Severity <span className="required">*</span>
            </label>
            <select
              id="severity"
              name="severity"
              className="form-select"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="CRITICAL">Critical (Immediate Danger to Human Life)</option>
              <option value="HIGH">High (Major Property Damage / Evacuation)</option>
              <option value="MODERATE">Moderate (Localized Disruptions)</option>
              <option value="LOW">Low (Minor Advisory / Non-Trauma)</option>
            </select>
          </div>
        </div>

        {/* Address and Interactive Location Picker Map */}
        <div className="form-group">
          <label className="form-label" htmlFor="address">
            Street Address or Landmark <span className="required">*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="form-input"
            placeholder="e.g. Alaskan Way &amp; Pier 55, Seattle, WA"
            value={formData.address}
            onChange={handleChange}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && (
            <div id="address-error" className="form-error">
              <AlertTriangle size={12} />
              <span>{errors.address}</span>
            </div>
          )}
        </div>

        {/* Location Picker Map */}
        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Dispatch Pin Placement (Click on Map or Drag Marker)
            </label>
            <span className="mono-coord">
              {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° W
            </span>
          </div>

          <LocationPickerMap
            position={position}
            onChange={(newPos) => setPosition(newPos)}
            onAddressResolve={(resolved) => {
              if (!formData.address || formData.address.startsWith('GPS:')) {
                setFormData(prev => ({ ...prev, address: resolved }));
              }
            }}
            height="220px"
          />
          <div className="form-help">
            Clicking on the map automatically repositions the dispatch pin and syncs coordinates.
          </div>
        </div>

        {/* Narrative Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Hazard Description &amp; Field Observations <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            rows="4"
            placeholder="Describe what is occurring, whether people or animals are trapped, water depth, smoke direction, or utilities affected..."
            value={formData.description}
            onChange={handleChange}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'desc-error' : undefined}
          />
          {errors.description && (
            <div id="desc-error" className="form-error">
              <AlertTriangle size={12} />
              <span>{errors.description}</span>
            </div>
          )}
        </div>

        {/* Image File Upload with Instant Thumbnail Preview */}
        <div className="form-group">
          <label className="form-label">Attach Scene Photo (Optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} />
              <span>Choose Image File...</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>

            {previewImage && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={previewImage}
                  alt="Incident Scene Thumbnail Preview"
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'var(--color-emergency-600)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Remove attached photo"
                  aria-label="Remove attached photo"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          {errors.image && (
            <div className="form-error">
              <AlertTriangle size={12} />
              <span>{errors.image}</span>
            </div>
          )}
          <div className="form-help">
            Supported formats: PNG, JPG, or WEBP up to 5MB. Photographic evidence accelerates triage.
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.25rem',
          marginTop: '1.5rem'
        }}>
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>

          <button
            type="submit"
            className="btn btn-emergency btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Transmitting Incident Telemetry...</span>
            ) : (
              <>
                <AlertTriangle size={18} strokeWidth={2.2} />
                <span>Submit Emergency Report</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Post-Submission Confirmation Dialog */}
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
