# 🇮🇳 INDIA INTEGRATED SURVEILLANCE NETWORK (IISN)
### Next-Gen 3D Geospatial Intelligence & Tactical Situational Awareness Console

> *Inspired by the concept of [**God's Eye View**](https://github.com/bilawalsidhu/gods-eye-view) by Bilawal Sidhu — engineered specifically for high-precision surveillance, airspace tracking, railway telemetry, maritime monitoring, and national situational awareness across the Indian Subcontinent.*

---

## 🚀 Quick Start & 1-Click Launch

### Windows Desktop 1-Click Run
Simply double-click **`launch-iisn.bat`** in the repository root.
* Automatically resolves port conflicts, launches the backend proxy server, and opens a borderless dedicated window.

### Web & Cross-Platform (macOS / Linux / Windows)
```bash
# Clone the repository
git clone https://github.com/Aditya0973/india-integrated-surveillance-network-exp.git
cd india-integrated-surveillance-network-exp

# Install dependencies
npm install

# Start the console
npm start
```
Visit **`http://localhost:5200`** in Chrome, Edge, Brave, or Firefox.

---

## 🌟 Keyless Out-of-the-Box Operation

IISN is designed to work **100% out of the box with zero required API keys**:
* **Default Basemap**: Launches on a high-performance, dark tactical canvas (Esri World Canvas) with zero token requirements, locked 60 FPS, and zero lag.
* **Instant Vercel Access**: Anyone visiting your Vercel deployment immediately sees the complete 3D globe with interactive countries, states, and live feeds without needing to configure tokens first.
* **Optional Enhancements**: Add a free Cesium Ion token in **`[ ⚙ CONFIG ]`** to unlock Google Photorealistic 3D Tiles and Bing Satellite whenever you want.

---

## 🌐 Deploying to Vercel (Web Deployment)

IISN includes native Vercel serverless configurations (`vercel.json` and `api/index.js`):

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set your Environment Variables (`CESIUM_ION_TOKEN`, `TOMTOM_API_KEY`, etc.) in the Vercel Project Settings.
4. Click **Deploy**!

---

## 🎮 Keyboard & Tactical Shortcuts

| Key / Action | Command |
|:---|:---|
| **Left Click + Drag** | Smooth 3D Orbit & Spatial Pan |
| **Right Click + Drag** | 3D Perspective Pitch & Tilt Angle |
| **Shift + Scroll** | Turbo Altitude Zoom (3.5x Speed) |
| **Ctrl + Scroll** | Micro Precision Ground Zoom (0.25x Speed) |
| **Space / H** | Toggle Tactical HUD Overlay |
| **C** | Engage / Exit 3D Cockpit Chase Mode |
| **Esc** | Close Dialogs / Reset Route Plan |
| **Click Compass** | Smoothly Re-align Camera to True North (000°) |

---

## 🔒 Privacy & Security

* **Zero Hardcoded Secrets**: All API tokens and credentials are exclusively loaded from environment variables (`.env`).
* **Open Source & Extensible**: Modular design for defense sectors, sensor networks, and autonomous AI directive routing.

---

## 📜 Acknowledgements & Inspirations
* Inspired by [**God's Eye View**](https://github.com/bilawalsidhu/gods-eye-view) by Bilawal Sidhu.
* Map and 3D terrain streaming powered by **CesiumJS** and **Google 3D Tiles**.
* Telemetry feeds courtesy of OpenSky Network, AISStream, Indian Railways, ISRO, NASA FIRMS, WAQI, and CPCB.

