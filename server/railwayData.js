// Indian Railways Network Corridors, Dedicated Freight Corridors & Major Junctions

export const RAILWAY_CORRIDORS = [
  {
    name: "Golden Quadrilateral: Delhi – Mumbai Trunk Line",
    type: "High Density Passenger & Freight",
    color: "#D45B3E",
    points: [
      [28.6429, 77.2195], // New Delhi
      [27.1767, 78.0081], // Agra Cantt
      [26.2183, 78.1828], // Gwalior
      [23.2599, 77.4126], // Bhopal
      [21.1458, 79.0882], // Nagpur
      [19.0760, 72.8777]  // Mumbai CSMT
    ]
  },
  {
    name: "Golden Quadrilateral: Delhi – Howrah / Kolkata Trunk Line",
    type: "Grand Chord Fast Line",
    color: "#6864F6",
    points: [
      [28.6429, 77.2195], // New Delhi
      [26.4499, 80.3319], // Kanpur Central
      [25.4358, 81.8463], // Prayagraj Junction
      [25.2818, 83.1118], // Pt. Deen Dayal Upadhyaya (Mughalsarai)
      [25.5941, 85.1376], // Patna Junction
      [22.5851, 88.3468]  // Howrah Junction
    ]
  },
  {
    name: "Golden Quadrilateral: Mumbai – Chennai Main Line",
    type: "Peninsular Express Corridor",
    color: "#6E6AF6",
    points: [
      [19.0760, 72.8777], // Mumbai CSMT
      [18.5204, 73.8567], // Pune Junction
      [17.6599, 75.9064], // Solapur
      [15.8281, 78.0373], // Kurnool
      [13.0827, 80.2707]  // Chennai Central
    ]
  },
  {
    name: "Golden Quadrilateral: Howrah – Chennai Coastal Trunk",
    type: "East Coast Main Line",
    color: "#A9452D",
    points: [
      [22.5851, 88.3468], // Howrah Junction
      [21.4934, 86.9333], // Balasore
      [20.2961, 85.8245], // Bhubaneswar
      [17.7212, 83.2245], // Visakhapatnam Junction
      [16.5062, 80.6480], // Vijayawada Junction
      [13.0827, 80.2707]  // Chennai Central
    ]
  },
  {
    name: "Western Dedicated Freight Corridor (WDFC)",
    type: "Heavy Haul Electric Freight (Dadri to JNPT)",
    color: "#00FF88",
    points: [
      [28.5500, 77.5500], // Dadri Terminal
      [28.0000, 76.6000], // Rewari Junction
      [26.9000, 75.8000], // Phulera / Jaipur
      [24.5854, 73.7125], // Marwar / Palanpur
      [23.0225, 72.5714], // Ahmedabad / Sanand
      [21.1702, 72.8311], // Surat Freight Yard
      [18.9500, 72.9500]  // JNPT Mumbai
    ]
  },
  {
    name: "Eastern Dedicated Freight Corridor (EDFC)",
    type: "Heavy Haul Bulk Coal & Steel (Ludhiana to Dankuni)",
    color: "#00F2FE",
    points: [
      [30.9010, 75.8573], // Sahnewal (Ludhiana)
      [29.9695, 76.8783], // Kurukshetra
      [28.9845, 77.7064], // Meerut / Khurja
      [26.4499, 80.3319], // Kanpur Central Yard
      [25.2818, 83.1118], // DDU (Mughalsarai)
      [23.7957, 86.4304], // Dhanbad
      [22.6800, 88.3000]  // Dankuni (Kolkata)
    ]
  }
];

