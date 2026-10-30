-- =============================================================================
-- ResQ — Disaster Response Hub Database Schema & Initial Seed Data
-- Target Database: Supabase PostgreSQL (Project: vgwpwhgltnrjzfclmzlw)
-- =============================================================================

-- 1. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'VERIFIED', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'RESOLVED', 'REJECTED')),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    people_affected INTEGER DEFAULT 1,
    description TEXT,
    image_url TEXT,
    reported_by TEXT DEFAULT 'Citizen Report',
    assigned_unit TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    field_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHELTERS TABLE
CREATE TABLE IF NOT EXISTS public.shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'SHELTER' CHECK (type IN ('SHELTER', 'HOSPITAL')),
    address TEXT NOT NULL,
    district TEXT,
    capacity INTEGER NOT NULL DEFAULT 100,
    occupancy INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'STANDBY')),
    phone TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    supplies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    issued_by TEXT DEFAULT 'EOC Unified Command',
    affected_areas TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOCKED ROADS TABLE
CREATE TABLE IF NOT EXISTS public.blocked_roads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    reason TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'BLOCKED',
    bypass_advice TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESPONSE RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.response_resources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'DEPLOYED', 'MAINTENANCE')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    personnel INTEGER DEFAULT 2,
    equipment TEXT,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Configured for high-trust evaluation and client-side anonymous access
-- =============================================================================

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Incidents" ON public.incidents;
CREATE POLICY "Public Read Incidents" ON public.incidents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Incidents" ON public.incidents;
CREATE POLICY "Public Insert Incidents" ON public.incidents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Incidents" ON public.incidents;
CREATE POLICY "Public Update Incidents" ON public.incidents FOR UPDATE USING (true);

ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Shelters" ON public.shelters;
CREATE POLICY "Public Read Shelters" ON public.shelters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Update Shelters" ON public.shelters;
CREATE POLICY "Public Update Shelters" ON public.shelters FOR UPDATE USING (true);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Alerts" ON public.alerts;
CREATE POLICY "Public Read Alerts" ON public.alerts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Alerts" ON public.alerts;
CREATE POLICY "Public Insert Alerts" ON public.alerts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Alerts" ON public.alerts;
CREATE POLICY "Public Update Alerts" ON public.alerts FOR UPDATE USING (true);

ALTER TABLE public.blocked_roads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Blocked Roads" ON public.blocked_roads;
CREATE POLICY "Public Read Blocked Roads" ON public.blocked_roads FOR SELECT USING (true);

ALTER TABLE public.response_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Response Resources" ON public.response_resources;
CREATE POLICY "Public Read Response Resources" ON public.response_resources FOR SELECT USING (true);

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

INSERT INTO public.incidents (id, title, category, severity, status, address, latitude, longitude, people_affected, description, is_verified, assigned_unit)
VALUES
    ('INC-8091', 'Elliott Bay Seawall Overflow & Commercial Basement Inundation', 'FLOOD', 'CRITICAL', 'ON_SCENE', 'Alaskan Way & Spring St, Seattle, WA', 47.6054, -122.3392, 45, 'Storm surge breached the lower pedestrian concourse. 1.2m of salt water in subterranean parking structure. Submerged backup generator sparking.', true, 'Marine Rescue Unit 1 (Seattle FD)'),
    ('INC-8092', 'Industrial Transformer Substation Explosion & HazMat Fire', 'FIRE', 'CRITICAL', 'EN_ROUTE', '4th Ave S & S Spokane St, Seattle, WA', 47.5714, -122.3291, 15, 'Secondary transformer exploded following high winds. Structural steel fire adjacent to fuel storage depot. Heavy chemical smoke blowing northeast.', true, 'Engine 10 & HazMat Response Team'),
    ('INC-8093', 'West Seattle Bridge Approach Structural Retaining Wall Fracture', 'INFRASTRUCTURE', 'HIGH', 'DISPATCHED', 'Spokane St Corridor & 11th Ave SW, Seattle, WA', 47.5710, -122.3485, 20, 'Transverse fissuring observed along reinforced concrete abutment. Roadway closed to commercial traffic. Geotechnical survey requested.', true, 'DOT Structural Recon Unit 3'),
    ('INC-8094', 'Pioneer Square Multi-Tenant Residential Structural Partial Collapse', 'INFRASTRUCTURE', 'CRITICAL', 'ON_SCENE', '1st Ave S & S Main St, Seattle, WA', 47.6002, -122.3344, 30, 'Historic brick unreinforced masonry facade collapsed onto sidewalk. 3 individuals trapped beneath awning debris. Gas line valve isolated.', true, 'Heavy Rescue Unit 1 & Medic 4'),
    ('INC-8095', 'Downtown High-Rise Residential Electrical Grid Failure', 'POWER', 'HIGH', 'VERIFIED', '7th Ave & Stewart St, Seattle, WA', 47.6148, -122.3340, 60, 'Complete power outage affecting 420 residential units. Elderly residents trapped in upper elevators. Oxygen concentrator power depleted.', true, 'Seattle City Light & Medic 1'),
    ('INC-8096', 'King Street Station Commuter Concourse Water Main Rupture', 'FLOOD', 'HIGH', 'VERIFIED', '303 S Jackson St, Seattle, WA', 47.5986, -122.3298, 25, '36-inch municipal water transmission main fractured under lower baggage concourse. Subterranean train track signals submerged.', true, 'Public Utilities Emergency Crew 4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.shelters (id, name, type, address, district, capacity, occupancy, status, phone, latitude, longitude)
VALUES
    ('SHL-101', 'Seattle Center Armory Emergency Evacuation Hub', 'SHELTER', '305 Harrison St, Seattle, WA', 'Uptown / Lower Queen Anne', 500, 310, 'OPEN', '(206) 684-7200', 47.6214, -122.3510),
    ('SHL-102', 'Pioneer Square Community Relief Shelter', 'SHELTER', '200 S King St, Seattle, WA', 'Pioneer Square', 180, 162, 'OPEN', '(206) 555-0144', 47.5983, -122.3325),
    ('SHL-103', 'Harborview Regional Disaster Trauma Center', 'HOSPITAL', '325 9th Ave, Seattle, WA', 'First Hill', 250, 218, 'OPEN', '(206) 744-3000', 47.6042, -122.3245),
    ('SHL-104', 'Rainier Community Center Emergency Haven', 'SHELTER', '4600 38th Ave S, Seattle, WA', 'Rainier Valley', 300, 85, 'OPEN', '(206) 386-1919', 47.5614, -122.2855)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, title, severity, category, message, issued_by, affected_areas, is_active)
