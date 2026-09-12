// India Integrated Surveillance Network (IISN) // Core 3D Cesium Orchestrator
import { createAircraftSvg, createShipSvg, createTrainSvg } from './assets/icons.js';
import { tacticalAudio } from './audioEngine.js';

// Camera-basis orientation projection helper (matching God's Eye iconOrientation.js)
const _scratchEnu = new Cesium.Matrix4();
const _scratchForward = new Cesium.Cartesian3();
const _scratchWorldForward = new Cesium.Cartesian3();

function screenProjectedRotation(scene, position, headingDeg, previous = 0) {
  const camera = scene?.camera;
  if (!camera?.rightWC || !camera?.upWC || !position) return previous;

  const courseRad = Cesium.Math.toRadians(headingDeg || 0);
  Cesium.Cartesian3.fromElements(
    Math.sin(courseRad) * 2000,
    Math.cos(courseRad) * 2000,
    0,
    _scratchForward
  );
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(position, Cesium.Ellipsoid.WGS84, _scratchEnu);
  Cesium.Matrix4.multiplyByPointAsVector(enu, _scratchForward, _scratchWorldForward);

  const dx = Cesium.Cartesian3.dot(_scratchWorldForward, camera.rightWC);
  const dy = -Cesium.Cartesian3.dot(_scratchWorldForward, camera.upWC);
  if ((dx * dx + dy * dy) < 0.25) return previous;

  return Math.atan2(-dx, -dy);
}

class IISNApp {
  constructor() {
    this.viewer = null;
    this.selectedEntity = null;
    this.isCockpitActive = false;
    this.cockpitRemoveListener = null;
    this.isStreetViewPickMode = false;
    this.streetViewMarker = null;
    this.activeForeignTheaters = [];

    // Config & Keys
    this.config = {};
    this.photorealTileset = null;
    this.trafficLayer = null;
    this.satelliteLayer = null;
    this.darkLayer = null;
    this.currentBasemap = '3d';
    this.selectedMaleVoice = null;
    this.availableVoices = [];
    this.hls = null;

    // Entity Collections
    this.flightEntities = new Map();
    this.flightHistories = new Map();
    this.flightTrailEntities = new Map();
    this.marineEntities = new Map();
    this.trainEntities = new Map();
    this.cctvEntities = [];
    this.cctvFrustumEntities = [];
    this.isroEntities = [];
    this.railwayEntities = [];
    this.defenseEntities = [];
    this.envEntities = [];
    this.routeEntities = [];

    // State (All layers OFF by default for clean start)
    this.currentState = 'Delhi';
    this.activeLayers = {
      flights: false,
      maritime: false,
      cctv: false,
      isro: false,
      railways: false,
      defense: false,
      environmental: false,
      traffic: false
    };
  }

  async init() {
    await this.fetchConfig();
    await this.initCesiumViewer();
    this.initClock();
    this.initNewsTicker();
    this.initRadio();
    this.initVoices();
    this.initAiConsole();
    this.initLayerToggles();
    this.initSectorButtons();
    this.initBasemapButtons();
    this.initAudioToggle();
    this.initTelemetryInspector();
    this.initCctvInspector();
    this.initOmniSearch();
    this.initStreetView();
    this.initHudToggle();
    this.initVisionModes();
    this.initCameraTelemetry();
    this.initHazardAlerts();
    this.initSettingsModal();
    this.initLegendModal();

    // Load initial layers
    await this.loadCctvNetwork();
    await this.loadAirDefenseSectors();
    await this.loadRailways();
    await this.loadIsroMissions();
    await this.loadEnvironmental();
    await this.initTrafficLayer();
    
    // Start real-time loops
    this.pollFlights();
    this.pollMaritime();
    this.pollTrains();
    setInterval(() => this.pollFlights(), 12000);
    setInterval(() => this.pollMaritime(), 15000);
    setInterval(() => this.pollTrains(), 4000);

    // Track camera movement to geofence state radio
    this.setupCameraStateWatcher();
  }

  async fetchConfig() {
    try {
      const res = await fetch('/api/config');
      this.config = await res.json();
      const localCfg = JSON.parse(localStorage.getItem('iisn_config') || '{}');
      const cesiumToken = localCfg.cesiumToken || this.config.cesiumToken;
      if (cesiumToken) {
        Cesium.Ion.defaultAccessToken = cesiumToken;
      }
    } catch (e) {
      console.warn('Could not fetch public config:', e);
    }
  }

