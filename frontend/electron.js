import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import logging from 'electron-log';

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
}

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