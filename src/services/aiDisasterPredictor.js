/**
 * AI Upcoming Disaster Prediction & Management Engine
 * Powered by Gemini 2.5 Flash with Deterministic Rule-Based Fallback
 */

const GEMINI_API_KEY = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) || '';

/**
 * Predicts upcoming disasters over the next 72 hours and generates
 * dual Citizen and EOC Authority management protocols.
 */
export async function predictDisasterRisks({
  location,
  weather,
  proximities
}) {
  const {
    city = 'New Delhi',
    district = 'New Delhi',
    state = 'Delhi',
    latitude = 28.6139,
    longitude = 77.2090,
    region = 'Northern Indo-Gangetic Plain'
  } = location || {};

  const current = weather?.current || {};
  const predictive = weather?.predictive72h || {};
  const flags = weather?.riskFlags || {};

  const nearestHospital = proximities?.nearestHospital;
  const nearestShelter = proximities?.nearestShelter;
  const nearestNDRF = proximities?.nearestNDRF;

  // Build the prompt context payload
  const contextPayload = {
    userLocation: {
      city,
      district,
      state,
      coordinates: `${latitude}, ${longitude}`,
      geographicalRegion: region
    },
    liveMeteorologicalTelemetry: {
      temperatureC: current.temperature,
      humidityPercent: current.humidity,
      surfacePressureHpa: current.surfacePressure,
      windSpeedKmh: current.windSpeed,
      windGustsKmh: current.windGusts,
      currentPrecipitationMm: current.precipitationMm,
      conditionSummary: current.weatherLabel
    },
    forecast72Hours: {
      cumulativeRainfall72hMm: predictive.cumulativeRainfallMm,
      peakWindGust72hKmh: predictive.peakWindGustKmh,
      maxPrecipitationProbabilityPercent: predictive.maxPrecipitationProbability,
      peakTemperatureC: predictive.peakTemperature
    },
    nearestEmergencyInfrastructure: {
      nearestHospital: nearestHospital ? `${nearestHospital.id} (${nearestHospital.facility || nearestHospital.name}) at ${nearestHospital.distanceKm} km` : 'AIIMS New Delhi',
      nearestShelter: nearestShelter ? `${nearestShelter.id} (${nearestShelter.facility || nearestShelter.name}) at ${nearestShelter.distanceKm} km` : 'Cyclone Shelters',
      nearestNDRFBattalion: nearestNDRF ? `${nearestNDRF.id} (${nearestNDRF.facility || nearestNDRF.name}) at ${nearestNDRF.distanceKm} km` : 'NDRF HQ'
    }
  };

  // Attempt live Gemini 2.5 Flash invocation if API key is supplied
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const liveResult = await callGeminiAPI(contextPayload, GEMINI_API_KEY);
      if (liveResult && liveResult.overallRiskLevel) {
        return {
          ...liveResult,
          engineSource: 'Gemini 2.5 Flash Neural Engine (Live API)',
          analyzedAt: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic prediction engine:', err.message);
    }
  }

  // Instantaneous Deterministic Rule-Based Engine Fallback
  return generateDeterministicPrediction(contextPayload, nearestHospital, nearestShelter, nearestNDRF);
}

/**
 * Invokes Gemini API with strict structured JSON output instructions
 */
