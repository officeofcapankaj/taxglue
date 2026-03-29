/**
 * TaxGlue Desktop Application
 * 
 * This runs the Flask server locally and displays the app in an Electron window.
 * All data is stored offline in local JSON files.
 */

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Disable sandbox for container environments
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');

// Determine if we're in development or production
const isDev = !app.isPackaged;
const PORT = 3000;

// Global reference to the Flask server process
let flaskProcess = null;
let mainWindow = null;

// Get the user data directory for storing app data
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory:', dataDir);
  }
}

// Start the Flask server
function startFlaskServer() {
  console.log('Starting Flask server on port ' + PORT + '...');
  
  // Use python3 directly
  const serverPath = isDev 
    ? path.join(__dirname, '..', 'server.py')
    : path.join(process.resourcesPath, 'app', 'server.py');
  
  // For packaged app, we need to adjust paths
  const actualServerPath = isDev 
    ? path.join(__dirname, '..', 'server.py')
    : path.join(__dirname, '..', 'server.py');
  
  // Copy data files to user data directory if they don't exist
  const sourceDataDir = isDev 
    ? path.join(__dirname, '..', '..', 'data')
    : path.join(process.resourcesPath, 'data');
  
  if (fs.existsSync(sourceDataDir)) {
    fs.readdirSync(sourceDataDir).forEach(file => {
      const srcPath = path.join(sourceDataDir, file);
      const destPath = path.join(dataDir, file);
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log('Copied data file:', file);
      }
    });
  }
  
  // Update the data directory in environment
  const env = {
    ...process.env,
    TAXGLUE_DATA_DIR: dataDir,
    FLASK_ENV: 'production',
    FLASK_SECRET_KEY: 'taxglue-desktop-' + Date.now()
  };
  
  // Start the server
  flaskProcess = spawn('python3', [actualServerPath], {
    env: env,
    cwd: isDev ? path.join(__dirname, '..') : path.join(process.resourcesPath, 'app'),
    stdio: 'pipe'
  });
  
  // Handle server output
  flaskProcess.stdout.on('data', (data) => {
    console.log('Flask:', data.toString().trim());
  });
  
  flaskProcess.stderr.on('data', (data) => {
    console.error('Flask Error:', data.toString().trim());
  });
  
  flaskProcess.on('close', (code) => {
    console.log('Flask server stopped with code:', code);
  });
  
  // Wait for server to start
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
}

// Create the main window
function createWindow() {
  console.log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'TaxGlue - Bookkeeping Software',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#f3f4f6'
  });
  
  // Build the menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-data');
          }
        },
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('import-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Backup',
          click: () => {
            mainWindow.webContents.send('backup-data');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://taxglue.in/docs');
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            mainWindow.webContents.send('check-updates');
          }
        },
        { type: 'separator' },
        {
          label: 'About TaxGlue',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  // Load the app
  const url = `http://localhost:${PORT}`;
  console.log('Loading:', url);
  mainWindow.loadURL(url);
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Window shown');
  });
  
  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready
app.whenReady().then(async () => {
  console.log('TaxGlue Desktop starting...');
  console.log('User data path:', userDataPath);
  console.log('Data directory:', dataDir);
  
  ensureDataDir();
  await startFlaskServer();
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (flaskProcess) {
    flaskProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', () => {
  console.log('App quitting...');
  if (flaskProcess) {
    flaskProcess.kill();
  }
});