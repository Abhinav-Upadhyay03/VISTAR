import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import isDev from 'electron-is-dev';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let flaskProcess = null;

function startFlaskBackend() {
  const isWin = process.platform === 'win32';
  const flaskExecutable = isDev
    ? 'python'
    : path.join(process.resourcesPath, 'backend', isWin ? 'run.exe' : 'run');

  const args = isDev ? ['../backend/run.py'] : [];
  
  flaskProcess = spawn(flaskExecutable, args);

  flaskProcess.stdout.on('data', (data) => {
    console.log(`Flask: ${data}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`Flask Error: ${data}`);
  });

  flaskProcess.on('close', (code) => {
    console.log(`Flask process exited with code ${code}`);
  });
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

  // Use path.join for file:// protocol in production
  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, 'dist', 'index.html')}`
    : 'http://localhost:5173';

  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  startFlaskBackend();
  // Wait for Flask to start
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (flaskProcess) {
    flaskProcess.kill();
  }
});