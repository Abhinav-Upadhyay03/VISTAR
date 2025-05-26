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
  
  try {
    if (app.isPackaged) {
      // In production, look for the backend in the resources directory
      flaskPath = path.join(process.resourcesPath, 'flask_backend');
      if (process.platform === 'win32') {
        flaskPath = `${flaskPath}.exe`;
      }
      logToFile(`Production mode: Starting backend from ${flaskPath}`);
      
      // Verify the backend exists
      if (!fs.existsSync(flaskPath)) {
        throw new Error(`Backend executable not found at ${flaskPath}`);
      }
      
      // Set working directory to the backend directory
      const workingDir = path.dirname(flaskPath);
      logToFile(`Setting working directory to: ${workingDir}`);
      
      flaskProcess = spawn(flaskPath, [], {
        windowsHide: false,
        cwd: workingDir,
        env: {
          ...process.env,
          PYTHONPATH: workingDir
        }
      });
    } else {
      // In development, use Python directly
      flaskPath = path.join(__dirname, '..', 'backend', 'run.py');
      args = [flaskPath];
      logToFile(`Dev mode: Starting backend with python ${flaskPath}`);
      
      flaskProcess = spawn('python3', args, {
        env: {
          ...process.env,
          PYTHONPATH: path.join(__dirname, '..', 'backend')
        }
      });
    }

    // Handle process output
    flaskProcess.stdout.on('data', (data) => {
      const message = data.toString();
      logToFile(`Flask stdout: ${message}`);
      console.log(`Flask stdout: ${message}`);
    });

    flaskProcess.stderr.on('data', (data) => {
      const message = data.toString();
      logToFile(`Flask stderr: ${message}`);
      console.error(`Flask stderr: ${message}`);
    });

    flaskProcess.on('close', (code) => {
      const message = `Flask process exited with code ${code}`;
      logToFile(message);
      console.log(message);
      
      // If the process exits unexpectedly, try to restart it
      if (code !== 0 && !app.isQuitting) {
        logToFile('Attempting to restart backend...');
        setTimeout(startFlaskBackend, 1000);
      }
    });

    flaskProcess.on('error', (err) => {
      const message = `Flask process error: ${err}`;
      logToFile(message);
      console.error(message);
    });
  } catch (err) {
    const message = `Failed to start Flask backend: ${err}`;
    logToFile(message);
    console.error(message);
    
    // Show error to user
    showNotification(
      'Backend Error',
      'Failed to start the backend service. Please check the logs for details.'
    );
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

// Track if app is quitting
app.isQuitting = false;

app.whenReady().then(() => {
  startFlaskBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  app.isQuitting = true;
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