VALUES
    ('ALT-9001', 'Immediate Coastal Inundation & Seawall Flash Flood Warning', 'CRITICAL', 'FLOOD', 'A catastrophic 1.4-meter king tide combined with southwesterly gale winds has overwhelmed the Elliott Bay seawall barrier between Pier 54 and Pier 66. Mandatory evacuation ordered for subterranean and ground-level commercial properties along Alaskan Way.', 'Seattle Emergency Operations Center (EOC)', 'Downtown Waterfront, Belltown Waterfront & Alaskan Way Corridor', true),
    ('ALT-9002', 'Chemical Hazard & Structural Fire Plume Advisory', 'HIGH', 'HAZMAT', 'Industrial fire in SODO district produces volatile sulfurous smoke. Residents east of 4th Ave S must shelter in place, seal exterior windows and shut off mechanical HVAC fresh-air intakes.', 'Seattle Fire Department & Public Health Metro', 'SODO Industrial Zone, Beacon Hill West Flank & Georgetown', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.blocked_roads (id, name, reason, latitude, longitude, status, bypass_advice)
VALUES
    ('BLK-01', 'Alaskan Way Viaduct / Waterfront Esplanade', 'Severe Seawall Overwash & 1.2m Standing Saline Water', 47.6054, -122.3392, 'BLOCKED', 'Divert northbound traffic via 4th Ave arterial corridor.'),
    ('BLK-02', 'Spokane St Corridor (Lower Approach)', 'Structural Wall Fissure & Debris on Roadbed', 47.5710, -122.3485, 'BLOCKED', 'Use 1st Ave South Bridge for heavy apparatus access.'),
    ('BLK-03', 'S Jackson St & 2nd Ave S', 'Water Main Fracture & Asphalt Undermining', 47.5990, -122.3315, 'BLOCKED', 'Bypass via Yesler Way.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.response_resources (id, name, type, status, latitude, longitude, personnel, equipment, contact)
VALUES
    ('RES-01', 'Marine Rescue Unit 1 (Seattle FD)', 'Watercraft / Dive Triage', 'DEPLOYED', 47.6045, -122.3385, 6, '2x Rapid Amphibious Rafts, Diving Gear', 'Callsign: Marine-1 (VHF 16)'),
    ('RES-02', 'Engine 10 & HazMat Unit', 'Fire Suppression / Chemical Triage', 'DEPLOYED', 47.5720, -122.3280, 8, 'Foam Tender, Chemical Scrubbers', 'Callsign: HazMat-10 (Tac 3)'),
    ('RES-03', 'DOT Heavy Extraction Convoy', 'Debris Clearance / Structural Shoring', 'AVAILABLE', 47.6110, -122.3280, 4, 'CAT Hydraulic Excavator, Shoring Beams', 'Callsign: Recon-3 (Ch 8)'),
    ('RES-04', 'Field Medic Rapid Response 4', 'Mass Casualty Triage', 'DEPLOYED', 47.6010, -122.3330, 4, 'Trauma Stretchers, Field AEDs, O2 Kits', 'Callsign: Medic-4 (Priority 1)')
ON CONFLICT (id) DO NOTHING;

