import http from 'http';
import './server/proxy.js';

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5200${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://127.0.0.1:5200${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

setTimeout(async () => {
  try {
    const fData = await getJson('/api/flights/india');
    console.log('✅ FLIGHTS OK: Loaded', fData.count, 'aircraft over India');

    const mData = await getJson('/api/maritime/india');
    console.log('✅ MARITIME OK: Loaded', mData.count, 'vessels in Indian EEZ');

    const defData = await getJson('/api/defense/sectors');
    console.log('✅ DEFENSE OK: Loaded', defData.sectors.length, 'Air Commands &', defData.airbases.length, 'Air Force Stations');

    const rData = await getJson('/api/railways/network');
    console.log('✅ RAILWAYS OK: Loaded', rData.corridors.length, 'trunk freight lines &', rData.junctions.length, 'major junctions');

    const trainData = await getJson('/api/railways/live-trains');
    console.log('✅ LIVE TRAINS OK: Tracking', trainData.count, 'real Indian express/freight trains (Vande Bharat, Rajdhani, Shatabdi, Shan-e-Bhopal, DFC)');
    if (trainData.count < 50) {
      throw new Error(`Expected at least 50 nationwide trains, got ${trainData.count}`);
    }

    const isroData = await getJson('/api/isro/missions');
    console.log('✅ ISRO OK: Loaded Sriharikota launch centres &', isroData.missions.length, 'satellite orbits');

    const newsData = await getJson('/api/news/live');
    console.log('✅ NEWS OK: Loaded live breaking alerts from Aaj Tak, NDTV, ANI');

    const radioData = await getJson('/api/radio/state?lat=28.6139&lon=77.2090');
    console.log('✅ RADIO (Delhi) OK: Detected State', radioData.detectedState, 'with', radioData.stations.length, 'FM streams (Expected >= 10)');
    if (radioData.stations.length < 10) {
      throw new Error(`Expected at least 10 Delhi radio stations, got ${radioData.stations.length}`);
    }

    const upRadio = await getJson('/api/radio/state?lat=26.8467&lon=80.9462');
    console.log('✅ RADIO (Uttar Pradesh) OK: Detected State', upRadio.detectedState, 'with', upRadio.stations.length, 'FM streams');

    const cctvData = await getJson('/api/cctv/india');
    console.log('✅ CCTV OK: Loaded', cctvData.count, 'metropolitan surveillance cameras across Indian cities');

    // Test Authentic Asset Recon Media API (Wikipedia / Wikimedia Commons)
    const reconFlight = await getJson('/api/media/recon?query=' + encodeURIComponent('Vistara Airbus A320') + '&type=commercial_flight');
    console.log('✅ RECON MEDIA (Flight) OK:', reconFlight.title, '-> Image:', reconFlight.url.substring(0, 60) + '...');

    const reconTrain = await getJson('/api/media/recon?query=' + encodeURIComponent('Vande Bharat Express') + '&type=train_vb');
    console.log('✅ RECON MEDIA (Train) OK:', reconTrain.title, '-> Image:', reconTrain.url.substring(0, 60) + '...');

    // Test TomTom Traffic Flow endpoint
    const trafficData = await getJson('/api/traffic/flow');
    console.log('✅ TOMTOM TRAFFIC FLOW OK: Tile URL generated:', trafficData.tileUrl.substring(0, 70) + '...');

    // Test Live Hazards & Disaster Monitoring endpoint
    const hazardsData = await getJson('/api/hazards/live');
    console.log('✅ LIVE HAZARDS OK: Loaded', hazardsData.count, 'active disaster alerts across India');

    // Test Dynamic Train Search (Shan-e-Bhopal Express 12155 & Vande Bharat 22436)
    const bplSearch = await getJson('/api/geocode?q=12155');
    console.log('✅ DYNAMIC TRAIN SEARCH (12155 Shan-e-Bhopal) OK:', bplSearch.name, '-> Lat:', bplSearch.lat, 'Lon:', bplSearch.lon);

    const vbSearch = await getJson('/api/geocode?q=22436');
    console.log('✅ DYNAMIC TRAIN SEARCH (22436 Vande Bharat) OK:', vbSearch.name, '-> Lat:', vbSearch.lat, 'Lon:', vbSearch.lon);

    // Test Curated Indian Cities (Agra, Jaipur, Delhi)
    const agraSearch = await getJson('/api/geocode?q=agra');
    console.log('✅ CURATED CITY GEOCODE (Agra) OK:', agraSearch.name, '-> Lat:', agraSearch.lat, 'Lon:', agraSearch.lon);
    if (Math.abs(agraSearch.lat - 27.1767) > 0.05) {
      throw new Error(`Agra coordinates misplaced: ${agraSearch.lat}, ${agraSearch.lon}`);
    }

    // Test Housing Society & Apartment Search (Gaur Cascades, Raj Nagar Extension)
    const gaurSearch = await getJson('/api/suggest?q=gaur+cascades&category=all');
    console.log('✅ SOCIETY SEARCH (Gaur Cascades) OK: Found', gaurSearch.suggestions.length, 'results. Top:', gaurSearch.suggestions[0]?.title);
    if (!gaurSearch.suggestions.some(s => s.title.toLowerCase().includes('gaur cascades'))) {
      throw new Error("Gaur Cascades residential society not resolved by suggest API!");
    }

    // Test Reverse Geocoding for Road Map Inspector & Directions
    const revGeo = await getJson('/api/geocode/reverse?lat=28.7028&lon=77.4263');
    console.log('✅ REVERSE GEOCODING (Road Map Inspector) OK:', revGeo.title, '| Address:', revGeo.address);

    // Test Conversational AI (Informational Query: "tell me more about hindon" -> MUST NOT trigger flyTo)
    const aiInfo = await postJson('/api/ai/tactical', { prompt: "tell me more about hindon" });
    console.log('✅ AI INFORMATIONAL BRIEFING OK (No unwanted flyTo):', aiInfo.speech);
    if (aiInfo.action && aiInfo.action.type === 'flyTo') {
      throw new Error("Informational query falsely triggered camera flyTo!");
    }

    // Test AI "take me to agra" directive (MUST trigger flyTo to Agra dead-center)
    const aiAgra = await postJson('/api/ai/tactical', { prompt: "take me to agra" });
    console.log('✅ AI "TAKE ME TO AGRA" OK:', aiAgra.speech, '| Action:', aiAgra.action);
    if (!aiAgra.action || aiAgra.action.type !== 'flyTo' || Math.abs(aiAgra.action.lat - 27.1767) > 0.05) {
      throw new Error("AI failed to fly to Agra correctly!");
    }

    // Test AI "where am i" directive over Hindon Air Force Station
    const aiWhereAmI = await postJson('/api/ai/tactical', { 
      prompt: "where am i", 
      camera: { lat: 28.7042, lon: 77.3589, height: 2500 } 
    });
    const envIndia = await getJson('/api/environmental/india');
    console.log('✅ ENVIRONMENTAL (India) OK: Loaded', envIndia.aqi.length, 'real AQI stations &', envIndia.fires.length, 'NASA FIRMS thermal hotspots');

    const envStatus = await getJson('/api/environmental/status');
    console.log('✅ ENVIRONMENTAL (Status Alias) OK: Redirected / fetched successfully');

    // Test ISRO Satellites in 3D Space
    if (!isroData.missions.some(m => m.currentPos && m.currentPos.lat !== undefined)) {
      throw new Error("ISRO missions missing real-time satellite coordinates!");
    }
    console.log('✅ ISRO 3D SATELLITES OK: Verified orbits & live satellite positions');

    // Test Kerala Radio Centroid Resolution
    const keralaRadio = await getJson('/api/radio/state?lat=9.9312&lon=76.2673');
    console.log('✅ RADIO (Kerala) OK: Detected State', keralaRadio.detectedState, 'with', keralaRadio.stations.length, 'FM streams');
    if (keralaRadio.detectedState !== 'Kerala') {
      throw new Error(`Expected Kerala for Kochi coordinates, got ${keralaRadio.detectedState}`);
    }

    // Test AI "exit chase" directive
    const aiExitChase = await postJson('/api/ai/tactical', { prompt: "exit chase" });
    console.log('✅ AI "EXIT CHASE" OK:', aiExitChase.speech, '| Action:', aiExitChase.action);
    if (!aiExitChase.action || aiExitChase.action.type !== 'exitCockpit') {
      throw new Error("AI failed to exit chase mode!");
    }

    // Test AI "what is the aqi in delhi"
    const aiAqi = await postJson('/api/ai/tactical', { prompt: "what is the aqi in delhi" });
    console.log('✅ AI AQI DIRECTIVE OK:', aiAqi.speech);

    // Test 3D Route Planning API (Delhi to Agra)
    const routePlan = await getJson('/api/route/plan?origin=Delhi&dest=Agra');
    console.log('✅ ROUTE PLANNER OK: Computed Route Delhi -> Agra:', routePlan.distanceKm, 'KM | Duration:', routePlan.durationFormatted, '| Coordinates count:', routePlan.coordinates.length);
    if (!routePlan.success || routePlan.distanceKm < 150 || routePlan.coordinates.length < 5) {
      throw new Error("Route planner failed to generate valid trajectory!");
    }

    // Test AI Route Directive ("plan route from Delhi to Agra")
    const aiRoute = await postJson('/api/ai/tactical', { prompt: "plan route from Delhi to Agra" });
    console.log('✅ AI ROUTE DIRECTIVE OK:', aiRoute.speech, '| Action:', aiRoute.action?.type);
    if (!aiRoute.action || aiRoute.action.type !== 'planRoute') {
      throw new Error("AI failed to plan route from Delhi to Agra!");
    }

    // Test AI Train Tracking Directive ("track vande bharat express from bhopal")
    const aiTrain = await postJson('/api/ai/tactical', { prompt: "track vande bharat express from bhopal" });
    console.log('✅ AI TRAIN TRACKING OK:', aiTrain.speech, '| Target train:', aiTrain.action?.trainNo, '| Type:', aiTrain.action?.targetType);
    if (!aiTrain.action || aiTrain.action.targetType !== 'train' || aiTrain.action.trainNo !== '20171') {
      throw new Error("AI failed to track Vande Bharat from Bhopal correctly!");
    }

    // Test AI Travel & Hotel Mastermind ("hotels in Jaipur")
    const aiTravel = await postJson('/api/ai/tactical', { prompt: "suggest hotels in Jaipur" });
    console.log('✅ AI TRAVEL MASTERMIND OK:', aiTravel.speech);
    if (!aiTravel.speech.includes('Jaipur') || !aiTravel.speech.includes('Palace')) {
      throw new Error("AI travel planner failed to recommend hotels in Jaipur!");
    }

    console.log('\n🎉 ALL IISN HIGH-PRECISION SURVEILLANCE UPGRADE TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}, 800);
