export const OSINT_DISASTER_EVENTS = [
  {
    "id": "disaster-wayanad-2024",
    "title": "Wayanad Landslide & Flash Flood Corridor",
    "region": "Western Ghats, Kerala",
    "date": "July 2024",
    "category": "Geological & Flash Flood",
    "center": {
      "lat": 11.53,
      "lon": 76.16,
      "altitude": 7500
    },
    "summary": "Massive debris flow and torrential flash flood triggered by 572mm rainfall over 48 hours. The surge tracked 8.5 km down the Iruvazhinji river valley, demolishing bridges and villages.",
    "metrics": {
      "Surge Runout Distance": "8.6 Kilometers",
      "Elevation Drop": "1,550m → 720m (830m vertical)",
      "Peak Discharge Estimate": "~1,200 m³/s",
      "Debris Volume": "Estimated 8.2M Metric Tonnes"
    },
    "path": [
      [
        76.205,
        11.542,
        1540
      ],
      [
        76.195,
        11.539,
        1310
      ],
      [
        76.182,
        11.535,
        1020
      ],
      [
        76.165,
        11.528,
        840
      ],
      [
        76.152,
        11.521,
        770
      ],
      [
        76.138,
        11.514,
        720
      ]
    ],
    "stations": [
      {
        "id": "st-punchirimattam",
        "name": "Origin Breach Zone (Punchirimattam Peak)",
        "lat": 11.542,
        "lon": 76.205,
        "altitude": 1540,
        "type": "Slope Failure Scarp",
        "status": "Ground Zero",
        "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "description": "Crown scarp width 180m on 35-degree saturated lateritic slope. Initial liquefaction mobilized millions of cubic meters within 90 seconds."
      },
      {
        "id": "st-mundakkai",
        "name": "Mundakkai Settlement & Tea Plantation",
        "lat": 11.535,
        "lon": 76.182,
        "altitude": 1020,
        "type": "Direct Impact Zone",
        "status": "Severe Debris Deposit",
        "imageUrl": "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
        "description": "Debris velocity reached 45 km/h. Entire village cluster covered under 4-7 meters of boulders, mud, and uprooted trees."
      },
      {
        "id": "st-chooralmala",
        "name": "Chooralmala Bridge & River Convergence",
        "lat": 11.528,
        "lon": 76.165,
        "altitude": 840,
        "type": "Hydraulic Damming & Bridge Breach",
        "status": "Critical Infrastructure Severed",
        "imageUrl": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        "description": "Debris dammed behind concrete bridge arches before total structural collapse, unleashing a 12-meter wall of muddy water downstream."
      },
      {
        "id": "st-meppadi",
        "name": "Meppadi Rescue Base & Army Bailey Bridge",
        "lat": 11.514,
        "lon": 76.138,
        "altitude": 720,
        "type": "Tactical Relief Corridor",
        "status": "Operational Relief Hub",
        "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        "description": "Indian Army Madras Sappers constructed 190-foot Class-24 Bailey Bridge to reconnect Mundakkai-Chooralmala for heavy earthmovers."
      }
    ]
  },
  {
    "id": "disaster-chamoli-2021",
    "title": "Chamoli Glacier Lake Outburst Flood (GLOF)",
    "region": "Garhwal Himalayas, Uttarakhand",
    "date": "February 2021",
    "category": "Glacial Surge & Hydroelectric Breach",
    "center": {
      "lat": 30.49,
      "lon": 79.68,
      "altitude": 9000
    },
    "summary": "Hanging glacier and rock mass failure off Ronti peak triggered a catastrophic flood down the Rishiganga and Dhauliganga river canyons, overtopping two major hydroelectric projects.",
    "metrics": {
      "Surge Runout Distance": "14.2 Kilometers",
      "Vertical Drop": "5,600m → 1,800m (3,800m drop)",
      "Peak Water Speed": "~85 Kilometers/Hour",
      "Impact": "Rishiganga Dam and Tapovan Vishnugad Hydel breached"
    },
    "path": [
      [
        79.735,
        30.47,
        5200
      ],
      [
        79.705,
        30.485,
        3100
      ],
      [
        79.685,
        30.49,
        2100
      ],
      [
        79.635,
        30.505,
        1800
      ],
      [
        79.57,
        30.53,
        1450
      ]
    ],
    "stations": [
      {
        "id": "st-ronti",
        "name": "Ronti Peak Detachment Wall",
        "lat": 30.47,
        "lon": 79.735,
        "altitude": 5200,
        "type": "Glacial Rock Avalanche",
        "status": "High Altitude Detachment",
        "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        "description": "27 million cubic meters of rock and ice broke off from the north face of Ronti peak at 5,600m."
      },
      {
        "id": "st-raini",
        "name": "Raini Village & Rishiganga Dam Impact",
        "lat": 30.49,
        "lon": 79.685,
        "altitude": 2100,
        "type": "Infrastructure Destruction",
        "status": "Project Breached",
        "imageUrl": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
        "description": "13.2 MW Rishiganga small hydro project was obliterated by water mixed with silt and boulders."
      },
      {
        "id": "st-tapovan",
        "name": "Tapovan Vishnugad Tunnel Complex",
        "lat": 30.505,
        "lon": 79.635,
        "altitude": 1800,
        "type": "Subterranean Inundation",
        "status": "NTPC Tunnel Rescue Site",
        "imageUrl": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        "description": "Floodwaters inundated the 2.5km Tapovan headrace tunnel. ITBP and NDRF deployed heavy sludge pumps."
      }
    ]
  }
];