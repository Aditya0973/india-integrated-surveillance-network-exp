// ISRO Space Missions & Spacecraft Orbital Telemetry Engine

export const ISRO_LAUNCH_CENTRES = [
  {
    id: "SDSC-SHAR",
    name: "Satish Dhawan Space Centre (SDSC-SHAR)",
    location: "Sriharikota Island, Andhra Pradesh",
    lat: 13.7199,
    lon: 80.2305,
    pads: [
      { name: "First Launch Pad (FLP)", vehicle: "PSLV / SSLV" },
      { name: "Second Launch Pad (SLP)", vehicle: "LVM3 / GSLV Mk II & Mk III" }
    ],
    status: "PRIMARY LAUNCH GATEWAY // ACTIVE"
  },
  {
    id: "ISRO-KULASEKHARAPATNAM",
    name: "Kulasekharapatnam SSLV Launch Port (Under Development)",
    location: "Thoothukudi, Tamil Nadu",
    lat: 8.3683,
    lon: 78.0564,
    pads: [{ name: "SSLV Dedicated Pad 1", vehicle: "Small Satellite Launch Vehicle" }],
    status: "SOUTHERN TRAJECTORY CORRIDOR"
  }
];

export const ISRO_MISSIONS = [
  {
    id: "CHANDRAYAAN-3",
    name: "Chandrayaan-3 Propulsion & Orbiter Module",
    type: "Lunar Science & Relay",
    launchDate: "14 July 2023",
    launcher: "LVM3 M4",
    status: "MISSION SUCCESS // MOON POLAR REGION",
    orbitAltKm: 384400,
    inclinationDeg: 90.0,
    trajectoryType: "Lunar Orbit & Trans-Earth Insertion",
    description: "Historic Vikram soft landing at Moon South Pole; Pragyan rover chemical analysis."
  },
  {
    id: "ADITYA-L1",
    name: "Aditya-L1 Solar Observatory",
    type: "Heliophysics & Space Weather",
    launchDate: "2 September 2023",
    launcher: "PSLV-C57",
    status: "HALO ORBIT INSERTION AT LAGRANGE POINT 1",
    orbitAltKm: 1500000,
    inclinationDeg: 18.2,
    trajectoryType: "Sun-Earth L1 Halo Orbit",
    description: "Coronagraphy and solar storm early warning monitoring."
  },
  {
    id: "GAGANYAAN-TVD1",
    name: "Gaganyaan Crew Module & Test Vehicle",
    type: "Human Spaceflight Test",
    launchDate: "21 October 2023",
    launcher: "Test Vehicle (TV-D1)",
    status: "FLIGHT TEST SUCCESS // CREW ESCAPE SYSTEM VALIDATED",
    orbitAltKm: 17,
    inclinationDeg: 12.0,
    trajectoryType: "Suborbital Splashdown in Bay of Bengal",
    description: "Demonstration of in-flight crew escape system and sea recovery off Chennai coast."
  },
  {
    id: "CARTOSAT-3",
    name: "Cartosat-3 High Resolution Imaging",
    type: "Earth Observation & Surveillance",
    launchDate: "27 November 2019",
    launcher: "PSLV-C47",
    status: "ACTIVE IN SUN-SYNCHRONOUS ORBIT",
    orbitAltKm: 505,
    inclinationDeg: 97.5,
    trajectoryType: "Low Earth Orbit (LEO) Sun-Synchronous",
    description: "0.25m ground resolution imaging satellite for cartography and defense surveillance."
  },
  {
    id: "RISAT-2BR1",
    name: "RISAT-2BR1 (Radar Imaging Satellite)",
    type: "Synthetic Aperture Radar (SAR)",
    launchDate: "11 December 2019",
    launcher: "PSLV-C48",
    status: "ACTIVE ALL-WEATHER DAY/NIGHT RADAR",
    orbitAltKm: 576,
    inclinationDeg: 37.0,
    trajectoryType: "LEO X-Band Radar",
    description: "All-weather radar imaging for maritime surveillance and border monitoring."
  },
  {
    id: "GSAT-7A",
    name: "GSAT-7A (IAF Military Comsat / Angry Bird)",
    type: "Strategic Military Communications",
    launchDate: "19 December 2018",
    launcher: "GSLV-F11",
    status: "ACTIVE GEOSTATIONARY DEFENSE RELAY",
    orbitAltKm: 35786,
    inclinationDeg: 0.1,
    trajectoryType: "Geostationary Earth Orbit (GEO)",
    description: "Interlinks IAF airbases, AWACS, fighter aircraft, and ground radar nodes."
  },
  {
    id: "EOS-08",
    name: "EOS-08 (Earth Observation Satellite)",
    type: "Microsatellite & Thermal IR",
    launchDate: "16 August 2024",
    launcher: "SSLV-D3",
    status: "ACTIVE CIRCULAR ORBIT",
    orbitAltKm: 475,
    inclinationDeg: 37.2,
    trajectoryType: "Low Earth Orbit",
    description: "Thermal infrared surveillance and environmental monitoring."
  },
  {
    id: "OCEANSAT-3",
    name: "Oceansat-3 / EOS-06 (Ocean Color & Scatterometer)",
    type: "Maritime Oceanography & Wind Vector",
    launchDate: "26 November 2022",
    launcher: "PSLV-C54",
    status: "ACTIVE POLAR SUN-SYNCHRONOUS",
    orbitAltKm: 742,
    inclinationDeg: 98.3,
    trajectoryType: "Sun-Synchronous Polar LEO",
    description: "Monitors Indian EEZ sea-surface temperatures, chlorophyll, and cyclone surface winds."
  }
];

// Computes dynamic satellite positions and complete 3D orbital rings
export function getAugmentedIsroMissions() {
  const now = Date.now() / 1000;

  return ISRO_MISSIONS.map((m, idx) => {
    // Generate closed orbital ellipse ground-track points
    const orbitPoints = [];
    const steps = 64;
    const periodSec = m.orbitAltKm > 30000 ? 86164 : Math.round(5400 * Math.sqrt(Math.pow((6371 + m.orbitAltKm) / 6771, 3)));
    const meanAnomaly = ((now % periodSec) / periodSec) * 2 * Math.PI;
    const phaseOffset = (idx * (2 * Math.PI / ISRO_MISSIONS.length));

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const lat = Math.sin(theta) * (m.inclinationDeg > 90 ? 180 - m.inclinationDeg : m.inclinationDeg);
      const lon = ((theta * 180 / Math.PI * 1.5 + idx * 45) % 360) - 180;
      orbitPoints.push([parseFloat(lat.toFixed(3)), parseFloat(lon.toFixed(3))]);
    }

    // Current real-time satellite coordinates
    const curTheta = meanAnomaly + phaseOffset;
    const curLat = Math.sin(curTheta) * (m.inclinationDeg > 90 ? 180 - m.inclinationDeg : m.inclinationDeg);
    const curLon = ((curTheta * 180 / Math.PI * 1.5 + idx * 45) % 360) - 180;

    return {
      ...m,
      orbitPeriodMin: Math.round(periodSec / 60),
      velocityKms: parseFloat((Math.sqrt(398600 / (6371 + m.orbitAltKm))).toFixed(2)),
      orbitPath: orbitPoints,
      currentPos: {
        lat: parseFloat(curLat.toFixed(4)),
        lon: parseFloat(curLon.toFixed(4)),
        altMeters: m.orbitAltKm * 1000
      }
    };
  });
}

