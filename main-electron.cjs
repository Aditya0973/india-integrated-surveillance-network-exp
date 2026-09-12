const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const { fork } = require('child_process');

// Hardware GPU Acceleration Switches for Smooth 60 FPS 3D Rendering
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('force_high_performance_gpu');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-accelerated-video-decode');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 5200;

function startBackendServer() {
  const serverScript = path.join(__dirname, 'server', 'proxy.js');
  serverProcess = fork(serverScript, [], {
    cwd: path.join(__dirname),
    env: { ...process.env, PORT: SERVER_PORT.toString() },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start IISN backend proxy:', err);
  });
}

function createWindow() {
  // Grant microphone and audio permissions for Voice AI
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'microphone' || permission === 'audioCapture') {
      callback(true);
    } else {
      callback(true);
    }
  });

  mainWindow = new BrowserWindow({
    width: 1560,
    height: 960,
    minWidth: 1080,
    minHeight: 720,
    backgroundColor: '#1B1515',
    title: "INDIA INTEGRATED SURVEILLANCE NETWORK // IISN",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      devTools: true
    }
  });

  const appUrl = `http://localhost:${SERVER_PORT}`;

  setTimeout(() => {
    mainWindow.loadURL(appUrl).catch(() => {
      setTimeout(() => mainWindow.loadURL(appUrl), 1500);
    });
  }, 1000);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('exit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
