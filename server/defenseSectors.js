// Strategic Air Defense Sectors & Indian Armed Forces Airbases

export const AIR_DEFENSE_SECTORS = [
  {
    id: "WAC",
    name: "Western Air Command (WAC)",
    hq: "Subroto Park, New Delhi",
    role: "Air Defense of Northern Plains, J&K, Ladakh, Punjab, Haryana & NCR",
    color: "#6864F6", // Crafted Violet
    boundary: [
      [37.2, 74.0], [35.5, 78.5], [32.5, 79.5], [29.5, 79.0], 
      [27.8, 77.5], [28.2, 75.0], [30.5, 73.8], [32.5, 74.5], [37.2, 74.0]
    ]
  },
  {
    id: "SWAC",
    name: "South Western Air Command (SWAC)",
    hq: "Gandhinagar, Gujarat",
    role: "Air Defense of Rajasthan, Gujarat, Saurashtra & Kutch Maritime Sector",
    color: "#D45B3E", // Crafted Rust Light
    boundary: [
      [30.5, 73.8], [28.2, 75.0], [24.5, 76.0], [21.0, 74.5], 
      [20.5, 72.5], [22.5, 68.5], [24.5, 68.8], [27.5, 70.0], [30.5, 73.8]
    ]
  },
  {
    id: "EAC",
    name: "Eastern Air Command (EAC)",
    hq: "Shillong, Meghalaya",
    role: "Air Defense of North-East, West Bengal, Sikkim & LAC Eastern Sector",
    color: "#6E6AF6",
    boundary: [
      [28.0, 88.0], [29.0, 94.0], [28.5, 97.0], [27.0, 96.5], 
      [23.5, 93.0], [21.5, 89.0], [22.5, 87.5], [26.0, 88.0], [28.0, 88.0]
    ]
  },
  {
    id: "SAC",
    name: "Southern Air Command (SAC)",
    hq: "Thiruvananthapuram, Kerala",
    role: "Air Defense of Peninsular India, Arabian Sea, Bay of Bengal & IOR",
    color: "#A9452D", // Crafted Rust
    boundary: [
      [16.0, 73.5], [16.5, 80.5], [13.0, 80.5], [9.0, 79.5], 
      [8.0, 77.5], [10.0, 75.5], [15.0, 73.5], [16.0, 73.5]
    ]
  },
  {
    id: "CAC",
    name: "Central Air Command (CAC)",
    hq: "Prayagraj (Allahabad), UP",
    role: "Air Defense of Central India, Gangetic Plains & Strategic Strike Reserve",
    color: "#4641A9", // Crafted Deep Violet
    boundary: [
      [29.5, 79.0], [27.5, 84.5], [25.0, 87.0], [22.0, 85.0], 
      [21.0, 78.0], [24.5, 76.0], [27.8, 77.5], [29.5, 79.0]
    ]
  }
];

export const STRATEGIC_AIRBASES = [
  {
    id: "AFS-AMBALA",
    name: "Ambala Air Force Station",
    command: "Western Air Command",
    stationedSquadrons: "No. 17 Golden Arrows (Dassault Rafale) & No. 5 Black Archers (SEPECAT Jaguar)",
    lat: 30.3697,
    lon: 76.8172,
    elevationM: 272,
    readiness: "COMBAT READY / HIGH DEFCON"
  },
  {
    id: "AFS-HINDON",
    name: "Hindon Air Force Station",
    command: "Western Air Command",
    stationedSquadrons: "No. 81 Skylords (C-17 Globemaster III) & No. 77 Veels (C-130J Super Hercules)",
    lat: 28.7067,
    lon: 77.3592,
    elevationM: 213,
    readiness: "STRATEGIC AIRLIFT ACTIVE"
  },
  {
    id: "AFS-HASIMARA",
    name: "Hasimara Air Force Station",
    command: "Eastern Air Command",
    stationedSquadrons: "No. 101 Falcons (Dassault Rafale - Eastern Vector)",
    lat: 26.7039,
    lon: 89.3694,
    elevationM: 104,
    readiness: "FORWARD COMBAT READY"
  },
  {
    id: "AFS-PUNE",
    name: "Lohegaon Air Force Station",
    command: "South Western Air Command",
    stationedSquadrons: "No. 20 Lightning & No. 30 Rhinos (Sukhoi Su-30MKI)",
    lat: 18.5822,
    lon: 73.9197,
    elevationM: 592,
    readiness: "COMBAT PATROL READY"
  },
  {
    id: "AFS-BAREILLY",
    name: "Trishul Air Force Base",
    command: "Central Air Command",
    stationedSquadrons: "No. 24 Hunting Hawks (Sukhoi Su-30MKI) & Netra AEW&C",
    lat: 28.4233,
    lon: 79.4500,
    elevationM: 172,
    readiness: "RADAR EARLY WARNING ACTIVE"
  },
  {
    id: "AFS-SULUR",
    name: "Sulur Air Force Station",
    command: "Southern Air Command",
    stationedSquadrons: "No. 45 Flying Daggers & No. 18 Flying Bullets (HAL Tejas LCA)",
    lat: 11.0142,
    lon: 77.1611,
    elevationM: 381,
    readiness: "PENINSULAR AIR DEFENSE"
  },
  {
    id: "AFS-LEH",
    name: "Kushok Bakula Rimpochee AFS",
    command: "Western Air Command",
    stationedSquadrons: "High Altitude Combat Air Patrol (MiG-29UPG / Su-30MKI / Apache AH-64E)",
    lat: 34.1359,
    lon: 77.5465,
    elevationM: 3256,
    readiness: "HIGH ALTITUDE STRATEGIC VECTOR"
  },
  {
    id: "AFS-JAMNAGAR",
    name: "Jamnagar Air Force Station",
    command: "South Western Air Command",
    stationedSquadrons: "No. 6 Dragons (Jaguar IM Maritime Strike) & Air Defense Radars",
    lat: 22.4660,
    lon: 70.0125,
    elevationM: 21,
    readiness: "MARITIME STRIKE READY"
  }
];
