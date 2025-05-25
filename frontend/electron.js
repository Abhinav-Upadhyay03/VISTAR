import { app, BrowserWindow, Notification, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import logging from 'electron-log';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

// Configure logging
autoUpdater.logger = logging;
autoUpdater.logger.transports.file.level = 'info';

// Configure auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Set GitHub token for auto-updater
if (process.env.GH_TOKEN) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Abhinav-Upadhyay03',
    repo: 'VISTAR',
    token: process.env.GH_TOKEN
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let flaskProcess = null;

function logToFile(message) {
  // Write logs to ~/Logs/Vistar/backend.log
  const logsDir = path.join(os.homedir(), 'Logs', 'Vistar');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logPath = path.join(logsDir, 'backend.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

function startFlaskBackend() {
  let flaskPath;
  let args = [];
  if (app.isPackaged) {
    flaskPath = path.join(process.resourcesPath, 'flask_backend');
    logToFile(`Production mode: Starting backend from ${flaskPath}`);
  } else {
    flaskPath = path.join(__dirname, '..', 'backend', 'run.py');
    args = [flaskPath];
    logToFile(`Dev mode: Starting backend with python ${flaskPath}`);
  }

  try {
    flaskProcess = app.isPackaged
      ? spawn(flaskPath)
      : spawn('python3', args);

    flaskProcess.stdout.on('data', (data) => {
      logToFile(`Flask stdout: ${data}`);
      console.log(`Flask stdout: ${data}`);
    });

    flaskProcess.stderr.on('data', (data) => {
      logToFile(`Flask stderr: ${data}`);
      console.error(`Flask stderr: ${data}`);
    });

    flaskProcess.on('close', (code) => {
      logToFile(`Flask process exited with code ${code}`);
      console.log(`Flask process exited with code ${code}`);
    });

    flaskProcess.on('error', (err) => {
      logToFile(`Flask process error: ${err}`);
      console.error(`Flask process error: ${err}`);
    });
  } catch (err) {
    logToFile(`Failed to start Flask backend: ${err}`);
    console.error(`Failed to start Flask backend: ${err}`);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    icon: path.join(__dirname, 'icons', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, 'dist', 'index.html')}`
    : 'http://localhost:5173';

  win.loadURL(startUrl);

  // Check for updates on startup and every hour
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 60 * 60 * 1000); // Check every hour
  }
}

function showNotification(title, body) {
  new Notification({
    title,
    body,
    silent: false
  }).show();
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  logging.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  logging.info('Update available:', info);
  showNotification(
    'Update Available',
    `A new version (${info.version}) is available. Downloading...`
  );
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', (info) => {
  logging.info('Update not available:', info);
});

autoUpdater.on('error', (err) => {
  logging.error('Error in auto-updater:', err);
  showNotification(
    'Update Error',
    'An error occurred while checking for updates. Please try again later.'
  );
});

autoUpdater.on('download-progress', (progressObj) => {
  logging.info('Download progress:', progressObj);
  const percent = Math.round(progressObj.percent);
  showNotification(
    'Downloading Update',
    `Download progress: ${percent}%`
  );
});

autoUpdater.on('update-downloaded', (info) => {
  logging.info('Update downloaded:', info);
  showNotification(
    'Update Ready',
    'A new version has been downloaded. Restart the application to apply the updates.'
  );
});

app.whenReady().then(() => {
  startFlaskBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (flaskProcess) {
    flaskProcess.kill();
    logToFile('Flask process killed on window-all-closed');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add IPC handlers for manual update checking
ipcMain.handle('check-for-updates', async () => {
  if (app.isPackaged) {
    return autoUpdater.checkForUpdates();
  }
  return null;
});