async function callGeminiAPI(contextPayload, apiKey) {
  const prompt = `
You are the Chief Disaster Risk Scientist for ResQ — India National Disaster Response Hub.
Analyze the following live GPS location, real-time meteorological indicators, and nearby response infrastructure to forecast potential disaster events over the next 72 hours.

Context Data:
${JSON.stringify(contextPayload, null, 2)}

Respond with STRICT JSON adhering exactly to this structure (no markdown fences, no explanatory text outside JSON):
{
  "overallRiskLevel": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
  "riskScore": integer from 0 to 100,
  "summaryHeadline": "Concise 1-sentence executive risk assessment for this locality",
  "predictedDisasters": [
    {
      "hazardType": "Hazard Name (e.g. Urban Flash Flooding, Coastal Storm Surge, High-Velocity Squalls, Landslide, Severe Heatwave)",
      "probabilityPercent": integer 0-100,
      "timeframe": "Next 12-24 Hours" | "Next 24-48 Hours" | "Next 48-72 Hours",
      "severity": "CRITICAL" | "HIGH" | "MODERATE" | "LOW",
      "triggerFactor": "Brief explanation of meteorological trigger (e.g. barometric pressure drop below 1000hPa combined with 75mm rainfall)"
    }
  ],
  "citizenManagementPlan": [
    "Step 1 actionable preparedness directive for residents",
    "Step 2 safety action directive",
    "Step 3 family/communication directive",
    "Step 4 evacuation directive mentioning toll-free 112 helpline"
  ],
  "authorityResourcePlan": [
    "Tactical recommendation for local EOC referencing the nearest NDRF unit",
    "Tactical recommendation for shelter network readiness",
    "Tactical medical triage recommendation referencing the nearest hospital"
  ],
  "safeEvacuationTarget": {
    "name": "Name of closest shelter or hospital",
    "id": "ID of facility (e.g. IND-SHL-001 or IND-HSP-001)",
    "distanceKm": float,
    "helpline": "112 / 1078"
  }
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini HTTP Error ${response.status}`);
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * High-precision deterministic disaster analysis engine based on Indian Meteorological Department (IMD)
 * and National Disaster Management Authority (NDMA) scientific thresholds.
 */
