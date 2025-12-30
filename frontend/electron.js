import { app, BrowserWindow, Notification, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import logging from "electron-log";
import pkg from "electron-updater";
const { autoUpdater } = pkg;

// Configure logging
autoUpdater.logger = logging;
autoUpdater.logger.transports.file.level = "info";

// Configure auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Set GitHub token for auto-updater
if (process.env.GH_TOKEN) {
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "Abhinav-Upadhyay03",
    repo: "VISTAR",
    token: process.env.GH_TOKEN,
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let flaskProcess = null;

function logToFile(message) {
  // Write logs to ~/Logs/Vistar/backend.log
  const logsDir = path.join(os.homedir(), "Logs", "Vistar");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const logPath = path.join(logsDir, "backend.log");
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
}

function startFlaskBackend() {
  let flaskPath;
  let args = [];
  let command;
  
  if (app.isPackaged) {
    // Production mode: Use platform-specific executable
    const platform = process.platform;
    const backendDir = path.join(process.resourcesPath, "flask_backend");
    
    // Determine executable name based on platform
    let executableName;
    if (platform === "win32") {
      executableName = "flask_backend.exe";
    } else {
      executableName = "flask_backend";
    }
    
    flaskPath = path.join(backendDir, executableName);
    logToFile(`Production mode: Starting backend from ${flaskPath} on ${platform}`);

    // Check if the file exists
    if (!fs.existsSync(flaskPath)) {
      const errorMsg = `Flask backend not found at ${flaskPath}`;
      logToFile(errorMsg);
      console.error(errorMsg);
      showNotification("Backend Error", errorMsg);
      return;
    }
  } else {
    // Development mode: Use Python from venv
    const backendDir = path.resolve(__dirname, "..", "backend");
    flaskPath = path.join(backendDir, "run.py");
    
    // Use Python from venv if it exists, otherwise fall back to system Python
    let pythonPath;
    if (process.platform === "win32") {
      pythonPath = path.join(backendDir, "venv", "Scripts", "python.exe");
      command = fs.existsSync(pythonPath) ? pythonPath : "python";
    } else {
      // Try python3 first, then python, then python3.13
      pythonPath = path.join(backendDir, "venv", "bin", "python3");
      if (!fs.existsSync(pythonPath)) {
        pythonPath = path.join(backendDir, "venv", "bin", "python");
      }
      if (!fs.existsSync(pythonPath)) {
        pythonPath = path.join(backendDir, "venv", "bin", "python3.13");
      }
      // Use absolute path if venv Python exists
      command = fs.existsSync(pythonPath) ? path.resolve(pythonPath) : "python3";
    }
    
    args = [flaskPath];
    logToFile(`Dev mode: Starting backend with ${command} ${flaskPath}`);
    logToFile(`Backend dir: ${backendDir}, Python path: ${command}, Exists: ${fs.existsSync(pythonPath)}`);
  }

  try {
    logToFile(
      `Attempting to start backend process with: ${
        app.isPackaged ? flaskPath : `${command} ${args.join(" ")}`
      }`
    );

    if (app.isPackaged) {
      // Production mode: Execute the bundled executable directly
      const platform = process.platform;
      
      if (platform === "win32") {
        // Windows: Execute .exe directly
        flaskProcess = spawn(flaskPath, [], {
          stdio: "pipe",
          env: {
            ...process.env,
            PATH: `${path.dirname(flaskPath)}${path.delimiter}${
              process.env.PATH
            }`,
          },
        });
      } else {
        // macOS/Linux: Execute Unix executable directly
        // Make sure it's executable
        try {
          fs.chmodSync(flaskPath, 0o755);
        } catch (err) {
          logToFile(`Warning: Could not set executable permissions: ${err.message}`);
        }
        
        flaskProcess = spawn(flaskPath, [], {
          stdio: "pipe",
          env: {
            ...process.env,
            PATH: `${path.dirname(flaskPath)}${path.delimiter}${
              process.env.PATH
            }`,
          },
        });
      }
    } else {
      // Development mode: Use Python
      flaskProcess = spawn(command, args);
    }

    flaskProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();
      logToFile(`Flask stdout: ${output}`);
      console.log(`Flask stdout: ${output}`);
    });

    flaskProcess.stderr.on("data", (data) => {
      const error = data.toString().trim();
      logToFile(`Flask stderr: ${error}`);
      console.error(`Flask stderr: ${error}`);
      showNotification("Backend Warning", `Flask process error: ${error}`);
    });

    flaskProcess.on("close", (code) => {
      const msg = `Flask process exited with code ${code}`;
      logToFile(msg);
      console.log(msg);
      if (code !== 0) {
        showNotification("Backend Error", msg);
      }
    });

    flaskProcess.on("error", (err) => {
      const errorMsg = `Flask process error: ${err.message}`;
      logToFile(errorMsg);
      console.error(errorMsg);
      showNotification("Backend Error", errorMsg);
    });
  } catch (err) {
    const errorMsg = `Failed to start Flask backend: ${err.message}`;
    logToFile(errorMsg);
    console.error(errorMsg);
    showNotification("Backend Error", errorMsg);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    icon: path.join(
      __dirname,
      "icons",
      process.platform === "win32" ? "icon.ico" : "icon.png"
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, "dist", "index.html")}`
    : "http://localhost:5173";

  win.loadURL(startUrl);

  // Handle navigation events for client-side routing
  win.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    // Extract the path from the URL and update the hash
    const pathname = new URL(url).pathname;
    win.loadURL(`${startUrl}#${pathname}`);
  });

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
    silent: false,
  }).show();
}

// Auto-updater events
autoUpdater.on("checking-for-update", () => {
  logging.info("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  logging.info("Update available:", info);
  showNotification(
    "Update Available",
    `A new version (${info.version}) is available. Downloading...`
  );
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", (info) => {
  logging.info("Update not available:", info);
});

autoUpdater.on("error", (err) => {
  logging.error("Error in auto-updater:", err);
  showNotification(
    "Update Error",
    "An error occurred while checking for updates. Please try again later."
  );
});

autoUpdater.on("download-progress", (progressObj) => {
  logging.info("Download progress:", progressObj);
  const percent = Math.round(progressObj.percent);
  showNotification("Downloading Update", `Download progress: ${percent}%`);
});

autoUpdater.on("update-downloaded", (info) => {
  logging.info("Update downloaded:", info);
  showNotification(
    "Update Ready",
    "A new version has been downloaded. Restart the application to apply the updates."
  );
});

app.whenReady().then(() => {
  startFlaskBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (flaskProcess) {
    flaskProcess.kill();
    logToFile("Flask process killed on window-all-closed");
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Add IPC handlers for manual update checking
ipcMain.handle("check-for-updates", async () => {
  if (app.isPackaged) {
    return autoUpdater.checkForUpdates();
  }
  return null;
});