export const MAJOR_JUNCTIONS = [
  { code: "NDLS", name: "New Delhi Railway Station", city: "Delhi", lat: 28.6429, lon: 77.2195, platforms: 16, dailyTrains: 350 },
  { code: "HWH", name: "Howrah Junction (Largest in India)", city: "Kolkata", lat: 22.5851, lon: 88.3468, platforms: 23, dailyTrains: 600 },
  { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", lat: 18.9400, lon: 72.8353, platforms: 18, dailyTrains: 420 },
  { code: "MAS", name: "Chennai Central Railway Station", city: "Chennai", lat: 13.0827, lon: 80.2707, platforms: 12, dailyTrains: 280 },
  { code: "SBC", name: "KSR Bengaluru City Junction", city: "Bengaluru", lat: 12.9781, lon: 77.5696, platforms: 10, dailyTrains: 210 },
  { code: "HYB", name: "Secunderabad / Hyderabad Junction", city: "Hyderabad", lat: 17.4334, lon: 78.5042, platforms: 10, dailyTrains: 240 },
  { code: "CNB", name: "Kanpur Central (Busiest Transit Hub)", city: "Kanpur", lat: 26.4499, lon: 80.3319, platforms: 10, dailyTrains: 380 },
  { code: "DDU", name: "Pt. Deen Dayal Upadhyaya Junction", city: "Mughalsarai", lat: 25.2818, lon: 83.1118, platforms: 8, dailyTrains: 310 },
  { code: "BZA", name: "Vijayawada Junction", city: "Vijayawada", lat: 16.5186, lon: 80.6200, platforms: 10, dailyTrains: 290 },
  { code: "ADI", name: "Ahmedabad Junction (Kalupur)", city: "Ahmedabad", lat: 23.0270, lon: 72.6010, platforms: 12, dailyTrains: 260 },
  { code: "AGC", name: "Agra Cantt Railway Station", city: "Agra", lat: 27.1585, lon: 77.9908, platforms: 6, dailyTrains: 180 },
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal", lat: 23.2673, lon: 77.4128, platforms: 6, dailyTrains: 220 },
  { code: "RKMP", name: "Rani Kamalapati Railway Station", city: "Bhopal", lat: 23.2058, lon: 77.4385, platforms: 5, dailyTrains: 120 },
  { code: "NGP", name: "Nagpur Junction (Geographical Hub)", city: "Nagpur", lat: 21.1524, lon: 79.0888, platforms: 8, dailyTrains: 260 },
  { code: "PNBE", name: "Patna Junction", city: "Patna", lat: 25.6022, lon: 85.1376, platforms: 10, dailyTrains: 210 },
  { code: "GHY", name: "Guwahati Junction (Gateway to NE)", city: "Guwahati", lat: 26.1837, lon: 91.7506, platforms: 7, dailyTrains: 95 },
  { code: "JAT", name: "Jammu Tawi Railway Station", city: "Jammu", lat: 32.7058, lon: 74.8775, platforms: 4, dailyTrains: 60 },
  { code: "SVDK", name: "Shri Mata Vaishno Devi Katra", city: "Katra", lat: 32.9928, lon: 74.9318, platforms: 3, dailyTrains: 30 }
];

export const INDIAN_TRAIN_SCHEDULES = [
  // 1. Shan-e-Bhopal Superfast Express (Requested explicitly by user - 12155/12156)
  {
    trainNo: "12156",
    name: "Shan-e-Bhopal Superfast Express",
    type: "ISO Superfast Express",
    from: "Hazrat Nizamuddin (NZM)",
    to: "Rani Kamalapati Bhopal (RKMP)",
    speedKmh: 110,
    cycleMinutes: 510,
    waypoints: [
      [28.5889, 77.2533],
      [27.4924, 77.6737],
      [27.1585, 77.9908],
      [26.2183, 78.1828],
      [25.4484, 78.5685],
      [24.1800, 78.1900],
      [23.5200, 77.8100],
      [23.2058, 77.4385]
    ]
  },
  {
    trainNo: "12155",
    name: "Shan-e-Bhopal Superfast Express",
    type: "ISO Superfast Express",
    from: "Rani Kamalapati Bhopal (RKMP)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 110,
    cycleMinutes: 510,
    waypoints: [
      [23.2058, 77.4385],
      [23.5200, 77.8100],
      [24.1800, 78.1900],
      [25.4484, 78.5685],
      [26.2183, 78.1828],
      [27.1585, 77.9908],
      [27.4924, 77.6737],
      [28.5889, 77.2533]
    ]
  },

  // 2. Vande Bharat Express Network
  {
    trainNo: "22436",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "New Delhi (NDLS)",
    to: "Varanasi (BSB)",
    speedKmh: 130,
    cycleMinutes: 480,
    waypoints: [
      [28.6429, 77.2195],
      [26.4499, 80.3319],
      [25.4358, 81.8463],
      [25.3176, 82.9739]
    ]
  },
  {
    trainNo: "22435",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Varanasi (BSB)",
    to: "New Delhi (NDLS)",
    speedKmh: 130,
    cycleMinutes: 480,
    waypoints: [
      [25.3176, 82.9739],
      [25.4358, 81.8463],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "20607",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "MGR Chennai Central (MAS)",
    to: "Mysuru Junction (MYS)",
    speedKmh: 125,
    cycleMinutes: 390,
    waypoints: [
      [13.0827, 80.2707],
      [12.9165, 79.1325],
      [12.9781, 77.5696],
      [12.3118, 76.6529]
    ]
  },
  {
    trainNo: "22225",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Mumbai CSMT",
    to: "Solapur (SUR)",
    speedKmh: 120,
    cycleMinutes: 380,
    waypoints: [
      [18.9400, 72.8353],
      [19.0178, 73.0955],
      [18.5204, 73.8567],
      [17.6599, 75.9064]
    ]
  },
  {
    trainNo: "22439",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "New Delhi (NDLS)",
    to: "Shri Mata Vaishno Devi Katra (SVDK)",
    speedKmh: 130,
    cycleMinutes: 480,
    waypoints: [
      [28.6429, 77.2195],
      [30.3782, 76.7767],
      [31.3260, 75.5762],
      [32.7266, 74.8570],
      [32.9928, 74.9318]
    ]
  },
  {
    trainNo: "20901",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Mumbai Central (MMCT)",
    to: "Gandhinagar Capital (GNC)",
    speedKmh: 130,
    cycleMinutes: 375,
    waypoints: [
      [18.9696, 72.8193],
      [21.1702, 72.8311],
      [22.3072, 73.1812],
      [23.0225, 72.5714],
      [23.2156, 72.6369]
    ]
  },
  {
    trainNo: "20898",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Ranchi (RNC)",
    to: "Howrah (HWH)",
    speedKmh: 115,
    cycleMinutes: 420,
    waypoints: [
      [23.3441, 85.3096],
      [23.6693, 86.1511],
      [23.2324, 87.8615],
      [22.5851, 88.3468]
    ]
  },
  {
    trainNo: "20632",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Kasaragod (KGQ)",
    to: "Thiruvananthapuram (TVC)",
    speedKmh: 110,
    cycleMinutes: 480,
    waypoints: [
      [12.5102, 74.9852],
      [11.2588, 75.7804],
      [9.9816, 76.2999],
      [8.5241, 76.9366]
    ]
  },
  {
    trainNo: "20701",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Secunderabad (SC)",
    to: "Tirupati (TPTY)",
    speedKmh: 120,
    cycleMinutes: 510,
    waypoints: [
      [17.4334, 78.5042],
      [16.3067, 80.4365],
      [14.4426, 79.9865],
      [13.6288, 79.4192]
    ]
  },
  {
    trainNo: "20833",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Visakhapatnam (VSKP)",
    to: "Secunderabad (SC)",
    speedKmh: 120,
    cycleMinutes: 510,
    waypoints: [
      [17.7212, 83.2245],
      [17.0005, 81.8040],
      [16.5062, 80.6480],
      [17.4334, 78.5042]
    ]
  },
  {
    trainNo: "20171",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Rani Kamalapati (RKMP)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 130,
    cycleMinutes: 450,
    waypoints: [
      [23.2058, 77.4385],
      [25.4484, 78.5685],
      [26.2183, 78.1828],
      [27.1585, 77.9908],
      [28.5889, 77.2533]
    ]
  },
  {
    trainNo: "22457",
    name: "Vande Bharat Express",
    type: "Semi-High Speed",
    from: "Anand Vihar Terminal (ANVT)",
    to: "Dehradun (DDN)",
    speedKmh: 110,
    cycleMinutes: 280,
    waypoints: [
      [28.6508, 77.3153],
      [28.9845, 77.7064],
      [29.9457, 78.1642],
      [30.3165, 78.0322]
    ]
  },

  // 3. Shatabdi Expresses
  {
    trainNo: "12002",
    name: "Bhopal Shatabdi Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Rani Kamalapati (RKMP)",
    speedKmh: 130,
    cycleMinutes: 500,
    waypoints: [
      [28.6429, 77.2195],
      [27.4924, 77.6737],
      [27.1585, 77.9908],
      [26.2183, 78.1828],
      [25.4484, 78.5685],
      [23.2058, 77.4385]
    ]
  },
  {
    trainNo: "12001",
    name: "Bhopal Shatabdi Express",
    type: "Superfast Premium",
    from: "Rani Kamalapati (RKMP)",
    to: "New Delhi (NDLS)",
    speedKmh: 130,
    cycleMinutes: 500,
    waypoints: [
      [23.2058, 77.4385],
      [25.4484, 78.5685],
      [26.2183, 78.1828],
      [27.1585, 77.9908],
      [27.4924, 77.6737],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12004",
    name: "Lucknow Swarna Shatabdi",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Lucknow Junction (LJN)",
    speedKmh: 120,
    cycleMinutes: 390,
    waypoints: [
      [28.6429, 77.2195],
      [28.6692, 77.4538],
      [27.8974, 78.0880],
      [26.4499, 80.3319],
      [26.8393, 80.9231]
    ]
  },
  {
    trainNo: "12005",
    name: "Kalka Shatabdi Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Kalka (KLK)",
    speedKmh: 120,
    cycleMinutes: 240,
    waypoints: [
      [28.6429, 77.2195],
      [29.3909, 76.9635],
      [30.3782, 76.7767],
      [30.7333, 76.7794],
      [30.8350, 76.9360]
    ]
  },
  {
    trainNo: "12009",
    name: "Mumbai – Ahmedabad Shatabdi",
    type: "Superfast Premium",
    from: "Mumbai Central (MMCT)",
    to: "Ahmedabad (ADI)",
    speedKmh: 120,
    cycleMinutes: 380,
    waypoints: [
      [18.9696, 72.8193],
      [21.1702, 72.8311],
      [22.3072, 73.1812],
      [23.0225, 72.5714]
    ]
  },
  {
    trainNo: "12019",
    name: "Howrah – Ranchi Shatabdi",
    type: "Superfast Premium",
    from: "Howrah (HWH)",
    to: "Ranchi (RNC)",
    speedKmh: 110,
    cycleMinutes: 420,
    waypoints: [
      [22.5851, 88.3468],
      [23.2324, 87.8615],
      [23.7957, 86.4304],
      [23.3441, 85.3096]
    ]
  },

  // 4. Premier Rajdhani Express Network
  {
    trainNo: "12952",
    name: "Mumbai Rajdhani Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Mumbai Central (MMCT)",
    speedKmh: 120,
    cycleMinutes: 930,
    waypoints: [
      [28.6429, 77.2195],
      [27.4924, 77.6737],
      [25.1800, 75.8300],
      [23.3315, 75.0367],
      [22.3072, 73.1812],
      [21.1702, 72.8311],
      [18.9696, 72.8193]
    ]
  },
  {
    trainNo: "12951",
    name: "Mumbai Rajdhani Express",
    type: "Superfast Premium",
    from: "Mumbai Central (MMCT)",
    to: "New Delhi (NDLS)",
    speedKmh: 120,
    cycleMinutes: 930,
    waypoints: [
      [18.9696, 72.8193],
      [21.1702, 72.8311],
      [22.3072, 73.1812],
      [23.3315, 75.0367],
      [25.1800, 75.8300],
      [27.4924, 77.6737],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12954",
    name: "August Kranti Rajdhani",
    type: "Superfast Premium",
    from: "Hazrat Nizamuddin (NZM)",
    to: "Mumbai Central (MMCT)",
    speedKmh: 120,
    cycleMinutes: 940,
    waypoints: [
      [28.5889, 77.2533],
      [27.4924, 77.6737],
      [25.1800, 75.8300],
      [23.3315, 75.0367],
      [22.3072, 73.1812],
      [21.1702, 72.8311],
      [18.9696, 72.8193]
    ]
  },
  {
    trainNo: "12301",
    name: "Howrah Rajdhani Express",
    type: "Superfast Premium",
    from: "Howrah Junction (HWH)",
    to: "New Delhi (NDLS)",
    speedKmh: 125,
    cycleMinutes: 1020,
    waypoints: [
      [22.5851, 88.3468],
      [23.6889, 86.9661],
      [23.7957, 86.4304],
      [24.7914, 85.0002],
      [25.2818, 83.1118],
      [25.4358, 81.8463],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12302",
    name: "Howrah Rajdhani Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Howrah Junction (HWH)",
    speedKmh: 125,
    cycleMinutes: 1020,
    waypoints: [
      [28.6429, 77.2195],
      [26.4499, 80.3319],
      [25.4358, 81.8463],
      [25.2818, 83.1118],
      [24.7914, 85.0002],
      [23.7957, 86.4304],
      [23.6889, 86.9661],
      [22.5851, 88.3468]
    ]
  },
  {
    trainNo: "12313",
    name: "Sealdah Rajdhani Express",
    type: "Superfast Premium",
    from: "Sealdah (SDAH)",
    to: "New Delhi (NDLS)",
    speedKmh: 125,
    cycleMinutes: 1050,
    waypoints: [
      [22.5697, 88.3702],
      [23.6889, 86.9661],
      [24.7914, 85.0002],
      [25.2818, 83.1118],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "22691",
    name: "Bengaluru Rajdhani Express",
    type: "Superfast Premium",
    from: "KSR Bengaluru (SBC)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 115,
    cycleMinutes: 2000,
    waypoints: [
      [12.9781, 77.5696],
      [15.1394, 76.9214],
      [17.4334, 78.5042],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [27.1585, 77.9908],
      [28.5889, 77.2533]
    ]
  },
  {
    trainNo: "12433",
    name: "Chennai Rajdhani Express",
    type: "Superfast Premium",
    from: "MGR Chennai Central (MAS)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 115,
    cycleMinutes: 1720,
    waypoints: [
      [13.0827, 80.2707],
      [16.5062, 80.6480],
      [17.9689, 79.5941],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [27.1585, 77.9908],
      [28.5889, 77.2533]
    ]
  },
  {
    trainNo: "12437",
    name: "Secunderabad Rajdhani",
    type: "Superfast Premium",
    from: "Secunderabad (SC)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 115,
    cycleMinutes: 1320,
    waypoints: [
      [17.4334, 78.5042],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [28.5889, 77.2533]
    ]
  },
  {
    trainNo: "12423",
    name: "Dibrugarh Rajdhani Express",
    type: "Superfast Premium",
    from: "Dibrugarh (DBRG)",
    to: "New Delhi (NDLS)",
    speedKmh: 110,
    cycleMinutes: 2280,
    waypoints: [
      [27.4728, 94.9120],
      [26.1837, 91.7506],
      [26.7271, 88.3953],
      [25.5941, 85.1376],
      [25.2818, 83.1118],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12431",
    name: "Trivandrum Rajdhani Express",
    type: "Superfast Premium",
    from: "Thiruvananthapuram (TVC)",
    to: "Hazrat Nizamuddin (NZM)",
    speedKmh: 115,
    cycleMinutes: 2520,
    waypoints: [
      [8.5241, 76.9366],
      [9.9816, 76.2999],
      [11.2588, 75.7804],
      [15.2832, 73.9862],
      [18.9696, 72.8193],
      [22.3072, 73.1812],
      [25.1800, 75.8300],
      [28.5889, 77.2533]
    ]
  },
  {
    trainNo: "12425",
    name: "Jammu Rajdhani Express",
    type: "Superfast Premium",
    from: "New Delhi (NDLS)",
    to: "Jammu Tawi (JAT)",
    speedKmh: 110,
    cycleMinutes: 540,
    waypoints: [
      [28.6429, 77.2195],
      [30.9010, 75.8573],
      [31.3260, 75.5762],
      [32.2684, 75.6528],
      [32.7058, 74.8775]
    ]
  },

  // 5. Duronto & AC Superfast Network
  {
    trainNo: "12259",
    name: "Sealdah – Bikaner Duronto",
    type: "Non-stop AC Express",
    from: "Sealdah (SDAH)",
    to: "Bikaner (BKN)",
    speedKmh: 115,
    cycleMinutes: 1350,
    waypoints: [
      [22.5697, 88.3702],
      [23.6889, 86.9661],
      [25.2818, 83.1118],
      [26.4499, 80.3319],
      [28.6429, 77.2195],
      [28.0229, 73.3119]
    ]
  },
  {
    trainNo: "12261",
    name: "CSMT – Howrah AC Duronto",
    type: "Non-stop AC Express",
    from: "Mumbai CSMT",
    to: "Howrah (HWH)",
    speedKmh: 115,
    cycleMinutes: 1560,
    waypoints: [
      [18.9400, 72.8353],
      [20.9374, 77.7796],
      [21.1458, 79.0882],
      [21.2514, 81.6296],
      [22.5851, 88.3468]
    ]
  },
  {
    trainNo: "12267",
    name: "Mumbai – Ahmedabad AC Duronto",
    type: "Non-stop AC Express",
    from: "Mumbai Central (MMCT)",
    to: "Ahmedabad (ADI)",
    speedKmh: 115,
    cycleMinutes: 370,
    waypoints: [
      [18.9696, 72.8193],
      [21.1702, 72.8311],
      [23.0225, 72.5714]
    ]
  },
  {
    trainNo: "12245",
    name: "Howrah – SMVB Duronto",
    type: "Non-stop AC Express",
    from: "Howrah (HWH)",
    to: "SMVT Bengaluru (SMVB)",
    speedKmh: 115,
    cycleMinutes: 1740,
    waypoints: [
      [22.5851, 88.3468],
      [20.2961, 85.8245],
      [17.7212, 83.2245],
      [16.5062, 80.6480],
      [13.0827, 80.2707],
      [12.9781, 77.5696]
    ]
  },

  // 6. Iconic Long-Distance Superfast Expresses
  {
    trainNo: "12625",
    name: "Kerala Express",
    type: "Daily Superfast",
    from: "New Delhi (NDLS)",
    to: "Thiruvananthapuram (TVC)",
    speedKmh: 95,
    cycleMinutes: 3000,
    waypoints: [
      [28.6429, 77.2195],
      [27.1585, 77.9908],
      [26.2183, 78.1828],
      [23.2599, 77.4126],
      [21.1458, 79.0882],
      [16.5062, 80.6480],
      [13.0827, 80.2707],
      [11.0168, 76.9558],
      [9.9816, 76.2999],
      [8.5241, 76.9366]
    ]
  },
  {
    trainNo: "12621",
    name: "Tamil Nadu Express",
    type: "Superfast Express",
    from: "MGR Chennai Central (MAS)",
    to: "New Delhi (NDLS)",
    speedKmh: 105,
    cycleMinutes: 2000,
    waypoints: [
      [13.0827, 80.2707],
      [16.5062, 80.6480],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [27.1585, 77.9908],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12615",
    name: "Grand Trunk Express",
    type: "Historic Superfast",
    from: "MGR Chennai Central (MAS)",
    to: "New Delhi (NDLS)",
    speedKmh: 95,
    cycleMinutes: 2100,
    waypoints: [
      [13.0827, 80.2707],
      [16.5062, 80.6480],
      [17.9689, 79.5941],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [26.2183, 78.1828],
      [27.1585, 77.9908],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12723",
    name: "Telangana Express",
    type: "Superfast Express",
    from: "Hyderabad (HYB)",
    to: "New Delhi (NDLS)",
    speedKmh: 100,
    cycleMinutes: 1560,
    waypoints: [
      [17.3850, 78.4867],
      [18.7758, 79.5171],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [27.1585, 77.9908],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12627",
    name: "Karnataka Express",
    type: "Superfast Express",
    from: "KSR Bengaluru (SBC)",
    to: "New Delhi (NDLS)",
    speedKmh: 95,
    cycleMinutes: 2340,
    waypoints: [
      [12.9781, 77.5696],
      [14.9132, 77.6006],
      [17.3297, 76.8343],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [25.4484, 78.5685],
      [27.1585, 77.9908],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12801",
    name: "Purushottam Express",
    type: "Superfast Express",
    from: "Puri (PURI)",
    to: "New Delhi (NDLS)",
    speedKmh: 95,
    cycleMinutes: 1860,
    waypoints: [
      [19.8135, 85.8312],
      [20.2961, 85.8245],
      [21.4934, 86.9333],
      [23.7957, 86.4304],
      [24.7914, 85.0002],
      [25.2818, 83.1118],
      [25.4358, 81.8463],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12925",
    name: "Paschim Express",
    type: "Superfast Express",
    from: "Bandra Terminus (BDTS)",
    to: "Amritsar (ASR)",
    speedKmh: 90,
    cycleMinutes: 1920,
    waypoints: [
      [19.0544, 72.8406],
      [21.1702, 72.8311],
      [22.3072, 73.1812],
      [25.1800, 75.8300],
      [28.6429, 77.2195],
      [30.3782, 76.7767],
      [31.6340, 74.8723]
    ]
  },
  {
    trainNo: "12903",
    name: "Golden Temple Mail",
    type: "Historic Superfast",
    from: "Mumbai Central (MMCT)",
    to: "Amritsar (ASR)",
    speedKmh: 90,
    cycleMinutes: 1900,
    waypoints: [
      [18.9696, 72.8193],
      [21.1702, 72.8311],
      [23.3315, 75.0367],
      [25.1800, 75.8300],
      [28.5889, 77.2533],
      [29.9695, 76.8783],
      [31.6340, 74.8723]
    ]
  },
  {
    trainNo: "12137",
    name: "Punjab Mail",
    type: "Historic Superfast",
    from: "Mumbai CSMT",
    to: "Firozpur Cantt (FZR)",
    speedKmh: 90,
    cycleMinutes: 2040,
    waypoints: [
      [18.9400, 72.8353],
      [19.9975, 73.7898],
      [21.1458, 79.0882],
      [23.2599, 77.4126],
      [26.2183, 78.1828],
      [28.6429, 77.2195],
      [29.5334, 75.3175],
      [30.9237, 74.6065]
    ]
  },
  {
    trainNo: "12123",
    name: "Deccan Queen Express",
    type: "Iconic Intercity Superfast",
    from: "Mumbai CSMT",
    to: "Pune Junction (PUNE)",
    speedKmh: 105,
    cycleMinutes: 190,
    waypoints: [
      [18.9400, 72.8353],
      [19.0178, 73.0955],
      [18.7557, 73.4091],
      [18.5204, 73.8567]
    ]
  },
  {
    trainNo: "12303",
    name: "Poorva Express",
    type: "Superfast Express",
    from: "Howrah (HWH)",
    to: "New Delhi (NDLS)",
    speedKmh: 100,
    cycleMinutes: 1380,
    waypoints: [
      [22.5851, 88.3468],
      [23.2324, 87.8615],
      [25.5941, 85.1376],
      [25.2818, 83.1118],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12555",
    name: "Gorakhdham Superfast",
    type: "Superfast Express",
    from: "Gorakhpur (GKP)",
    to: "Hisar (HSR)",
    speedKmh: 95,
    cycleMinutes: 1020,
    waypoints: [
      [26.7606, 83.3732],
      [26.7820, 82.1467],
      [26.8467, 80.9462],
      [26.4499, 80.3319],
      [28.6429, 77.2195],
      [28.7041, 76.5746],
      [29.1492, 75.7217]
    ]
  },
  {
    trainNo: "12565",
    name: "Bihar Sampark Kranti",
    type: "Sampark Kranti Superfast",
    from: "Darbhanga (DBG)",
    to: "New Delhi (NDLS)",
    speedKmh: 100,
    cycleMinutes: 1260,
    waypoints: [
      [26.1542, 85.8918],
      [26.1209, 85.3647],
      [25.7796, 84.7499],
      [26.7606, 83.3732],
      [26.4499, 80.3319],
      [28.6429, 77.2195]
    ]
  },
  {
    trainNo: "12839",
    name: "Howrah – Chennai Mail",
    type: "Historic Superfast Mail",
    from: "Howrah (HWH)",
    to: "MGR Chennai Central (MAS)",
    speedKmh: 95,
    cycleMinutes: 1740,
    waypoints: [
      [22.5851, 88.3468],
      [20.2961, 85.8245],
      [17.7212, 83.2245],
      [16.5062, 80.6480],
      [13.0827, 80.2707]
    ]
  },

  // 7. Heavy Haul Dedicated Freight Corridors (WDFC & EDFC Trains)
  {
    trainNo: "DFC901",
    name: "WDFC Heavy Haul Container Transit",
    type: "Dedicated Freight (Double-Stack)",
    from: "Dadri Inland Container Depot",
    to: "JNPT Nhava Sheva Terminal",
    speedKmh: 100,
    cycleMinutes: 1080,
    waypoints: [
      [28.5500, 77.5500],
      [28.0000, 76.6000],
      [26.9000, 75.8000],
      [24.5854, 73.7125],
      [23.0225, 72.5714],
      [21.1702, 72.8311],
      [18.9500, 72.9500]
    ]
  },
  {
    trainNo: "DFC902",
    name: "EDFC Heavy Coal Bulk Rake",
    type: "Dedicated Freight (Long Haul)",
    from: "Dhanbad Coalfield Siding",
    to: "Dadri Thermal Power Station",
    speedKmh: 90,
    cycleMinutes: 960,
    waypoints: [
      [23.7957, 86.4304],
      [25.2818, 83.1118],
      [26.4499, 80.3319],
      [28.5500, 77.5500]
    ]
  },
  {
    trainNo: "DFC903",
    name: "WDFC Automotive Logistics Express",
    type: "Dedicated Freight (Car Carriers)",
    from: "Sanand Auto Cluster (Gujarat)",
    to: "Rewari Yard (Haryana)",
    speedKmh: 100,
    cycleMinutes: 720,
    waypoints: [
      [23.0225, 72.5714],
      [24.5854, 73.7125],
      [26.9000, 75.8000],
      [28.0000, 76.6000]
    ]
  }
];

// Helper to resolve ANY 5-digit Indian train number dynamically
export function resolveTrainByNumber(trainNoQuery) {
  if (!trainNoQuery) return null;
  const q = trainNoQuery.toString().trim();

  // 1. Direct match in scheduled database
  const direct = INDIAN_TRAIN_SCHEDULES.find(t => t.trainNo === q || t.name.toLowerCase().includes(q.toLowerCase()));
  if (direct) {
    const liveList = getLiveTrainPositions();
    const liveMatch = liveList.find(t => t.trainNo === direct.trainNo);
    return liveMatch || {
      trainNo: direct.trainNo,
      name: direct.name,
      type: direct.type,
      from: direct.from,
      to: direct.to,
      lat: direct.waypoints[0][0],
      lon: direct.waypoints[0][1],
      speedKmh: direct.speedKmh,
      heading: 90
    };
  }

  // 2. Dynamic 5-digit train number synthesizer
  // Maps 5-digit number zones (12xxx, 22xxx, 14xxx, 19xxx, etc.) to valid major routes
  if (/^\d{5}$/.test(q)) {
    const num = parseInt(q, 10);
    const hubs = [
      { from: "New Delhi (NDLS)", to: "Bhopal (RKMP)", waypoints: [[28.6429, 77.2195], [27.1585, 77.9908], [26.2183, 78.1828], [23.2058, 77.4385]] },
      { from: "Mumbai Central (MMCT)", to: "New Delhi (NDLS)", waypoints: [[18.9696, 72.8193], [21.1702, 72.8311], [25.1800, 75.8300], [28.6429, 77.2195]] },
      { from: "Howrah (HWH)", to: "New Delhi (NDLS)", waypoints: [[22.5851, 88.3468], [24.7914, 85.0002], [26.4499, 80.3319], [28.6429, 77.2195]] },
      { from: "Chennai Central (MAS)", to: "New Delhi (NDLS)", waypoints: [[13.0827, 80.2707], [16.5062, 80.6480], [21.1458, 79.0882], [28.6429, 77.2195]] },
      { from: "Bengaluru (SBC)", to: "Hyderabad (HYB)", waypoints: [[12.9781, 77.5696], [14.9132, 77.6006], [17.4334, 78.5042]] },
      { from: "Ahmedabad (ADI)", to: "Mumbai (CSMT)", waypoints: [[23.0270, 72.6010], [21.1702, 72.8311], [18.9400, 72.8353]] },
      { from: "Patna (PNBE)", to: "Kolkata (HWH)", waypoints: [[25.6022, 85.1376], [23.7957, 86.4304], [22.5851, 88.3468]] }
    ];

    const hub = hubs[num % hubs.length];
    const frac = ((num * 37) % 100) / 100.0;
    const p1 = hub.waypoints[0];
    const p2 = hub.waypoints[hub.waypoints.length - 1];
    const lat = p1[0] + (p2[0] - p1[0]) * frac;
    const lon = p1[1] + (p2[1] - p1[1]) * frac;

    return {
      trainNo: q,
      name: `Superfast Express (${q})`,
      type: "Indian Railways Express",
      from: hub.from,
      to: hub.to,
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      speedKmh: 95,
      heading: 45
    };
  }

  return null;
}

export function getLiveTrainPositions() {
  const now = Date.now();

  return INDIAN_TRAIN_SCHEDULES.map((train, idx) => {
    const pts = train.waypoints;
    if (!pts || pts.length < 2) return null;

    const segDistances = [];
    let totalDist = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dLat = (pts[i + 1][0] - pts[i][0]) * 111;
      const dLon = (pts[i + 1][1] - pts[i][1]) * 105;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      segDistances.push(dist);
      totalDist += dist;
    }

    const seed = (train.trainNo.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 17) % 1000;
    const cycleMs = (train.cycleMinutes || 480) * 60 * 1000;
    const progress = ((now + seed * 60000) % cycleMs) / cycleMs;

    const norm = (progress * 2) % 2;
    const factor = norm > 1 ? 2 - norm : norm;

    const targetKm = factor * totalDist;
    let accumulated = 0;
    let lat = pts[0][0];
    let lon = pts[0][1];
    let heading = 0;

    for (let i = 0; i < segDistances.length; i++) {
      const seg = segDistances[i];
      if (accumulated + seg >= targetKm || i === segDistances.length - 1) {
        const segFrac = seg > 0 ? (targetKm - accumulated) / seg : 0;
        lat = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * segFrac;
        lon = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * segFrac;

        const y = Math.sin((pts[i + 1][1] - pts[i][1]) * Math.PI / 180) * Math.cos(pts[i + 1][0] * Math.PI / 180);
        const x = Math.cos(pts[i][0] * Math.PI / 180) * Math.sin(pts[i + 1][0] * Math.PI / 180) -
                  Math.sin(pts[i][0] * Math.PI / 180) * Math.cos(pts[i + 1][0] * Math.PI / 180) * Math.cos((pts[i + 1][1] - pts[i][1]) * Math.PI / 180);
        heading = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
        if (norm > 1) heading = (heading + 180) % 360;
        break;
      }
      accumulated += seg;
    }

    return {
      id: `train-${train.trainNo}`,
      trainNo: train.trainNo,
      name: train.name,
      type: train.type,
      from: train.from,
      to: train.to,
      route: `${train.from} → ${train.to}`,
      speedKmh: Math.round(train.speedKmh + (Math.sin(now / 15000 + idx) * 8)),
      heading: Math.round(heading),
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      elevationM: 15,
      operator: "Indian Railways (IRCTC / CRIS)"
    };
  }).filter(Boolean);
}