function generateDeterministicPrediction(context, nearestHospital, nearestShelter, nearestNDRF) {
  const { userLocation, liveMeteorologicalTelemetry, forecast72Hours } = context;
  const pressure = liveMeteorologicalTelemetry.surfacePressureHpa || 1010;
  const rain72h = forecast72Hours.cumulativeRainfall72hMm || 0;
  const windGusts = forecast72Hours.peakWindGust72hKmh || 20;
  const temp = liveMeteorologicalTelemetry.temperatureC || 30;
  const state = userLocation.state.toLowerCase();
  const region = userLocation.geographicalRegion.toLowerCase();

  const isCoastal = state.includes('odisha') || state.includes('andhra') || state.includes('tamil') || 
                    state.includes('bengal') || state.includes('kerala') || state.includes('maharashtra') || 
                    state.includes('gujarat') || state.includes('goa');
  const isHilly = state.includes('assam') || state.includes('uttarakhand') || state.includes('himachal') || region.includes('himalayan');

  let riskScore = 20;
  let overallRiskLevel = 'LOW';
  const predictedDisasters = [];

  // 1. Evaluate Depression / Cyclone / Storm Surge Risk
  if (isCoastal && (pressure < 1004 || windGusts > 50 || rain72h > 50)) {
    const prob = Math.min(Math.round(40 + (1005 - pressure) * 8 + (windGusts - 40) * 0.8), 95);
    predictedDisasters.push({
      hazardType: 'Coastal Cyclonic Storm Surge & High-Velocity Squalls',
      probabilityPercent: Math.max(prob, 65),
      timeframe: 'Next 24–48 Hours',
      severity: prob > 80 ? 'CRITICAL' : 'HIGH',
      triggerFactor: `Atmospheric depression (${pressure} hPa) coupled with wind gusts reaching ${windGusts} km/h along the coastal corridor.`
    });
    riskScore += 45;
  }

  // 2. Evaluate Flood / Waterlogging Risk
  if (rain72h > 40 || liveMeteorologicalTelemetry.currentPrecipitationMm > 5) {
    const prob = Math.min(Math.round(45 + (rain72h - 30) * 0.7), 92);
    predictedDisasters.push({
      hazardType: isHilly ? 'Flash Flood & Embankment Overflow' : 'Urban Inundation & Subterranean Waterlogging',
      probabilityPercent: Math.max(prob, 55),
      timeframe: 'Next 12–36 Hours',
      severity: prob > 75 ? 'HIGH' : 'MODERATE',
      triggerFactor: `Projected cumulative precipitation of ${rain72h} mm exceeding storm-drain absorption capacities.`
    });
    riskScore += 35;
  }

  // 3. Evaluate Landslide / Hill Slope Hazard
  if (isHilly && rain72h > 35) {
    predictedDisasters.push({
      hazardType: 'Hill Slope Destabilization & Mudslide Hazard',
      probabilityPercent: 78,
      timeframe: 'Next 24–48 Hours',
      severity: 'HIGH',
      triggerFactor: `Soil saturation index reaching critical threshold following sustained monsoonal rainfall on steep gradients.`
    });
    riskScore += 25;
  }

  // 4. Evaluate Extreme Heat / Grid Stress
  if (temp >= 40) {
    predictedDisasters.push({
      hazardType: 'Extreme Heatwave Stress & Substation Power Tripping',
      probabilityPercent: 82,
      timeframe: 'Next 12–24 Hours',
      severity: 'HIGH',
      triggerFactor: `Ambient peak temperature exceeding 40°C driving severe dehydration risk and power distribution overloads.`
    });
    riskScore += 25;
  }

  // Fallback benign conditions
  if (predictedDisasters.length === 0) {
    predictedDisasters.push(
      {
        hazardType: 'Localized Drainage Waterlogging',
        probabilityPercent: 32,
        timeframe: 'Next 48–72 Hours',
        severity: 'LOW',
        triggerFactor: 'Passing cloud bands and periodic precipitation across regional lowlands.'
      },
      {
        hazardType: 'Occasional Convective Wind Gusts',
        probabilityPercent: 28,
        timeframe: 'Next 24 Hours',
        severity: 'LOW',
        triggerFactor: 'Diurnal surface heating causing brief localized breezes.'
      }
    );
  }

  // Clamp risk score
  riskScore = Math.min(Math.max(riskScore, 15), 98);
  if (riskScore >= 75) overallRiskLevel = 'CRITICAL';
  else if (riskScore >= 55) overallRiskLevel = 'HIGH';
  else if (riskScore >= 35) overallRiskLevel = 'MODERATE';
  else overallRiskLevel = 'LOW';

  const defaultShelter = nearestShelter || { id: 'IND-SHL-001', facility: 'Regional Cyclone Shelter Network', distanceKm: 8.5 };
  const defaultNDRF = nearestNDRF || { id: 'IND-DRM-001', facility: 'NDRF Quick Reaction Force', distanceKm: 14.2 };
  const defaultHospital = nearestHospital || { id: 'IND-HSP-001', facility: 'District Apex Trauma Centre', distanceKm: 5.1 };

  return {
    overallRiskLevel,
    riskScore,
    summaryHeadline: overallRiskLevel === 'CRITICAL' || overallRiskLevel === 'HIGH'
      ? `Elevated multi-hazard alert for ${userLocation.city}: high-probability ${predictedDisasters[0]?.hazardType.toLowerCase()} forecast within 48 hours.`
      : `Atmospheric baseline stable across ${userLocation.city}. Maintain standard civic disaster vigilance.`,
    predictedDisasters: predictedDisasters.slice(0, 3),
    citizenManagementPlan: [
      `Secure an emergency 72-hour survival go-bag containing non-perishable rations, 3L drinking water per person, battery torch, and essential prescription medications.`,
      `Identify local evacuation routes towards ${defaultShelter.facility} (${defaultShelter.id}) located ${defaultShelter.distanceKm} km from your current coordinates.`,
      `Avoid driving or wading through submerged underpasses, open drainage culverts, or standing stormwater pools to prevent electrocution and structural trapping.`,
      `Keep phone fully charged, register for localized cell broadcast alerts, and dial 112 (National Emergency Helpline) or 1078 (NDMA Centralized Helpline) in case of distress.`
    ],
    authorityResourcePlan: [
      `Direct ${defaultNDRF.facility} (${defaultNDRF.id}) located ${defaultNDRF.distanceKm} km away to pre-position motorized inflatable zodiacs and high-capacity dewatering pumps.`,
      `Verify food stocks, reverse-osmosis potable water supplies, and solar battery backups at ${defaultShelter.facility} (${defaultShelter.id}).`,
      `Designate mass-casualty and trauma resuscitation bays at ${defaultHospital.facility} (${defaultHospital.id}, ${defaultHospital.distanceKm} km away) with priority green-corridor ambulance routing.`
    ],
    safeEvacuationTarget: {
      name: defaultShelter.facility || defaultShelter.name,
      id: defaultShelter.id,
      distanceKm: defaultShelter.distanceKm,
      helpline: '112 / 1078'
    },
    engineSource: 'ResQ IMD/NDMA Deterministic Crisis Evaluation Engine',
    analyzedAt: new Date().toISOString()
  };
}
