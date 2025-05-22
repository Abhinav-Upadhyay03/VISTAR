import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    ? `file://${path.join(__dirname, 'index.html')}`
    : 'http://localhost:5173';

  win.loadURL(startUrl);

  // Open DevTools in development
//   if (!app.isPackaged) {
//     win.webContents.openDevTools();
//   }
}

app.whenReady().then(createWindow);

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