  async initCesiumViewer() {
    // 1. Initialize Cesium 3D Viewer with High Performance WebGL & Frame Capping
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      skyAtmosphere: new Cesium.SkyAtmosphere(),
      targetFrameRate: 60,
      useBrowserRecommendedResolution: true,
      contextOptions: {
        webgl: {
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }
      }
    });

    this.viewer.resolutionScale = window.devicePixelRatio > 1 ? Math.min(window.devicePixelRatio, 1.25) : 1.0;

    // 2. Load Google Photorealistic 3D Tiles via Cesium Ion Token with Dynamic LOD Optimizations
    let photorealLoaded = false;
    if (this.config.cesiumToken) {
      try {
        console.log('[IISN] Initializing Google Photorealistic 3D Tiles...');
        this.photorealTileset = await Cesium.createGooglePhotorealistic3DTileset();
        this.photorealTileset.maximumScreenSpaceError = 24;
        this.photorealTileset.preloadFlightCamera = true;
        this.photorealTileset.dynamicScreenSpaceError = true;
        this.photorealTileset.dynamicScreenSpaceErrorDensity = 0.00278;
        this.photorealTileset.dynamicScreenSpaceErrorFactor = 4.0;
        this.photorealTileset.dynamicScreenSpaceErrorHeightFalloff = 0.25;

        this.viewer.scene.primitives.add(this.photorealTileset);
        this.viewer.scene.globe.show = false;
        photorealLoaded = true;
        this.currentBasemap = '3d';
        console.log('[IISN] Google 3D Photorealistic Tiles loaded successfully.');
      } catch (err) {
        console.warn('[IISN] Google Photorealistic 3D Tiles fallback:', err);
      }
    }

    // 3. Configure Satellite with Labels and Tactical Dark imagery layers on globe
    try {
      if (this.config.cesiumToken) {
        const bingAerial = await Cesium.createWorldImageryAsync({
          style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
        });
        this.satelliteLayer = this.viewer.imageryLayers.addImageryProvider(bingAerial);
        this.satelliteLayer.show = !photorealLoaded;
      }
    } catch (e) {
      console.warn('[IISN] Bing satellite fallback:', e);
    }

    try {
      // 1. Keyless Esri World Dark Gray Canvas (replaces Carto with no watermark)
      const darkProv = new Cesium.UrlTemplateImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        credit: '© Esri, HERE, Garmin, © OpenStreetMap contributors'
      });
      this.darkLayer = this.viewer.imageryLayers.addImageryProvider(darkProv);
      this.darkLayer.show = false;
    } catch (e) {
      console.warn('[IISN] Dark layer fallback:', e);
    }

    try {
      // 2. Official Google Maps Roadmap (Full road names, shops, buildings, landmarks)
      const roadProv = new Cesium.UrlTemplateImageryProvider({
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maximumLevel: 21,
        credit: '© Google Maps'
      });
      this.roadLayer = this.viewer.imageryLayers.addImageryProvider(roadProv);
      this.roadLayer.show = false;
    } catch (e) {
      console.warn('[IISN] Road layer fallback:', e);
    }

    try {
      // 3. OpenRailwayMap Standard Tracks Layer (Bounded strictly to India & minimumLevel 9 to prevent global spiderweb)
      const railwayTrackProv = new Cesium.UrlTemplateImageryProvider({
        url: 'https://a.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        rectangle: Cesium.Rectangle.fromDegrees(68.0, 6.5, 97.5, 37.5),
        minimumLevel: 9,
        maximumLevel: 19,
        credit: '© OpenRailwayMap contributors'
      });
      this.railwayTrackLayer = this.viewer.imageryLayers.addImageryProvider(railwayTrackProv);
      this.railwayTrackLayer.show = Boolean(this.activeLayers.railways);
    } catch (e) {
      console.warn('[IISN] Railway tracks overlay fallback:', e);
    }

    if (!photorealLoaded) {
      this.viewer.scene.globe.show = true;
    }

    // 4. Configure Intuitive 3D Mouse Controls & Ground Collision Protection
    const controller = this.viewer.scene.screenSpaceCameraController;
    controller.enableRotate = true;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableTilt = true;
    controller.enableLook = true;

    // Ground clipping & collision prevention (managed natively by Cesium controller)
    controller.enableCollisionDetection = true;
    controller.minimumZoomDistance = 45;
    this.viewer.scene.globe.depthTestAgainstTerrain = true;

    // Left-Click Drag: Pan / Orbit across 3D globe smoothly
    // Right-Click Drag: Rotate & Tilt 3D perspective pitch
    // Scroll Wheel: Zoom in / out
    controller.rotateEventTypes = Cesium.CameraEventType.LEFT_DRAG;
    controller.tiltEventTypes = [Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.MIDDLE_DRAG];
    controller.zoomEventTypes = [Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

    // Variable Zoom Wheel Speed Interceptor: Shift for Turbo Zoom (3.5x), Ctrl for Precision Micro-Zoom (0.25x)
    this.viewer.scene.canvas.addEventListener('wheel', (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        const camera = this.viewer.camera;
        const carto = camera.positionCartographic;
        const height = carto ? carto.height : 15000;
        const amount = Math.max(height * 0.45, 800);
        if (e.deltaY < 0) {
          camera.zoomIn(amount);
        } else {
          camera.zoomOut(amount);
        }
      } else if (e.ctrlKey) {
        e.preventDefault();
        const camera = this.viewer.camera;
        const carto = camera.positionCartographic;
        const height = carto ? carto.height : 15000;
        const amount = Math.max(height * 0.05, 50);
        if (e.deltaY < 0) {
          camera.zoomIn(amount);
        } else {
          camera.zoomOut(amount);
        }
      }
    }, { passive: false });

    // Initial viewpoint: Centered over Indian Subcontinent in 3D
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(78.9629, 21.5000, 3200000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-80),
        roll: 0
      },
      duration: 2.0
    });

    // Left-Click selection, Street View Pick & Road Inspector handler
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((click) => {
      // If interactive Street View mode is active, click picks road coordinate
      if (this.isStreetViewPickMode) {
        const ray = this.viewer.camera.getPickRay(click.position);
        const groundPos = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (groundPos) {
          const carto = Cesium.Cartographic.fromCartesian(groundPos);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const lon = Cesium.Math.toDegrees(carto.longitude);
          this.openStreetViewAt(lat, lon);
          return;
        }
      }

      const pickedObject = this.viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.customData) {
        this.selectTarget(pickedObject.id.customData);
        // Hide road context card if asset clicked
        const roadCard = document.getElementById('road-context-card');
        if (roadCard) roadCard.style.display = 'none';
        return;
      }

      // If Road Map mode is active, clicking on ground opens road / POI info & directions
      if (this.currentBasemap === 'road') {
        const ray = this.viewer.camera.getPickRay(click.position);
        const groundPos = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (groundPos) {
          const carto = Cesium.Cartographic.fromCartesian(groundPos);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const lon = Cesium.Math.toDegrees(carto.longitude);
          const canvasRect = this.viewer.scene.canvas.getBoundingClientRect();
          this.showRoadContextPopup(lat, lon, click.position.x + canvasRect.left, click.position.y + canvasRect.top);
          return;
        }
      }

      // Close road context popup on regular empty map click
      const roadCard = document.getElementById('road-context-card');
      if (roadCard) roadCard.style.display = 'none';
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Cockpit Exit Button listener
    document.getElementById('exit-cockpit-btn')?.addEventListener('click', () => {
      this.exitCockpitMode();
    });
  }

  async showRoadContextPopup(lat, lon, clientX, clientY) {
    let card = document.getElementById('road-context-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'road-context-card';
      card.className = 'road-context-card';
      document.body.appendChild(card);
    }

    card.style.left = `${Math.min(clientX + 10, window.innerWidth - 330)}px`;
    card.style.top = `${Math.min(clientY + 10, window.innerHeight - 170)}px`;
    card.style.display = 'block';
    card.innerHTML = `
      <div class="road-context-header">
        <div class="road-context-title">Inspecting Location...</div>
        <button class="road-context-close" onclick="document.getElementById('road-context-card').style.display='none'">✕</button>
      </div>
      <div class="road-context-coords">${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E</div>
    `;

    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const title = data.title || `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
      const subtitle = data.address || `${data.municipality || ''} ${data.countrySubdivision || ''}`.trim() || 'Indian Subcontinent';

      card.innerHTML = `
        <div class="road-context-header">
          <div class="road-context-title">${title}</div>
          <button class="road-context-close" onclick="document.getElementById('road-context-card').style.display='none'">✕</button>
        </div>
        <div class="road-context-subtitle">${subtitle}</div>
        <div class="road-context-coords">${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E</div>
        <div class="road-context-btn-row">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" class="road-action-btn primary">
            DIRECTIONS
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" class="road-action-btn">
            GOOGLE MAPS
          </a>
          <button class="road-action-btn" onclick="window.iisnApp.openStreetViewAt(${lat}, ${lon})">
            STREET VIEW
          </button>
        </div>
      `;
    } catch (e) {
      card.innerHTML = `
        <div class="road-context-header">
          <div class="road-context-title">Selected Location</div>
          <button class="road-context-close" onclick="document.getElementById('road-context-card').style.display='none'">✕</button>
        </div>
        <div class="road-context-coords">${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E</div>
        <div class="road-context-btn-row">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" class="road-action-btn primary">
            DIRECTIONS
          </a>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lon}" target="_blank" class="road-action-btn">
            GOOGLE MAPS
          </a>
        </div>
      `;
    }
  }

  initClock() {
    const clockEl = document.getElementById('live-ist-clock');
    setInterval(() => {
      const now = new Date();
      if (clockEl) {
        clockEl.innerText = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + ' IST';
      }
    }, 1000);
  }

  initBasemapButtons() {
    const btnSat = document.getElementById('btn-map-sat');
    const btn3d = document.getElementById('btn-map-3d');
    const btnRoad = document.getElementById('btn-map-road');
    const btnDark = document.getElementById('btn-map-dark');

    const updateActive = (activeBtn) => {
      [btnSat, btn3d, btnRoad, btnDark].forEach(b => b?.classList.remove('active'));
      activeBtn?.classList.add('active');
    };

    btn3d?.addEventListener('click', () => {
      updateActive(btn3d);
      tacticalAudio.playClick();
      if (this.photorealTileset) {
        this.photorealTileset.show = true;
        this.viewer.scene.globe.show = false;
      }
      if (this.satelliteLayer) this.satelliteLayer.show = false;
      if (this.roadLayer) this.roadLayer.show = false;
      if (this.darkLayer) this.darkLayer.show = false;
      this.currentBasemap = '3d';
    });

    btnSat?.addEventListener('click', () => {
      updateActive(btnSat);
      tacticalAudio.playClick();
      if (this.photorealTileset) this.photorealTileset.show = false;
      this.viewer.scene.globe.show = true;
      if (this.satelliteLayer) this.satelliteLayer.show = true;
      if (this.roadLayer) this.roadLayer.show = false;
      if (this.darkLayer) this.darkLayer.show = false;
      this.currentBasemap = 'satellite';
    });

    btnRoad?.addEventListener('click', () => {
      updateActive(btnRoad);
      tacticalAudio.playClick();
      if (this.photorealTileset) this.photorealTileset.show = false;
      this.viewer.scene.globe.show = true;
      if (this.satelliteLayer) this.satelliteLayer.show = false;
      if (this.roadLayer) this.roadLayer.show = true;
      if (this.darkLayer) this.darkLayer.show = false;
      this.currentBasemap = 'road';
    });

    btnDark?.addEventListener('click', () => {
      updateActive(btnDark);
      tacticalAudio.playClick();
      if (this.photorealTileset) this.photorealTileset.show = false;
      this.viewer.scene.globe.show = true;
      if (this.satelliteLayer) this.satelliteLayer.show = false;
      if (this.roadLayer) this.roadLayer.show = false;
      if (this.darkLayer) this.darkLayer.show = true;
      this.currentBasemap = 'dark';
    });

    updateActive(btn3d);
  }

  initAudioToggle() {
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const isMuted = tacticalAudio.toggleMute();
        btn.innerText = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
        btn.style.color = isMuted ? 'var(--text-dim)' : 'var(--brand-violet)';
      });
    }
  }

  // 1. Live Airspace Flight Tracking (India National Airspace)
  async pollFlights() {
    if (!this.activeLayers.flights) return;
    try {
      const res = await fetch('/api/flights/india');
      const data = await res.json();
      if (!data || !data.flights) return;

      const currentIcaos = new Set();
      const isVisible = Boolean(this.activeLayers.flights);

      data.flights.forEach(f => {
        currentIcaos.add(f.icao24);
        const position = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, f.altitudeM || 1000);
        const isMil = f.type === 'military';
        const colorHex = isMil ? '#EF4444' : '#38BDF8';
        const rot = -Cesium.Math.toRadians(f.heading || 0);

        if (this.flightEntities.has(f.icao24)) {
          const entity = this.flightEntities.get(f.icao24);
          entity.position = position;
          entity.customData = f;
          if (entity.billboard) entity.billboard.rotation = rot;
          entity.show = isVisible;
        } else {
          const entity = this.viewer.entities.add({
            name: f.callsign,
            show: isVisible,
            position,
            billboard: {
              image: createAircraftSvg(colorHex, isMil),
              rotation: rot,
              alignedAxis: Cesium.Cartesian3.ZERO,
              width: isMil ? 28 : 24,
              height: isMil ? 28 : 24,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER
            },
            label: {
              text: f.callsign,
              font: 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.44,
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#030712'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(11, 18, 32, 0.9)'),
              backgroundPadding: new Cesium.Cartesian2(6, 4),
              pixelOffset: new Cesium.Cartesian2(0, -20),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 950000)
            }
          });

          entity.customData = f;
          this.flightEntities.set(f.icao24, entity);
        }

        // Persistent Flight Path / Course Trail Tracking
        if (!this.flightHistories.has(f.icao24)) {
          this.flightHistories.set(f.icao24, []);
        }
        const hist = this.flightHistories.get(f.icao24);
        hist.push([f.lon, f.lat, f.altitudeM || 8000]);
        if (hist.length > 30) hist.shift();

        const points = (f.trail && f.trail.length >= 2) ? f.trail : (hist.length >= 2 ? hist : null);
        if (points && points.length >= 2) {
          const flatPoints = [];
          points.forEach(pt => flatPoints.push(pt[0], pt[1], pt[2]));

          if (this.flightTrailEntities.has(f.icao24)) {
            const trail = this.flightTrailEntities.get(f.icao24);
            trail.polyline.positions = Cesium.Cartesian3.fromDegreesArrayHeights(flatPoints);
            trail.show = isVisible;
          } else {
            const trail = this.viewer.entities.add({
              show: isVisible,
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(flatPoints),
                width: 2.8,
                arcType: Cesium.ArcType.GEODESIC,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.35,
                  color: isMil ? Cesium.Color.fromCssColorString('#EF4444') : Cesium.Color.fromCssColorString('#38BDF8')
                }),
                depthFailMaterial: isMil
                  ? Cesium.Color.fromCssColorString('#EF4444').withAlpha(0.4)
                  : Cesium.Color.fromCssColorString('#38BDF8').withAlpha(0.4)
              }
            });
            this.flightTrailEntities.set(f.icao24, trail);
          }
        }
      });

      // Cleanup stale flights & trails
      for (const [icao, ent] of this.flightEntities.entries()) {
        if (!currentIcaos.has(icao)) {
          this.viewer.entities.remove(ent);
          this.flightEntities.delete(icao);
          if (this.flightTrailEntities.has(icao)) {
            this.viewer.entities.remove(this.flightTrailEntities.get(icao));
            this.flightTrailEntities.delete(icao);
          }
        }
      }

      const stat = document.getElementById('stat-flights');
      if (stat) stat.innerText = this.flightEntities.size;
    } catch (e) {
      console.error('Flight poll error:', e);
    }
  }

  // 2. Live Maritime AIS Traffic with directional ship vectors
  async pollMaritime() {
    if (!this.activeLayers.maritime) return;
    try {
      const res = await fetch('/api/maritime/india');
      const data = await res.json();
      if (!data || !data.vessels) return;

      this.marineEntities.forEach(ent => this.viewer.entities.remove(ent));
      this.marineEntities.clear();
      const isVisible = Boolean(this.activeLayers.maritime);

      data.vessels.forEach(v => {
        const pos = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 10);
        const isMil = v.isMilitary;
        const colorHex = isMil ? '#D45B3E' : '#00FF88';
        const rot = -Cesium.Math.toRadians(v.heading || 0);

        const ent = this.viewer.entities.add({
          name: v.name,
          show: isVisible,
          position: pos,
          billboard: {
            image: createShipSvg(colorHex),
            rotation: rot,
            alignedAxis: Cesium.Cartesian3.ZERO,
            width: 20,
            height: 20,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER
          },
          label: {
            text: v.name,
            font: 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
            scale: 0.40,
            fillColor: Cesium.Color.fromCssColorString('#F3EFEF'),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 3,
            outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
            pixelOffset: new Cesium.Cartesian2(0, -16),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 600000)
          }
        });

        ent.customData = {
          id: v.mmsi,
          mmsi: v.mmsi,
          callsign: v.name,
          name: v.name,
          vesselType: v.vesselType || (isMil ? 'Naval Warship' : 'Commercial Vessel'),
          isShip: true,
          isMilitary: isMil,
          operator: isMil ? 'Indian Navy / Coast Guard' : 'Commercial Shipping Fleet',
          route: `Destination: ${v.destination || 'Indian Coastal Port'}`,
          altitudeFt: 0,
          speedKnots: v.speedKnots,
          heading: v.heading,
          lat: v.lat,
          lon: v.lon
        };

        this.marineEntities.set(v.mmsi, ent);
      });

      const stat = document.getElementById('stat-maritime');
      if (stat) stat.innerText = this.marineEntities.size;
    } catch (e) {
      console.error('Maritime poll error:', e);
    }
  }

  // 3. Indian Railways Live Moving Express & Freight Trains
  async pollTrains() {
    if (!this.activeLayers.railways) return;
    try {
      const res = await fetch('/api/railways/live-trains');
      const data = await res.json();
      if (!data || !data.trains) return;

      const currentIds = new Set();
      const isVisible = Boolean(this.activeLayers.railways);

      data.trains.forEach(t => {
        currentIds.add(t.id);
        const pos = Cesium.Cartesian3.fromDegrees(t.lon, t.lat, 20);
        const rot = -Cesium.Math.toRadians(t.heading || 0);

        if (this.trainEntities.has(t.id)) {
          const ent = this.trainEntities.get(t.id);
          ent.position = pos;
          ent.customData = t;
          if (ent.billboard) ent.billboard.rotation = rot;
          ent.show = isVisible;
        } else {
          const isVandeBharat = t.name.includes('Vande Bharat');
          const isRajdhani = t.name.includes('Rajdhani');
          const trainColor = isVandeBharat ? '#00F2FE' : isRajdhani ? '#D45B3E' : '#6864F6';

          const ent = this.viewer.entities.add({
            name: `${t.trainNo} ${t.name}`,
            show: isVisible,
            position: pos,
            billboard: {
              image: createTrainSvg(trainColor),
              rotation: rot,
              alignedAxis: Cesium.Cartesian3.ZERO,
              width: 22,
              height: 22,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: `${t.trainNo} ${t.name}`,
              font: 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.40,
              fillColor: Cesium.Color.WHITE,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -18),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 750000),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
          });

          ent.customData = {
            id: t.id,
            trainNo: t.trainNo,
            isTrain: true,
            callsign: `${t.trainNo} ${t.name}`,
            name: t.name,
            operator: t.operator,
            route: t.route,
            speedKmh: t.speedKmh,
            altitudeFt: 0,
            heading: t.heading,
            lat: t.lat,
            lon: t.lon
          };

          this.trainEntities.set(t.id, ent);
        }
      });

      const stat = document.getElementById('stat-trains');
      if (stat) stat.innerText = this.trainEntities.size;
    } catch (e) {
      console.warn('Train poll error:', e);
    }
  }

  // 4. Indian Metropolitan CCTV Grid with 3D Viewing Frustums
  async loadCctvNetwork() {
    try {
      const res = await fetch('/api/cctv/india');
      const data = await res.json();
      if (!data || !data.cameras) return;

      this.cctvEntities.forEach(e => this.viewer.entities.remove(e));
      this.cctvFrustumEntities.forEach(e => this.viewer.entities.remove(e));
      this.cctvEntities = [];
      this.cctvFrustumEntities = [];
      const isVisible = Boolean(this.activeLayers.cctv);

      data.cameras.forEach(cam => {
        const pos = Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, cam.elevationM || 20);

        const camEnt = this.viewer.entities.add({
          name: `[CAM] ${cam.name}`,
          show: isVisible,
          position: pos,
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#00FF88'),
            outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000)
          },
          label: {
            text: `[CAM] ${cam.name}`,
            font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
            scale: 0.38,
            fillColor: Cesium.Color.fromCssColorString('#00FF88'),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 3,
            outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString('rgba(15, 12, 12, 0.90)'),
            pixelOffset: new Cesium.Cartesian2(0, -16),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000)
          }
        });

        camEnt.customData = {
          isCctv: true,
          callsign: cam.name,
          operator: `${cam.city} Municipal Surveillance Grid`,
          route: `Azimuth ${cam.headingDeg}° | FOV ${cam.fovDeg}° | Range ${cam.rangeM}m`,
          altitudeFt: Math.round((cam.elevationM || 20) * 3.28),
          speedKnots: 0,
          heading: cam.headingDeg,
          lat: cam.lat,
          lon: cam.lon,
          cctvMeta: cam
        };

        this.cctvEntities.push(camEnt);

        // 3D Viewing Frustum
        const frustum = this.createCctvFrustum(cam);
        if (frustum) {
          frustum.show = isVisible;
          this.cctvFrustumEntities.push(frustum);
        }
      });

      const stat = document.getElementById('stat-cctv');
      if (stat) stat.innerText = this.cctvEntities.length;
    } catch (e) {
      console.warn('Could not load CCTV network:', e);
    }
  }

  createCctvFrustum(cam) {
    try {
      const startPos = Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, cam.elevationM || 20);
      const range = cam.rangeM || 600;
      const halfFovRad = Cesium.Math.toRadians((cam.fovDeg || 70) / 2);
      const headingRad = Cesium.Math.toRadians(cam.headingDeg || 0);

      const endPositions = [];
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        const curAngle = headingRad - halfFovRad + ((2 * halfFovRad * i) / steps);
        const dLat = (Math.cos(curAngle) * range) / 111000;
        const dLon = (Math.sin(curAngle) * range) / (111000 * Math.cos(Cesium.Math.toRadians(cam.lat)));
        endPositions.push(Cesium.Cartesian3.fromDegrees(cam.lon + dLon, cam.lat + dLat, 5));
      }

      const wireframePositions = [startPos, endPositions[0]];
      for (let i = 0; i < endPositions.length; i++) {
        wireframePositions.push(endPositions[i]);
      }
      wireframePositions.push(startPos);
      wireframePositions.push(endPositions[Math.floor(steps / 2)]);

      return this.viewer.entities.add({
        show: Boolean(this.activeLayers.cctv),
        polyline: {
          positions: wireframePositions,
          width: 1.5,
          material: Cesium.Color.fromCssColorString('#00FF88').withAlpha(0.45)
        }
      });
    } catch (e) {
      return null;
    }
  }

  // 5. Strategic Air Defense Sectors & Air Force Stations
  async loadAirDefenseSectors() {
    try {
      const res = await fetch('/api/defense/sectors');
      const data = await res.json();
      if (!data) return;

      this.defenseEntities.forEach(e => this.viewer.entities.remove(e));
      this.defenseEntities = [];
      const isVisible = Boolean(this.activeLayers.defense);

      // Command Sectors
      if (data.sectors) {
        data.sectors.forEach(sec => {
          const flatCoords = [];
          sec.coords.forEach(pt => flatCoords.push(pt[1], pt[0]));

          const ent = this.viewer.entities.add({
            name: sec.name,
            show: isVisible,
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
              material: Cesium.Color.fromCssColorString(sec.color).withAlpha(0.12),
              outline: true,
              outlineColor: Cesium.Color.fromCssColorString(sec.color).withAlpha(0.85),
              outlineWidth: 2,
              classificationType: Cesium.ClassificationType.BOTH
            }
          });
          this.defenseEntities.push(ent);
        });
      }

      // Air Force Stations
      if (data.airbases) {
        data.airbases.forEach(base => {
          const pos = Cesium.Cartesian3.fromDegrees(base.lon, base.lat, 100);
          const ent = this.viewer.entities.add({
            name: base.name,
            show: isVisible,
            position: pos,
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString('#D45B3E'),
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
              text: `${base.code} ${base.name}`,
              font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.38,
              fillColor: Cesium.Color.fromCssColorString('#D45B3E'),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -16),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
            }
          });

          ent.customData = {
            callsign: base.name,
            operator: `Indian Air Force (${base.command})`,
            route: `Squadrons: ${base.squadron}`,
            altitudeFt: Math.round(base.elevationM * 3.28),
            speedKnots: 0,
            heading: 0,
            lat: base.lat,
            lon: base.lon
          };

          this.defenseEntities.push(ent);
        });
      }
    } catch (e) {
      console.warn('Could not load defense sectors:', e);
    }
  }

  // 6. Indian Railways Network
  async loadRailways() {
    try {
      const res = await fetch('/api/railways/network');
      const data = await res.json();
      if (!data) return;

      this.railwayEntities.forEach(e => this.viewer.entities.remove(e));
      this.railwayEntities = [];
      const isVisible = Boolean(this.activeLayers.railways);

      if (data.corridors) {
        data.corridors.forEach(corr => {
          const flat = [];
          corr.points.forEach(pt => flat.push(pt[1], pt[0], 20));

          const ent = this.viewer.entities.add({
            name: corr.name,
            show: isVisible,
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(flat),
              width: 3.0,
              material: Cesium.Color.fromCssColorString(corr.color).withAlpha(0.75),
              clampToGround: true
            }
          });
          this.railwayEntities.push(ent);
        });
      }

      if (data.junctions) {
        data.junctions.forEach(j => {
          const ent = this.viewer.entities.add({
            name: j.name,
            show: isVisible,
            position: Cesium.Cartesian3.fromDegrees(j.lon, j.lat, 40),
            point: {
              pixelSize: 6,
              color: Cesium.Color.fromCssColorString('#6864F6'),
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: `[STN] ${j.code} ${j.city}`,
              font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.36,
              fillColor: Cesium.Color.fromCssColorString('#F3EFEF'),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -14),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1500000)
            }
          });

          ent.customData = {
            callsign: `${j.code} ${j.name}`,
            operator: 'Indian Railways Trunk Junction',
            route: `Platforms: ${j.platforms} | Daily Trains: ${j.dailyTrains}`,
            altitudeFt: 0,
            speedKnots: 0,
            heading: 0,
            lat: j.lat,
            lon: j.lon
          };

          this.railwayEntities.push(ent);
        });
      }
    } catch (e) {
      console.warn('Could not load railways:', e);
    }
  }

  // 7. ISRO Launch Centres & Orbital Missions
  async loadIsroMissions() {
    try {
      const res = await fetch('/api/isro/missions');
      const data = await res.json();
      if (!data) return;

      this.isroEntities.forEach(e => this.viewer.entities.remove(e));
      this.isroEntities = [];
      const isVisible = Boolean(this.activeLayers.isro);

      if (data.launchCentres) {
        data.launchCentres.forEach(c => {
          const ent = this.viewer.entities.add({
            name: c.name,
            show: isVisible,
            position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat, 100),
            point: {
              pixelSize: 10,
              color: Cesium.Color.fromCssColorString('#00F2FE'),
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
              text: `🚀 ${c.name}`,
              font: 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.40,
              fillColor: Cesium.Color.fromCssColorString('#00F2FE'),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -18),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1500000)
            }
          });

          ent.customData = {
            callsign: c.name,
            operator: 'Indian Space Research Organisation (ISRO)',
            route: `Pads: ${c.pads.join(', ')}`,
            altitudeFt: 0,
            speedKnots: 0,
            heading: 0,
            lat: c.lat,
            lon: c.lon
          };

          this.isroEntities.push(ent);
        });
      }

      if (data.missions) {
        data.missions.forEach(m => {
          // Add 3D orbital polyline
          if (m.orbitPath && m.orbitPath.length > 0) {
            const flat = [];
            const altM = m.orbitAltKm ? Math.min(m.orbitAltKm * 1000, 2000000) : 550000;
            m.orbitPath.forEach(pt => flat.push(pt[1], pt[0], altM));

            const orbitEnt = this.viewer.entities.add({
              name: `${m.name} Orbit Path`,
              show: isVisible,
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(flat),
                width: 1.8,
                arcType: Cesium.ArcType.GEODESIC,
                material: new Cesium.PolylineGlowMaterialProperty({
                  glowPower: 0.3,
                  color: Cesium.Color.fromCssColorString('#00F2FE').withAlpha(0.7)
                })
              }
            });
            this.isroEntities.push(orbitEnt);
          }

          // Add 3D ISRO Satellite Entity in Space
          const pos = m.currentPos || { lat: 21.0, lon: 78.0, altMeters: 550000 };
          const satAltM = Math.min(pos.altMeters || (m.orbitAltKm * 1000), 2500000);
          const satEntity = this.viewer.entities.add({
            name: m.name,
            show: isVisible,
            position: Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, satAltM),
            point: {
              pixelSize: 10,
              color: Cesium.Color.fromCssColorString('#00F2FE'),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: `🛰️ ${m.name}`,
              font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.40,
              fillColor: Cesium.Color.fromCssColorString('#00F2FE'),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(11, 18, 32, 0.92)'),
              pixelOffset: new Cesium.Cartesian2(0, -18),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 25000000)
            }
          });

          satEntity.customData = {
            callsign: m.name,
            operator: 'Indian Space Research Organisation (ISRO)',
            route: `${m.trajectoryType || 'Low Earth Orbit'} | Velocity: ${m.velocityKms || 7.5} km/s`,
            altitudeFt: Math.round(satAltM * 3.28084),
            speedKnots: Math.round((m.velocityKms || 7.5) * 1943.84),
            heading: Math.round(m.inclinationDeg || 90),
            lat: pos.lat,
            lon: pos.lon,
            isSatellite: true
          };

          this.isroEntities.push(satEntity);
        });
      }
    } catch (e) {
      console.warn('Could not load ISRO data:', e);
    }
  }

  // 8. Environmental Sensors (AQI, NASA Fires)
  async loadEnvironmental() {
    try {
      const res = await fetch('/api/environmental/india');
      const data = await res.json();
      if (!data) return;

      this.envEntities.forEach(e => this.viewer.entities.remove(e));
      this.envEntities = [];
      const isVisible = Boolean(this.activeLayers.environmental);

      if (data.aqi) {
        data.aqi.forEach(a => {
          const ent = this.viewer.entities.add({
            name: `AQI: ${a.city}`,
            show: isVisible,
            position: Cesium.Cartesian3.fromDegrees(a.lon, a.lat, 80),
            point: {
              pixelSize: 7,
              color: Cesium.Color.fromCssColorString(a.color),
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
              text: `AQI ${a.aqi} [${a.city}]`,
              font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.36,
              fillColor: Cesium.Color.fromCssColorString(a.color),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -14),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
            }
          });

          ent.customData = {
            callsign: `Air Quality: ${a.city}`,
            operator: 'Central Pollution Control Board (CPCB)',
            route: `AQI Index: ${a.aqi} (${a.status})`,
            altitudeFt: 0,
            speedKnots: 0,
            heading: 0,
            lat: a.lat,
            lon: a.lon
          };

          this.envEntities.push(ent);
        });
      }

      if (data.fires) {
        data.fires.forEach(f => {
          const ent = this.viewer.entities.add({
            name: f.region,
            show: isVisible,
            position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 80),
            point: {
              pixelSize: 8,
              color: Cesium.Color.fromCssColorString('#D45B3E'),
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            label: {
              text: `🔥 ${f.region}`,
              font: 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
              scale: 0.36,
              fillColor: Cesium.Color.fromCssColorString('#D45B3E'),
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 3,
              outlineColor: Cesium.Color.fromCssColorString('#0B0909'),
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(27, 21, 21, 0.88)'),
              pixelOffset: new Cesium.Cartesian2(0, -14),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000)
            }
          });

          ent.customData = {
            callsign: f.region,
            operator: 'NASA FIRMS Thermal Hotspot Sensor',
            route: `Brightness: ${f.brightnessK}K | Confidence: ${f.confidence}`,
            altitudeFt: 0,
            speedKnots: 0,
            heading: 0,
            lat: f.lat,
            lon: f.lon
          };

          this.envEntities.push(ent);
        });
      }
    } catch (e) {
      console.warn('Could not load environmental status:', e);
    }
  }

  // 9. TomTom Live Traffic Flow Layer
  async initTrafficLayer() {
    try {
      const res = await fetch('/api/traffic/flow');
      const data = await res.json();
      if (data.tileUrl) {
        const prov = new Cesium.UrlTemplateImageryProvider({
          url: data.tileUrl
        });
        this.trafficLayer = this.viewer.imageryLayers.addImageryProvider(prov);
        this.trafficLayer.show = this.activeLayers.traffic;
      }
    } catch (e) {
      console.warn('Could not load TomTom traffic layer:', e);
    }
  }

  // Layer Toggles
  initLayerToggles() {
    const chips = document.querySelectorAll('.layer-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        tacticalAudio.playLayerToggle();
        const layer = chip.dataset.layer;
        const isActive = !chip.classList.contains('active');
        chip.classList.toggle('active', isActive);
        this.activeLayers[layer] = isActive;

        if (layer === 'flights') {
          this.flightEntities.forEach(e => e.show = isActive);
          this.flightTrailEntities.forEach(e => e.show = isActive);
        } else if (layer === 'maritime') {
          this.marineEntities.forEach(e => e.show = isActive);
        } else if (layer === 'railways') {
          this.railwayEntities.forEach(e => e.show = isActive);
          this.trainEntities.forEach(e => e.show = isActive);
          if (this.railwayTrackLayer) this.railwayTrackLayer.show = isActive;
        } else if (layer === 'cctv') {
          this.cctvEntities.forEach(e => e.show = isActive);
          this.cctvFrustumEntities.forEach(e => e.show = isActive);
        } else if (layer === 'isro') {
          this.isroEntities.forEach(e => e.show = isActive);
        } else if (layer === 'defense') {
          this.defenseEntities.forEach(e => e.show = isActive);
        } else if (layer === 'environmental') {
          this.envEntities.forEach(e => e.show = isActive);
        } else if (layer === 'traffic' && this.trafficLayer) {
          this.trafficLayer.show = isActive;
        }

        const activeCount = Object.values(this.activeLayers).filter(Boolean).length;
        const countLabel = document.getElementById('active-layers-label');
        if (countLabel) countLabel.innerText = `${activeCount} ACTIVE`;
      });
    });
  }

  // Quick Sector Jumps
  initSectorButtons() {
    const btns = document.querySelectorAll('.sector-btn[data-lat]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        tacticalAudio.playClick();
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        const height = parseFloat(btn.dataset.height);

        this.exitCockpitMode();
        this.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
          orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(height > 1000000 ? -80 : -50),
            roll: 0
          },
          duration: 1.8
        });
      });
    });
  }

  // Target Telemetry Inspector & Frame-by-Frame Chase Tracking
  initTelemetryInspector() {
    const cockpitBtn = document.getElementById('cockpit-btn');
    const trackLockBtn = document.getElementById('track-lock-btn');

    if (trackLockBtn) {
      trackLockBtn.addEventListener('click', () => {
        tacticalAudio.playTargetLock();
        if (this.isCameraLocked) {
          this.viewer.trackedEntity = undefined;
          this.isCameraLocked = false;
          trackLockBtn.innerText = 'LOCK CAMERA';
          trackLockBtn.classList.remove('active');
          return;
        }

        if (!this.selectedEntity) {
          for (const ent of this.flightEntities.values()) {
            if (ent.customData) {
              this.selectTarget(ent.customData);
              break;
            }
          }
        }

        if (this.selectedEntity) {
          let cesiumEntity = null;
          if (this.selectedEntity.icao24 && this.flightEntities.has(this.selectedEntity.icao24)) {
            cesiumEntity = this.flightEntities.get(this.selectedEntity.icao24);
          } else if (this.selectedEntity.id && this.trainEntities.has(this.selectedEntity.id)) {
            cesiumEntity = this.trainEntities.get(this.selectedEntity.id);
          }

          if (cesiumEntity) {
            this.viewer.trackedEntity = cesiumEntity;
            this.isCameraLocked = true;
            trackLockBtn.innerText = 'UNLOCK CAM';
            trackLockBtn.classList.add('active');
          } else {
            this.viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                this.selectedEntity.lon, 
                this.selectedEntity.lat, 
                Math.max((this.selectedEntity.altitudeFt || 0) * 0.3048 + 3000, 2500)
              ),
              duration: 1.0
            });
          }
        }
      });
    }

    if (cockpitBtn) {
      cockpitBtn.addEventListener('click', () => {
        if (this.isCockpitActive) {
          this.exitCockpitMode();
        } else {
          this.enterCockpitMode();
        }
      });
    }
  }

  getAssetReconImage(data) {
    if (!data) return null;

    // 1. Maritime Vessels & Naval Ships (Strict check first to prevent ships matching callsign)
    if (data.mmsi || data.vesselType || data.type === 'maritime' || data.isShip || (data.name && (data.name.startsWith('INS') || data.name.startsWith('ICGS') || data.name.startsWith('MV')))) {
      if (data.isMilitary || (data.name && (data.name.startsWith('INS') || data.name.startsWith('ICGS')))) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/INS_Vikrant_sea_trials_2021.jpg/960px-INS_Vikrant_sea_trials_2021.jpg',
          model: `Indian Navy / Coast Guard ${data.name || 'Patrol Vessel'}`,
          status: 'WESTERN / EASTERN NAVAL PATROL',
          searchQuery: data.name ? `${data.name} warship` : 'Indian Navy warship',
          reconType: 'ship_naval'
        };
      }
      return {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg/960px-MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg',
        model: `${data.vesselType || 'Commercial Vessel'} (${data.name || 'Cargo'})`,
        status: 'INDIAN EEZ MARITIME COMMERCE',
        searchQuery: data.vesselType ? `${data.vesselType} ship` : 'Container ship',
        reconType: 'ship_cargo'
      };
    }

    // 2. Indian Railways Trains
    if (data.trainNo || data.isTrain || data.type === 'train') {
      const name = (data.name || '').toUpperCase();
      if (name.includes('VANDE BHARAT')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vande_Bharat_Express_around_Mumbai.jpg/960px-Vande_Bharat_Express_around_Mumbai.jpg',
          model: 'Vande Bharat Semi-High Speed EMU (Train 18)',
          status: 'EXPRESS CORRIDOR ACTIVE',
          searchQuery: 'Vande Bharat Express',
          reconType: 'train_vb'
        };
      }
      if (name.includes('RAJDHANI') || name.includes('SHATABDI') || name.includes('SHAN-E-BHOPAL') || name.includes('EXPRESS') || name.includes('SUPERFAST')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/BZA_WAP7.jpg/960px-BZA_WAP7.jpg',
          model: `Indian Railways WAP-7 / ${data.name || 'Superfast Express'}`,
          status: 'SUPERFAST TRUNK LINE',
          searchQuery: 'Indian locomotive class WAP-7',
          reconType: 'train_express'
        };
      }
      if (name.includes('DFC') || name.includes('FREIGHT')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/WAG12B_Locomotive_60027_at_Kanpur.jpg/960px-WAG12B_Locomotive_60027_at_Kanpur.jpg',
          model: 'WAG-12B 12000 HP Heavy Freight Electric',
          status: 'DEDICATED FREIGHT CORRIDOR',
          searchQuery: 'Indian locomotive class WAG-12',
          reconType: 'train_freight'
        };
      }
      return {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/BZA_WAP7.jpg/960px-BZA_WAP7.jpg',
        model: `Indian Railways ${data.name || (data.trainNo ? `Train ${data.trainNo}` : 'Active Fleet')}`,
        status: 'INDIAN RAILWAYS ACTIVE FLEET',
        searchQuery: data.trainNo ? `Train ${data.trainNo} India` : 'Indian Railways WAP-7 locomotive',
        reconType: 'train_express'
      };
    }

    // 3. ISRO Satellites
    if (data.isSatellite || (data.operator && data.operator.includes('ISRO'))) {
      return {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Chandrayaan-3_spacecraft_model.jpg/960px-Chandrayaan-3_spacecraft_model.jpg',
        model: data.callsign || 'ISRO Satellite',
        status: 'ORBITAL TELEMETRY ACTIVE',
        searchQuery: `${data.callsign || 'ISRO'} satellite`,
        reconType: 'isro_satellite'
      };
    }

    // 4. Flights (Civilian & IAF Military)
    if (data.icao24 || data.type === 'flight' || data.type === 'military' || (data.altitudeFt && data.altitudeFt > 500)) {
      const cs = (data.callsign || '').toUpperCase();
      const op = (data.operator || '').toUpperCase();
      if (data.type === 'military' || cs.startsWith('IAF') || cs.startsWith('NETRA') || cs.startsWith('TUSKER')) {
        if (cs.includes('RAF') || cs.includes('ARROW') || op.includes('RAFALE')) {
          return {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Rafale_-_RIAT_2009_%283751416421%29.jpg/960px-Rafale_-_RIAT_2009_%283751416421%29.jpg',
            model: 'Dassault Rafale EH/DH (IAF No. 17 Golden Arrows)',
            status: 'DEFENSE COMBAT AIR PATROL',
            searchQuery: 'Dassault Rafale Indian Air Force',
            reconType: 'military_fighter'
          };
        }
        if (cs.includes('C17') || cs.includes('TUSKER')) {
          return {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Boeing_C-17_Globemaster_III_at_Aero_India_2013_%288470984805%29.jpg/960px-Boeing_C-17_Globemaster_III_at_Aero_India_2013_%288470984805%29.jpg',
            model: 'Boeing C-17 Globemaster III (IAF Western Air Command)',
            status: 'STRATEGIC HEAVY AIRLIFT',
            searchQuery: 'Boeing C-17 Globemaster III Indian Air Force',
            reconType: 'military_heavy'
          };
        }
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Indian_Air_Force_Sukhoi_Su-30MKI.jpg/960px-Indian_Air_Force_Sukhoi_Su-30MKI.jpg',
          model: 'Sukhoi Su-30MKI Flanker-H (IAF Air Superiority)',
          status: 'IAF TACTICAL SORTIE',
          searchQuery: 'Sukhoi Su-30MKI Indian Air Force',
          reconType: 'military_fighter'
        };
      }
      if (op.includes('INDIGO') || cs.startsWith('IGO')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/IndiGo_A320neo_%28VT-ITC%29.jpg/960px-IndiGo_A320neo_%28VT-ITC%29.jpg',
          model: 'Airbus A321neo / A320neo (IndiGo Fleet)',
          status: 'COMMERCIAL PASSENGER TRANSIT',
          searchQuery: 'IndiGo Airbus A320neo',
          reconType: 'commercial_flight'
        };
      }
      if (op.includes('AIR INDIA') || cs.startsWith('AIC')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Air_India%2C_Boeing_777-300ER%2C_VT-ALX%2C_LHR.jpg/960px-Air_India%2C_Boeing_777-300ER%2C_VT-ALX%2C_LHR.jpg',
          model: 'Boeing 777-300ER / 787-8 (Air India Long-Haul)',
          status: 'COMMERCIAL LONG-HAUL',
          searchQuery: 'Air India Boeing 777',
          reconType: 'commercial_flight'
        };
      }
      if (op.includes('SPICE') || cs.startsWith('SEJ')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/SpiceJet_Boeing_737-800_VT-SGO.jpg/960px-SpiceJet_Boeing_737-800_VT-SGO.jpg',
          model: 'Boeing 737-800 (SpiceJet Fleet)',
          status: 'COMMERCIAL PASSENGER TRANSIT',
          searchQuery: 'SpiceJet Boeing 737',
          reconType: 'commercial_flight'
        };
      }
      if (op.includes('AKASA') || cs.startsWith('AKJ')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Akasa_Air_Boeing_737_MAX_8_%28VT-YAA%29.jpg/960px-Akasa_Air_Boeing_737_MAX_8_%28VT-YAA%29.jpg',
          model: 'Boeing 737 MAX 8 (Akasa Air Fleet)',
          status: 'COMMERCIAL PASSENGER TRANSIT',
          searchQuery: 'Akasa Air Boeing 737',
          reconType: 'commercial_flight'
        };
      }
      if (op.includes('VISTARA') || cs.startsWith('VTI')) {
        return {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vistara_A320neo_VT-TNC.jpg/960px-Vistara_A320neo_VT-TNC.jpg',
          model: 'Airbus A320neo (Vistara Fleet)',
          status: 'COMMERCIAL PASSENGER TRANSIT',
          searchQuery: 'Vistara Airbus A320',
          reconType: 'commercial_flight'
        };
      }
      return {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/IndiGo_A320neo_%28VT-ITC%29.jpg/960px-IndiGo_A320neo_%28VT-ITC%29.jpg',
        model: `${data.operator || 'Commercial Jet'} (${data.callsign || 'Flight'})`,
        status: 'AIRSPACE COMMERCIAL VECTOR',
        searchQuery: `${data.operator || 'Airbus A320'} aircraft`,
        reconType: 'commercial_flight'
      };
    }

    return null;
  }

  selectTarget(data) {
    tacticalAudio.playTargetLock();
    this.selectedEntity = data;

    const callsignEl = document.getElementById('t-callsign');
    const operatorEl = document.getElementById('t-operator');
    const routeEl = document.getElementById('t-route');
    const altEl = document.getElementById('t-alt');
    const speedEl = document.getElementById('t-speed');
    const headingEl = document.getElementById('t-heading');
    const statusEl = document.getElementById('target-status');

    if (callsignEl) callsignEl.innerText = data.callsign || data.name || (data.trainNo ? `Train ${data.trainNo}` : 'UNKNOWN');
    if (operatorEl) operatorEl.innerText = data.operator || '—';
    if (routeEl) routeEl.innerText = data.route || '—';
    if (altEl) altEl.innerText = (data.altitudeFt || 0).toLocaleString() + ' FT';
    if (speedEl) speedEl.innerText = (data.speedKmh ? `${data.speedKmh} KM/H` : data.speedKnots ? `${data.speedKnots} KTS` : '0');
    if (headingEl) headingEl.innerText = (data.heading || 0) + '°';
    if (statusEl) {
      statusEl.innerText = 'LOCKED';
      statusEl.style.color = 'var(--status-green)';
    }

    // Populate Asset Recon Visual Photo Card with authentic imagery
    const photoBox = document.getElementById('asset-preview-card');
    const photoImg = document.getElementById('asset-photo-img');
    const photoPlaceholder = document.getElementById('asset-photo-placeholder');
    const photoTag = document.getElementById('asset-model-tag');
    const photoPill = document.getElementById('asset-status-pill');
    const shimmerEl = document.getElementById('asset-shimmer-loader');
    const recon = this.getAssetReconImage(data);

    if (recon && photoBox) {
      photoBox.style.display = 'block';
      if (photoTag) photoTag.innerText = recon.model;
      if (photoPill) photoPill.innerText = `● ${recon.status}`;

      if (recon.url) {
        if (photoImg) {
          photoImg.src = recon.url;
          photoImg.style.display = 'block';
        }
        if (photoPlaceholder) photoPlaceholder.style.display = 'none';
      } else {
        if (photoImg) photoImg.style.display = 'none';
        if (photoPlaceholder) photoPlaceholder.style.display = 'block';
      }

      // Asynchronously fetch live Wikipedia / Wikimedia Commons photo with loading shimmer
      if (recon.searchQuery) {
        if (shimmerEl) shimmerEl.style.display = 'flex';
        fetch(`/api/media/recon?query=${encodeURIComponent(recon.searchQuery)}&type=${recon.reconType || 'general'}`)
          .then(r => r.json())
          .then(imgData => {
            if (shimmerEl) shimmerEl.style.display = 'none';
            if (this.selectedEntity === data) {
              if (imgData && imgData.url && !imgData.notFound) {
                if (photoImg) {
                  photoImg.src = imgData.url;
                  photoImg.style.display = 'block';
                }
                if (photoPlaceholder) photoPlaceholder.style.display = 'none';
              } else if (!recon.url) {
                if (photoImg) photoImg.style.display = 'none';
                if (photoPlaceholder) photoPlaceholder.style.display = 'block';
              }
            }
          })
          .catch(() => {
            if (shimmerEl) shimmerEl.style.display = 'none';
            if (this.selectedEntity === data && !recon.url) {
              if (photoImg) photoImg.style.display = 'none';
              if (photoPlaceholder) photoPlaceholder.style.display = 'block';
            }
          });
      }
    } else if (photoBox) {
      photoBox.style.display = 'none';
    }

    if (data.isCctv && data.cctvMeta) {
      this.openCctvCard(data.cctvMeta);
    }
  }

  // True Frame-by-Frame 3D Cockpit & Chase Mode
  enterCockpitMode(targetHint = null) {
    // If a train was requested (e.g. Vande Bharat, express, or train number), search trainEntities first
    if (targetHint && (targetHint.targetType === 'train' || targetHint.trainNo || targetHint.isTrain)) {
      let matchedTrain = null;
      for (const [id, ent] of this.trainEntities) {
        if (ent.customData) {
          if (targetHint.trainNo && (ent.customData.trainNo === targetHint.trainNo || (ent.customData.name && ent.customData.name.includes(targetHint.trainNo)))) {
            matchedTrain = ent.customData;
            break;
          }
          if (targetHint.name && ent.customData.name && ent.customData.name.toLowerCase().includes(targetHint.name.toLowerCase())) {
            matchedTrain = ent.customData;
            break;
          }
        }
      }
      if (!matchedTrain) {
        // Fallback to first active train in network
        for (const ent of this.trainEntities.values()) {
          if (ent.customData) { matchedTrain = ent.customData; break; }
        }
      }
      if (matchedTrain) {
        this.selectTarget(matchedTrain);
      }
    }

    if (!this.selectedEntity) {
      for (const ent of this.flightEntities.values()) {
        if (ent.customData) {
          this.selectTarget(ent.customData);
          break;
        }
      }
    }
    if (!this.selectedEntity) {
      this.speak('No active aircraft or train available for chase mode.');
      return;
    }

    this.isCockpitActive = true;
    tacticalAudio.playTargetLock();

    // Disable mouse inputs during cockpit chase mode to prevent matrix NaN and deep space glitch
    if (this.viewer?.scene?.screenSpaceCameraController) {
      this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    }

    const cockpitBtn = document.getElementById('cockpit-btn');
    if (cockpitBtn) {
      cockpitBtn.innerText = 'EXIT CHASE';
      cockpitBtn.classList.add('active');
    }

    const target = this.selectedEntity;
    const targetName = target.callsign || target.name || (target.trainNo ? `Train ${target.trainNo}` : 'TARGET');
    const isFlight = (target.altitudeFt || 0) > 200;

    const banner = document.getElementById('cockpit-banner');
    const hudName = document.getElementById('hud-target-name');
    const hudSpeed = document.getElementById('hud-speed');
    const hudAlt = document.getElementById('hud-alt');
    const hudHdg = document.getElementById('hud-heading');

    if (banner) banner.style.display = 'block';
    if (hudName) hudName.innerText = targetName;
    if (hudSpeed) hudSpeed.innerText = target.speedKmh || target.speedKnots || (isFlight ? 480 : 120);
    if (hudAlt) hudAlt.innerText = (target.altitudeFt || 0).toLocaleString();
    if (hudHdg) hudHdg.innerText = (target.heading || 0) + '°';

    if (this.cockpitRemoveListener) {
      this.cockpitRemoveListener();
      this.cockpitRemoveListener = null;
    }

    this.viewer.trackedEntity = undefined;

    // Use scene.preUpdate (NOT preRender) to update camera before culling and traversal
    this.cockpitRemoveListener = this.viewer.scene.preUpdate.addEventListener(() => {
      if (!this.isCockpitActive || !this.selectedEntity) return;

      const activeTarget = this.selectedEntity;
      let curLat = activeTarget.lat;
      let curLon = activeTarget.lon;
      let curAlt = (activeTarget.altitudeFt || 0) * 0.3048;
      let curHdg = activeTarget.heading || 0;

      if (activeTarget.icao24 && this.flightEntities.has(activeTarget.icao24)) {
        const ent = this.flightEntities.get(activeTarget.icao24);
        if (ent.customData) {
          curLat = ent.customData.lat;
          curLon = ent.customData.lon;
          curAlt = (ent.customData.altitudeFt || 0) * 0.3048;
          curHdg = ent.customData.heading || 0;
        }
      } else if (activeTarget.id && this.trainEntities.has(activeTarget.id)) {
        const ent = this.trainEntities.get(activeTarget.id);
        if (ent.customData) {
          curLat = ent.customData.lat;
          curLon = ent.customData.lon;
          curAlt = 20;
          curHdg = ent.customData.heading || 0;
        }
      }

      if (hudSpeed) hudSpeed.innerText = activeTarget.speedKmh || activeTarget.speedKnots || 0;
      if (hudAlt) hudAlt.innerText = Math.round(curAlt * 3.28084).toLocaleString();
      if (hudHdg) hudHdg.innerText = Math.round(curHdg) + '°';

      const headingRad = Cesium.Math.toRadians(curHdg);
      const offsetDist = curAlt > 200 ? 120 : 60;
      const offsetHeight = curAlt > 200 ? 30 : 18;

      const backAngle = headingRad + Math.PI;
      const camLat = curLat + (Math.cos(backAngle) * (offsetDist / 111000));
      const camLon = curLon + (Math.sin(backAngle) * (offsetDist / (111000 * Math.cos(Cesium.Math.toRadians(curLat)))));

      // Elevate camera above local ground level to prevent underground clipping
      let surfaceHeight = 0;
      if (this.viewer.scene.globe) {
        surfaceHeight = this.viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(camLon, camLat)) || 0;
      }
      if (surfaceHeight < 0) surfaceHeight = 0;
      const camAlt = Math.max(surfaceHeight + (curAlt > 200 ? offsetHeight : 45), curAlt + offsetHeight);

      this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(camLon, camLat, camAlt),
        orientation: {
          heading: headingRad,
          pitch: Cesium.Math.toRadians(-12),
          roll: 0
        }
      });
    });
  }

  exitCockpitMode() {
    this.isCockpitActive = false;
    // Re-enable screen space camera controller inputs
    if (this.viewer?.scene?.screenSpaceCameraController) {
      this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    }
    tacticalAudio.playClick();
    if (this.cockpitRemoveListener) {
      this.cockpitRemoveListener();
      this.cockpitRemoveListener = null;
    }
    const banner = document.getElementById('cockpit-banner');
    if (banner) banner.style.display = 'none';

    const cockpitBtn = document.getElementById('cockpit-btn');
    if (cockpitBtn) {
      cockpitBtn.innerText = 'CHASE / COCKPIT';
      cockpitBtn.classList.remove('active');
    }
  }

  // CCTV Inspection Panel
  initCctvInspector() {
    const card = document.getElementById('cctv-preview-card');
    const closeBtn = document.getElementById('cctv-close-btn');

    closeBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      if (card) card.style.display = 'none';
    });
  }

  generateTacticalCctvPlaceholder(cam) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');

      // Dark optical surveillance canvas background
      ctx.fillStyle = '#0f1211';
      ctx.fillRect(0, 0, 640, 360);

      // Grid scan lines
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < 360; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }
      for (let x = 0; x < 640; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 360);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(300, 180); ctx.lineTo(340, 180);
      ctx.moveTo(320, 160); ctx.lineTo(320, 200);
      ctx.stroke();
      ctx.strokeRect(290, 150, 60, 60);

      // Tactical overlays
      ctx.fillStyle = '#00FF88';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`CAM // ${cam.id ? cam.id.toUpperCase() : 'SURV-01'} [ENCRYPTED STREAM]`, 24, 34);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.fillText(`${cam.name || 'MUNICIPAL SENSOR GRID'}`, 24, 56);
      ctx.fillText(`SECTOR: ${cam.city || 'INDIA'} | AZIMUTH: ${cam.headingDeg || 0}° | FOV: ${cam.fovDeg || 72}°`, 24, 76);

      const nowStr = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + ' IST';
      ctx.fillStyle = '#D45B3E';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`● BUFFERED SENSOR FEED (DELAY: 04m 12s - PRIVACY PROTOCOL)`, 24, 320);

      ctx.fillStyle = '#888888';
      ctx.font = '11px monospace';
      ctx.fillText(`CAPTURE TIMESTAMP: ${nowStr}`, 24, 340);

      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      return '';
    }
  }

  openCctvCard(cam) {
    const card = document.getElementById('cctv-preview-card');
    if (!card) return;

    const nameEl = document.getElementById('cctv-name');
    const metaEl = document.getElementById('cctv-meta');
    const imgEl = document.getElementById('cctv-img');
    const descEl = document.getElementById('cctv-desc');

    if (nameEl) nameEl.innerText = cam.name;
    if (metaEl) metaEl.innerText = `${cam.city} · ${cam.headingDeg}° AZIMUTH · FOV ${cam.fovDeg}°`;
    if (descEl) descEl.innerText = cam.description;

    if (imgEl) {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = this.generateTacticalCctvPlaceholder(cam);
      };
      imgEl.src = cam.streamUrl || this.generateTacticalCctvPlaceholder(cam);
    }

    card.style.display = 'block';
  }

  // Omni-Search Bar with Category Tabs & Autocomplete
  initOmniSearch() {
    const input = document.getElementById('omni-search-input');
    const btn = document.getElementById('omni-search-btn');
    const suggestionsBox = document.getElementById('omni-suggestions');
    const tabBtns = document.querySelectorAll('.omni-search-tabs .search-tab');

    this.searchCategory = 'all';

    tabBtns.forEach(tBtn => {
      tBtn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tBtn.classList.add('active');
        this.searchCategory = tBtn.dataset.cat || 'all';
        fetchSuggestions(input ? input.value : '');
      });
    });

    let suggestDebounce = null;
    const fetchSuggestions = (query) => {
      const q = (query || '').trim();
      if (!suggestionsBox) return;
      if (q.length < 2) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
      }

      clearTimeout(suggestDebounce);
      suggestDebounce = setTimeout(async () => {
        try {
          const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}&category=${this.searchCategory}`);
          const data = await res.json();
          if (data && data.success && data.suggestions && data.suggestions.length > 0) {
            suggestionsBox.innerHTML = data.suggestions.map(s => `
              <div class="suggestion-item" data-type="${s.type}" data-lat="${s.lat}" data-lon="${s.lon}" data-train="${s.trainNo || ''}" data-flight="${s.callsign || ''}">
                <div class="suggestion-title">
                  <span>${s.title}</span>
                  <span class="suggestion-badge badge-${s.type}">${s.type}</span>
                </div>
                <div class="suggestion-subtitle">${s.subtitle}</div>
              </div>
            `).join('');
            suggestionsBox.style.display = 'flex';

            suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
              item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                const type = item.dataset.type;
                const trainNo = item.dataset.train;
                const flightCallsign = item.dataset.flight;

                suggestionsBox.style.display = 'none';
                tacticalAudio.playTargetLock();

                if (type === 'train' && trainNo) {
                  for (const ent of this.trainEntities.values()) {
                    if (ent.customData && ent.customData.trainNo === trainNo) {
                      this.selectTarget(ent.customData);
                      break;
                    }
                  }
                  this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2500),
                    duration: 1.5
                  });
                } else if (type === 'flight' && flightCallsign) {
                  for (const ent of this.flightEntities.values()) {
                    if (ent.customData && ent.customData.callsign === flightCallsign) {
                      this.selectTarget(ent.customData);
                      break;
                    }
                  }
                  this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 8000),
                    duration: 1.5
                  });
                } else {
                  this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 35000),
                    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-82), roll: 0 },
                    duration: 1.8
                  });
                  const titleStr = item.querySelector('.suggestion-title span')?.innerText || 'Target';
                  this.dropDestinationPin(lon, lat, titleStr);
                }
              });
            });
          } else {
            suggestionsBox.style.display = 'none';
            suggestionsBox.innerHTML = '';
          }
        } catch (e) {
          suggestionsBox.style.display = 'none';
        }
      }, 200);
    };

    input?.addEventListener('input', (e) => fetchSuggestions(e.target.value));

    // Hide suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#omni-search-wrapper') && suggestionsBox) {
        suggestionsBox.style.display = 'none';
      }
    });

    const executeSearch = async () => {
      const q = input?.value?.trim();
      if (!q) return;
      if (suggestionsBox) suggestionsBox.style.display = 'none';
      tacticalAudio.playClick();

      const upperQ = q.toUpperCase();
      const cleanDigits = q.replace(/\D/g, '');

      // 1. Train Number Search Check (Prioritize train matching before geocoding)
      for (const ent of this.trainEntities.values()) {
        if (ent.customData && (
          (cleanDigits.length >= 4 && ent.customData.trainNo === cleanDigits) ||
          ent.customData.callsign?.toLowerCase().includes(q.toLowerCase()) || 
          ent.customData.name?.toLowerCase().includes(q.toLowerCase())
        )) {
          this.selectTarget(ent.customData);
          this.speak(`Locating train ${ent.customData.trainNo || ent.customData.name}.`);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(ent.customData.lon, ent.customData.lat, 2500),
            orientation: { heading: Cesium.Math.toRadians(ent.customData.heading || 0), pitch: Cesium.Math.toRadians(-35), roll: 0 },
            duration: 1.5
          });
          return;
        }
      }

      // 2. Flight Search Check
      for (const ent of this.flightEntities.values()) {
        if (ent.customData && (ent.customData.callsign?.toUpperCase().includes(upperQ) || ent.customData.icao24?.toUpperCase() === upperQ)) {
          this.selectTarget(ent.customData);
          this.speak(`Locating flight ${ent.customData.callsign}.`);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(ent.customData.lon, ent.customData.lat, (ent.customData.altitudeFt * 0.3048) + 4000),
            duration: 1.5
          });
          return;
        }
      }

      // 3. CCTV Search Check
      for (const ent of this.cctvEntities) {
        if (ent.customData && ent.customData.callsign?.toLowerCase().includes(q.toLowerCase())) {
          this.selectTarget(ent.customData);
          this.speak(`Focusing on surveillance camera ${ent.customData.callsign}.`);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(ent.customData.lon, ent.customData.lat, 1200),
            orientation: { heading: Cesium.Math.toRadians(ent.customData.heading || 0), pitch: Cesium.Math.toRadians(-40), roll: 0 },
            duration: 1.5
          });
          return;
        }
      }

      // 4. Geocode Location / Address
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data.success && data.lat && data.lon) {
          if (data.isTrain && data.trainNo) {
            for (const ent of this.trainEntities.values()) {
              if (ent.customData && ent.customData.trainNo === data.trainNo) {
                this.selectTarget(ent.customData);
                break;
              }
            }
          }
          this.speak(`Targeting: ${data.name.split(',')[0]}.`);
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(data.lon, data.lat, data.isGlobal ? 80000 : 35000),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-82), roll: 0 },
            duration: 2.0
          });
          this.dropDestinationPin(data.lon, data.lat, data.name.split(',')[0]);
          return;
        }
      } catch (e) {
        console.warn('Geocode search error:', e);
      }

      this.speak(`Location or asset "${q}" not resolved.`);
    };

    btn?.addEventListener('click', executeSearch);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }

  // Integrated Street View Ground Recon Surveillance Drawer
  openStreetViewAt(lat, lon) {
    tacticalAudio.playClick();
    const dock = document.getElementById('street-view-dock');
    const iframe = document.getElementById('street-view-iframe');
    const coordsEl = document.getElementById('street-view-coords');
    const extLink = document.getElementById('street-view-ext-link');

    const svEmbedUrl = `https://maps.google.com/maps?q=${lat.toFixed(5)},${lon.toFixed(5)}&layer=c&cbll=${lat.toFixed(5)},${lon.toFixed(5)}&cbp=11,0,0,0,0&output=svembed`;
    const googleMapsUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(5)},${lon.toFixed(5)}`;

    if (coordsEl) coordsEl.innerText = `ROAD RECON: ${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`;
    if (extLink) extLink.href = googleMapsUrl;
    if (iframe) iframe.src = svEmbedUrl;
    if (dock) dock.style.display = 'block';

    // Highlight clicked location with a tactical pinpoint marker on 3D globe
    if (this.streetViewMarker) {
      this.viewer.entities.remove(this.streetViewMarker);
    }
    this.streetViewMarker = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 15),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#6864F6'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });

    this.speak(`Street view reconnaissance engaged at ${lat.toFixed(2)} north, ${lon.toFixed(2)} east.`);
  }

  // Integrated Street View Ground Recon Surveillance Drawer & One-Click Road Mode
  initStreetView() {
    const btn = document.getElementById('street-view-btn');
    const modeToggle = document.getElementById('street-view-mode-toggle');
    const dock = document.getElementById('street-view-dock');
    const closeBtn = document.getElementById('street-view-close');
    const iframe = document.getElementById('street-view-iframe');

    // Target telemetry panel button
    btn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      const carto = Cesium.Cartographic.fromCartesian(this.viewer.camera.positionWC);
      let lat = Cesium.Math.toDegrees(carto.latitude);
      let lon = Cesium.Math.toDegrees(carto.longitude);
      if (this.selectedEntity && this.selectedEntity.lat && this.selectedEntity.lon) {
        lat = this.selectedEntity.lat;
        lon = this.selectedEntity.lon;
      }
      this.openStreetViewAt(lat, lon);
    });

    // Interactive Road Click Mode toggle button
    modeToggle?.addEventListener('click', () => {
      tacticalAudio.playClick();
      this.isStreetViewPickMode = !this.isStreetViewPickMode;
      const label = document.getElementById('sv-btn-label');
      if (this.isStreetViewPickMode) {
        modeToggle.classList.add('active');
        document.body.classList.add('street-view-pick-mode');
        if (label) label.innerText = 'STREET VIEW: ON';
        this.speak('Street view road mode active. Click on any road on the 3D map.');
      } else {
        modeToggle.classList.remove('active');
        document.body.classList.remove('street-view-pick-mode');
        if (label) label.innerText = 'STREET VIEW: OFF';
      }
    });

    closeBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      if (dock) dock.style.display = 'none';
      if (iframe) iframe.src = '';
      if (this.streetViewMarker) {
        this.viewer.entities.remove(this.streetViewMarker);
        this.streetViewMarker = null;
      }
    });
  }

  // Clean HUD Toggle (Hide/Show UI)
  initHudToggle() {
    const eyeBtn = document.getElementById('btn-toggle-hud');
    eyeBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      document.body.classList.toggle('hud-hidden');
    });
  }

  // Tactical Vision Modes (Optical / NVG / FLIR / CRT)
  initVisionModes() {
    const btns = document.querySelectorAll('.vision-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        tacticalAudio.playLayerToggle();
        const mode = btn.dataset.vision;
        this.setVisionMode(mode);
      });
    });
  }

  setVisionMode(mode) {
    document.querySelectorAll('.vision-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.vision === mode);
    });
    document.body.classList.remove('vision-nvg', 'vision-flir', 'vision-crt');
    if (mode !== 'optical') {
      document.body.classList.add(`vision-${mode}`);
    }
  }

  // Live News Ticker
  initNewsTicker() {
    const newsEl = document.getElementById('news-text');
    const newsCard = document.getElementById('news-card');
    let headlines = [];
    let currentIndex = 0;

    const cycleHeadline = () => {
      if (headlines.length === 0 || !newsEl) return;
      const item = headlines[currentIndex % headlines.length];
      currentIndex++;
      newsEl.innerText = `[${(item.source || 'INTELLIGENCE').toUpperCase()}] ${item.title}`;
      if (newsCard) {
        newsCard.onclick = () => {
          const url = item.link || `https://news.google.com/search?q=${encodeURIComponent(item.title)}`;
          window.open(url, '_blank');
        };
      }
    };

    const updateNews = async () => {
      try {
        const res = await fetch('/api/news/live');
        const data = await res.json();
        const items = data.headlines || data.news || [];
        if (items.length > 0) {
          headlines = items;
          cycleHeadline();
        }
      } catch (e) {
        console.warn('News poll error:', e);
      }
    };

    updateNews();
    setInterval(cycleHeadline, 10000);
    setInterval(updateNews, 45000);
  }

  // State Radio Tuner via HLS.js
  initRadio() {
    const playBtn = document.getElementById('radio-play-btn');
    const radioSelect = document.getElementById('radio-select');
    const audioEl = document.getElementById('radio-audio');

    let isPlaying = false;

    playBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      if (isPlaying) {
        audioEl.pause();
        if (this.hls) {
          this.hls.destroy();
          this.hls = null;
        }
        playBtn.innerText = 'PLAY';
        isPlaying = false;
      } else {
        const url = radioSelect.value;
        if (url) {
          this.playRadioStream(url);
          playBtn.innerText = 'PAUSE';
          isPlaying = true;
        }
      }
    });

    radioSelect?.addEventListener('change', () => {
      if (isPlaying) {
        this.playRadioStream(radioSelect.value);
      }
    });

    this.updateRadioStations(28.6139, 77.2090);
  }

  playRadioStream(url) {
    const audioEl = document.getElementById('radio-audio');
    if (!audioEl) return;

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (url.includes('.m3u8') && window.Hls && Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(url);
      this.hls.attachMedia(audioEl);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audioEl.play().catch(e => console.warn('Radio autoplay prevented:', e));
      });
    } else {
      audioEl.src = url;
      audioEl.play().catch(e => console.warn('Radio autoplay prevented:', e));
    }
  }

  async updateRadioStations(lat, lon) {
    try {
      const res = await fetch(`/api/radio/state?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (!data || !data.stations) return;

      const badge = document.getElementById('current-state-badge');
      const select = document.getElementById('radio-select');

      if (badge && data.detectedState) {
        badge.innerText = data.detectedState.toUpperCase();
      }

      if (select) {
        select.innerHTML = '';
        data.stations.forEach((st, idx) => {
          const opt = document.createElement('option');
          opt.value = st.streamUrl;
          opt.innerText = `${st.name} (${st.freq})`;
          if (idx === 0) opt.selected = true;
          select.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('Radio update error:', e);
    }
  }

  setupCameraStateWatcher() {
    let lastTime = 0;
    this.viewer.camera.moveEnd.addEventListener(() => {
      const now = Date.now();
      if (now - lastTime < 2500) return;
      lastTime = now;

      // Ground intersection at screen center
      const windowPosition = new Cesium.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
      const groundPos = this.viewer.camera.pickEllipsoid(windowPosition);
      let lat, lon;
      if (groundPos) {
        const carto = Cesium.Cartographic.fromCartesian(groundPos);
        lat = Cesium.Math.toDegrees(carto.latitude);
        lon = Cesium.Math.toDegrees(carto.longitude);
      } else {
        const carto = Cesium.Cartographic.fromCartesian(this.viewer.camera.positionWC);
        lat = Cesium.Math.toDegrees(carto.latitude);
        lon = Cesium.Math.toDegrees(carto.longitude);
      }

      if (lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98) {
        this.updateRadioStations(lat, lon);
      }
    });
  }

  // Strictly Locked Microsoft Ravi (Indian English Male) Voice Synthesis
  initVoices() {
    const pickRaviVoice = () => {
      if (!('speechSynthesis' in window)) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // Strictly prioritize Microsoft Ravi (Indian English male)
      const ravi = allVoices.find(v => v.name.includes('Ravi'));
      const indianMale = allVoices.find(v => v.lang === 'en-IN' && !v.name.toLowerCase().includes('heera') && !v.name.toLowerCase().includes('female'));
      const fallbackMale = allVoices.find(v => v.name.includes('David') || v.name.includes('George') || v.name.toLowerCase().includes('male'));

      this.selectedMaleVoice = ravi || indianMale || fallbackMale || allVoices[0];
    };

    pickRaviVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = pickRaviVoice;
    }
  }

  speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    if (this.selectedMaleVoice) {
      utt.voice = this.selectedMaleVoice;
    }
    utt.rate = 1.05;
    utt.pitch = 0.95;
    window.speechSynthesis.speak(utt);
  }

  // Local Ollama (Qwen) AI Console with Audio Capture & Dynamic Waveform
  initAiConsole() {
    const input = document.getElementById('ai-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const micBtn = document.getElementById('ai-mic-btn');
    const responseBox = document.getElementById('ai-response-box');
    const listeningIndicator = document.getElementById('ai-listening-indicator');
    const waveBars = listeningIndicator ? listeningIndicator.querySelectorAll('.audio-wave span') : [];

    let audioContext = null;
    let audioStream = null;
    let analyserNode = null;
    let animFrameId = null;

    const stopAudioVisualizer = () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (audioStream) {
        audioStream.getTracks().forEach(t => t.stop());
        audioStream = null;
      }
      waveBars.forEach(b => { b.style.height = '4px'; });
    };

    const startAudioVisualizer = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        const source = audioContext.createMediaStreamSource(audioStream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 64;
        source.connect(analyserNode);

        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

        const updateWave = () => {
          if (!listeningIndicator || listeningIndicator.style.display === 'none') {
            stopAudioVisualizer();
            return;
          }
          analyserNode.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length / 255.0; // 0 to 1

          waveBars.forEach((bar, idx) => {
            const factor = Math.min(1, avg * (1.2 + (idx % 3) * 0.4));
            const h = Math.max(4, Math.round(factor * 18));
            bar.style.height = `${h}px`;
          });

          animFrameId = requestAnimationFrame(updateWave);
        };
        updateWave();
      } catch (err) {
        console.warn('Microphone audio capture warning:', err);
      }
    };

    const sendPrompt = async () => {
      const query = input.value.trim();
      if (!query) return;

      tacticalAudio.playClick();
      responseBox.innerText = 'Analyzing tactical directive...';
      input.value = '';

      // Capture screen-center ground position for situational awareness
      const windowPosition = new Cesium.Cartesian2(this.viewer.container.clientWidth / 2, this.viewer.container.clientHeight / 2);
      const groundPos = this.viewer.camera.pickEllipsoid(windowPosition);
      let camLat, camLon, camHeight;
      if (groundPos) {
        const carto = Cesium.Cartographic.fromCartesian(groundPos);
        camLat = Cesium.Math.toDegrees(carto.latitude);
        camLon = Cesium.Math.toDegrees(carto.longitude);
        camHeight = Cesium.Cartographic.fromCartesian(this.viewer.camera.positionWC).height;
      } else {
        const carto = Cesium.Cartographic.fromCartesian(this.viewer.camera.positionWC);
        camLat = Cesium.Math.toDegrees(carto.latitude);
        camLon = Cesium.Math.toDegrees(carto.longitude);
        camHeight = carto.height;
      }
      const camPayload = { lat: camLat, lon: camLon, height: camHeight };

      // Pass user-configured AI provider/key from localStorage
      const savedConfig = JSON.parse(localStorage.getItem('iisn_config') || '{}');
      const reqHeaders = { 'Content-Type': 'application/json' };
      if (savedConfig.aiProvider) reqHeaders['x-ai-provider'] = savedConfig.aiProvider;
      if (savedConfig.aiKey) reqHeaders['x-ai-key'] = savedConfig.aiKey;

      try {
        const res = await fetch('/api/ai/tactical', {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({ prompt: query, camera: camPayload })
        });
        const data = await res.json();

        tacticalAudio.playAiChirp();
        responseBox.innerText = data.text || data.speech;
        this.speak(data.speech || data.text);

        if (data.action) {
          if (data.action.type === 'flyTo') {
            this.exitCockpitMode();
            this.viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(data.action.lon, data.action.lat, data.action.altitude),
              orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(-82),
                roll: 0
              },
              duration: 2.2
            });
            this.dropDestinationPin(data.action.lon, data.action.lat, data.action.name);
          } else if (data.action.type === 'cockpit') {
            this.enterCockpitMode(data.action);
          } else if (data.action.type === 'exitCockpit') {
            this.exitCockpitMode();
          } else if (data.action.type === 'planRoute') {
            if (data.action.route) {
              this.displayTacticalRoute(data.action.route);
            }
          } else if (data.action.type === 'streetView') {
            if (data.action.lat && data.action.lon) {
              this.openStreetViewAt(data.action.lat, data.action.lon);
            } else {
              const svToggle = document.getElementById('street-view-mode-toggle');
              if (svToggle) svToggle.click();
            }
          } else if (data.action.type === 'setVisionMode') {
            this.setVisionMode(data.action.mode);
          } else if (data.action.type === 'toggleLayer') {
            const chip = document.querySelector(`.layer-chip[data-layer="${data.action.layer}"]`);
            chip?.click();
          }
        }
      } catch (e) {
        responseBox.innerText = 'Directive acknowledged by core engine.';
        this.speak('Directive acknowledged.');
      }
    };

    sendBtn?.addEventListener('click', sendPrompt);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendPrompt();
    });

    if (micBtn) {
      micBtn.style.display = 'flex';
      micBtn.style.visibility = 'visible';
    }

    const hasSpeech = ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    let recognition = null;
    let isListening = false;

    if (hasSpeech) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
    }

    const stopListening = () => {
      isListening = false;
      if (micBtn) {
        micBtn.classList.remove('recording');
        micBtn.style.color = 'var(--brand-violet)';
      }
      if (listeningIndicator) listeningIndicator.style.display = 'none';
      stopAudioVisualizer();
    };

    micBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();

      if (!hasSpeech || !recognition) {
        if (responseBox) {
          responseBox.innerText = 'Tactical Voice Notice: Launch via launch-iisn.bat (Standalone Desktop App mode) or Chrome/Edge to activate microphone speech input.';
        }
        this.speak('Tactical voice input requires desktop app mode or Edge browser with microphone permission.');
        return;
      }

      if (isListening) {
        recognition.stop();
        stopListening();
        return;
      }

      try {
        isListening = true;
        micBtn.classList.add('recording');
        micBtn.style.color = 'var(--status-red)';
        if (listeningIndicator) listeningIndicator.style.display = 'flex';
        startAudioVisualizer();
        recognition.start();
      } catch (err) {
        stopListening();
      }
    });

    if (recognition) {
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        if (input) input.value = speechResult;
        stopListening();
        sendPrompt();
      };

      recognition.onerror = () => stopListening();
      recognition.onend = () => stopListening();
    }
  }

  // Camera Telemetry HUD Cluster: Altitude Gauge & Rotating Mini Compass Rose
  initCameraTelemetry() {
    const compassDial = document.getElementById('compass-dial');
    const headingVal = document.getElementById('hud-heading-val');
    const altMVal = document.getElementById('hud-alt-m');
    const altFtVal = document.getElementById('hud-alt-ft');
    const regimeBadge = document.getElementById('hud-regime-badge');
    const pitchVal = document.getElementById('hud-pitch-val');
    const coordsVal = document.getElementById('hud-coords-val');
    const compassInst = document.getElementById('compass-instrument');

    // Click compass to smoothly reset heading to True North (000°)
    compassInst?.addEventListener('click', () => {
      tacticalAudio.playClick();
      const curPos = this.viewer.camera.positionWC;
      this.viewer.camera.flyTo({
        destination: curPos,
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: this.viewer.camera.pitch,
          roll: 0
        },
        duration: 0.8
      });
      this.speak("Aligning camera to True North.");
    });

    const updateTelemetry = () => {
      if (!this.viewer) return;
      const camera = this.viewer.camera;
      const carto = Cesium.Cartographic.fromCartesian(camera.positionWC);
      if (!carto) return;

      const altM = Math.round(carto.height);
      const altFt = Math.round(altM * 3.28084);
      const latDeg = Cesium.Math.toDegrees(carto.latitude);
      const lonDeg = Cesium.Math.toDegrees(carto.longitude);
      const headingDeg = Math.round(Cesium.Math.toDegrees(camera.heading)) % 360;
      const pitchDeg = Math.round(Cesium.Math.toDegrees(camera.pitch));

      // Flight observation regime
      let regime = "GROUND RECON";
      let regimeColor = "var(--status-green)";
      if (altM > 1000000) {
        regime = "ORBITAL RECON";
        regimeColor = "var(--status-cyan)";
      } else if (altM > 100000) {
        regime = "STRATOSPHERE";
        regimeColor = "var(--status-cyan)";
      } else if (altM > 15000) {
        regime = "HIGH CRUISE";
        regimeColor = "var(--brand-violet)";
      } else if (altM > 1500) {
        regime = "TACTICAL FLIGHT";
        regimeColor = "var(--brand-rust-light)";
      }

      // Compass cardinal direction
      const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
      const cardIdx = Math.round(headingDeg / 22.5) % 16;
      const cardinal = cardinals[cardIdx];

      if (compassDial) {
        compassDial.style.transform = `rotate(${-headingDeg}deg)`;
      }
      if (headingVal) {
        headingVal.innerText = `${String(headingDeg).padStart(3, '0')}° ${cardinal}`;
      }
      if (altMVal) {
        altMVal.innerText = `${altM.toLocaleString()} M`;
      }
      if (altFtVal) {
        altFtVal.innerText = `(${altFt.toLocaleString()} FT)`;
      }
      if (regimeBadge) {
        regimeBadge.innerText = regime;
        regimeBadge.style.borderColor = regimeColor;
        regimeBadge.style.color = regimeColor;
      }
      if (pitchVal) {
        pitchVal.innerText = `${pitchDeg}°`;
      }
      if (coordsVal) {
        const latDir = latDeg >= 0 ? 'N' : 'S';
        const lonDir = lonDeg >= 0 ? 'E' : 'W';
        coordsVal.innerText = `${Math.abs(latDeg).toFixed(3)}°${latDir}, ${Math.abs(lonDeg).toFixed(3)}°${lonDir}`;
      }
    };

    // Update dynamically and on camera move
    setInterval(updateTelemetry, 100);
    this.viewer.camera.changed.addEventListener(updateTelemetry);
  }

  // Google Maps Style Pulsing Red Pin with 8-Second Auto-Removal
  dropDestinationPin(lon, lat, name) {
    if (this.destinationPinEntity) {
      this.viewer.entities.remove(this.destinationPinEntity);
      this.destinationPinEntity = null;
    }
    if (this.destinationPinTimer) {
      clearTimeout(this.destinationPinTimer);
      this.destinationPinTimer = null;
    }

    const pinSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="44" height="58" viewBox="0 0 44 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="0" y="0" width="44" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.7"/>
        </filter>
        <g filter="url(#shadow)">
          <path d="M22 2C12 2 4 10 4 20C4 33 22 52 22 52C22 52 40 33 40 20C40 10 32 2 22 2Z" fill="#EF4444" stroke="#FFFFFF" stroke-width="2.5"/>
          <circle cx="22" cy="20" r="7.5" fill="#FFFFFF"/>
        </g>
      </svg>
    `)}`;

    this.destinationPinEntity = this.viewer.entities.add({
      name: name || 'Destination Pin',
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 20),
      billboard: {
        image: pinSvg,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.9,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      ellipse: {
        semiMinorAxis: 1800.0,
        semiMajorAxis: 1800.0,
        material: Cesium.Color.fromCssColorString('rgba(239, 68, 68, 0.3)'),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#EF4444'),
        outlineWidth: 2
      }
    });

    // Auto-remove pin after 8 seconds
    this.destinationPinTimer = setTimeout(() => {
      if (this.destinationPinEntity) {
        this.viewer.entities.remove(this.destinationPinEntity);
        this.destinationPinEntity = null;
      }
    }, 8000);
  }

  // Emergency Hazards and Disaster Monitoring
  async initHazardAlerts() {
    const banner = document.getElementById('tactical-hazard-banner');
    const severityBadge = document.getElementById('hazard-severity');
    const titleEl = document.getElementById('hazard-title');
    const locEl = document.getElementById('hazard-loc');
    const descEl = document.getElementById('hazard-desc');
    const flyBtn = document.getElementById('btn-fly-hazard');
    const dismissBtn = document.getElementById('btn-dismiss-hazard');

    if (!banner) return;

    let activeHazard = null;
    let activeHazardSignature = null;
    if (!this.dismissedHazards) {
      this.dismissedHazards = new Set();
    }

    const fetchHazards = async () => {
      try {
        const res = await fetch('/api/hazards/live');
        const data = await res.json();
        if (data && data.hazards && data.hazards.length > 0) {
          activeHazard = data.hazards[0];
          activeHazardSignature = `${activeHazard.id || ''}_${activeHazard.title || ''}_${activeHazard.severity || ''}`;

          // If this exact hazard was already dismissed by user, do NOT display or ping
          if (this.dismissedHazards.has(activeHazardSignature)) {
            return;
          }

          if (severityBadge) severityBadge.innerText = activeHazard.severity === 'critical' ? 'CRITICAL HAZARD' : 'TACTICAL ADVISORY';
          if (titleEl) titleEl.innerText = activeHazard.title;
          if (locEl) locEl.innerText = activeHazard.locationName;
          if (descEl) descEl.innerText = activeHazard.description;
          banner.style.display = 'block';
          tacticalAudio.playAlertPing();
        }
      } catch (e) {}
    };

    flyBtn?.addEventListener('click', () => {
      if (!activeHazard) return;
      tacticalAudio.playClick();
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(activeHazard.lon, activeHazard.lat, 45000),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-82),
          roll: 0
        },
        duration: 2.0
      });
      this.dropDestinationPin(activeHazard.lon, activeHazard.lat, activeHazard.title);
      this.speak(`Navigating to emergency hazard: ${activeHazard.title}.`);
    });

    dismissBtn?.addEventListener('click', () => {
      if (activeHazardSignature) {
        this.dismissedHazards.add(activeHazardSignature);
      }
      banner.style.display = 'none';
    });

    fetchHazards();
    setInterval(fetchHazards, 60000);
  }

  // 3D Tactical Route Planner Display & HUD
  clearTacticalRoute() {
    this.routeEntities.forEach(e => this.viewer.entities.remove(e));
    this.routeEntities = [];
    const hud = document.getElementById('route-planner-hud');
    if (hud) hud.style.display = 'none';
  }

  displayTacticalRoute(route) {
    if (!route || !route.coordinates || route.coordinates.length === 0) return;
    this.clearTacticalRoute();
    tacticalAudio.playTargetLock();

    const flat = [];
    route.coordinates.forEach(pt => flat.push(pt[0], pt[1]));

    const poly = this.viewer.entities.add({
      name: `Route: ${route.origin?.name || 'Origin'} to ${route.dest?.name || 'Destination'}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(flat),
        width: 5.5,
        clampToGround: true,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.35,
          color: Cesium.Color.fromCssColorString('#00F2FE')
        })
      }
    });
    this.routeEntities.push(poly);

    // Origin Pin
    if (route.origin) {
      const origPin = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(route.origin.lon, route.origin.lat, 20),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#00FF88'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: `🟢 ${route.origin.name}`,
          font: 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
          scale: 0.4,
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(11, 18, 32, 0.9)'),
          pixelOffset: new Cesium.Cartesian2(0, -16),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      this.routeEntities.push(origPin);
    }

    // Destination Pin
    if (route.dest) {
      const destPin = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(route.dest.lon, route.dest.lat, 20),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#FF0055'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: `🏁 ${route.dest.name}`,
          font: 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
          scale: 0.4,
          fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 3,
          outlineColor: Cesium.Color.BLACK,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString('rgba(11, 18, 32, 0.9)'),
          pixelOffset: new Cesium.Cartesian2(0, -16),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      this.routeEntities.push(destPin);
    }

    // Fly camera to frame the route nicely
    const midLat = (route.origin.lat + route.dest.lat) / 2;
    const midLon = (route.origin.lon + route.dest.lon) / 2;
    const distKm = route.distanceKm || 200;
    const altitudeM = Math.max(distKm * 2200, 60000);

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(midLon, midLat, altitudeM),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-70),
        roll: 0
      },
      duration: 2.2
    });

    // Populate and display Route HUD
    const hud = document.getElementById('route-planner-hud');
    const origLbl = document.getElementById('route-orig-label');
    const destLbl = document.getElementById('route-dest-label');
    const distVal = document.getElementById('route-dist-val');
    const timeVal = document.getElementById('route-time-val');
    const gmapsLink = document.getElementById('route-gmaps-link');

    if (hud) hud.style.display = 'block';
    if (origLbl) origLbl.innerText = route.origin?.name || 'Origin';
    if (destLbl) destLbl.innerText = route.dest?.name || 'Destination';
    if (distVal) distVal.innerText = `${Math.round(route.distanceKm || 0)} KM`;
    if (timeVal) timeVal.innerText = route.durationFormatted || `${Math.round((route.distanceKm || 0) / 60)} hrs`;
    if (gmapsLink && route.googleMapsUrl) gmapsLink.href = route.googleMapsUrl;
  }

  // Tactical Legend & Operational Manual Modal
  initLegendModal() {
    const infoBtn = document.getElementById('btn-tactical-info');
    const modal = document.getElementById('legend-modal');
    const closeBtn = document.getElementById('legend-close-btn');

    if (!modal) return;

    infoBtn?.addEventListener('click', () => {
      tacticalAudio.playClick();
      modal.style.display = 'flex';
    });

    const closeModal = () => {
      modal.style.display = 'none';
    };

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        this.clearTacticalRoute();
      }
    });

    // Wire Route HUD Cancel & Close Buttons
    const cancelRouteBtn = document.getElementById('btn-cancel-route');
    const closeRouteBtn = document.getElementById('btn-close-route');
    cancelRouteBtn?.addEventListener('click', () => this.clearTacticalRoute());
    closeRouteBtn?.addEventListener('click', () => this.clearTacticalRoute());
  }

  // Tactical Settings & User API Keys Modal
  initSettingsModal() {
    const btnSettings = document.getElementById('btn-settings');
    const modal = document.getElementById('settings-modal');
    const closeBtn = document.getElementById('settings-close-btn') || document.getElementById('settings-modal-close');
    const cancelBtn = document.getElementById('settings-cancel-btn');
    const saveBtn = document.getElementById('settings-save-btn');

    const inpCesium = document.getElementById('cfg-cesium-token');
    const inpAis = document.getElementById('cfg-aisstream-key');
    const inpTomTom = document.getElementById('cfg-tomtom-key');
    const inpFirms = document.getElementById('cfg-firms-key');
    const inpAqi = document.getElementById('cfg-aqi-token');
    const selAiProvider = document.getElementById('cfg-ai-provider');
    const wrapAiKey = document.getElementById('cfg-ai-key-wrap');
    const inpAiKey = document.getElementById('cfg-ai-key');

    if (!modal) return;

    const loadSettings = () => {
      const cfg = JSON.parse(localStorage.getItem('iisn_config') || '{}');
      if (inpCesium && cfg.cesiumToken) inpCesium.value = cfg.cesiumToken;
      if (inpAis && cfg.aisstreamKey) inpAis.value = cfg.aisstreamKey;
      if (inpTomTom && cfg.tomtomKey) inpTomTom.value = cfg.tomtomKey;
      if (inpFirms && cfg.firmsKey) inpFirms.value = cfg.firmsKey;
      if (inpAqi && cfg.aqiToken) inpAqi.value = cfg.aqiToken;
      if (selAiProvider && cfg.aiProvider) selAiProvider.value = cfg.aiProvider;
      if (inpAiKey && cfg.aiKey) inpAiKey.value = cfg.aiKey;

      if (wrapAiKey && selAiProvider) {
        wrapAiKey.style.display = (selAiProvider.value === 'openrouter' || selAiProvider.value === 'openai') ? 'block' : 'none';
      }
    };

    selAiProvider?.addEventListener('change', () => {
      if (wrapAiKey) {
        wrapAiKey.style.display = (selAiProvider.value === 'openrouter' || selAiProvider.value === 'openai') ? 'block' : 'none';
      }
    });

    btnSettings?.addEventListener('click', () => {
      tacticalAudio.playClick();
      loadSettings();
      modal.style.display = 'flex';
    });

    const closeModal = () => {
      modal.style.display = 'none';
    };

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    saveBtn?.addEventListener('click', () => {
      tacticalAudio.playTargetLock();
      const newConfig = {
        cesiumToken: inpCesium?.value.trim() || '',
        aisstreamKey: inpAis?.value.trim() || '',
        tomtomKey: inpTomTom?.value.trim() || '',
        firmsKey: inpFirms?.value.trim() || '',
        aqiToken: inpAqi?.value.trim() || '',
        aiProvider: selAiProvider?.value || 'ollama',
        aiKey: inpAiKey?.value.trim() || ''
      };

      localStorage.setItem('iisn_config', JSON.stringify(newConfig));
      closeModal();
      this.speak('Configuration saved. Custom API parameters applied.');
    });

    loadSettings();
  }
}

// Instantiate and start IISN
window.addEventListener('DOMContentLoaded', () => {
  const app = new IISNApp();
  app.init();
  window.iisnApp = app;
});
