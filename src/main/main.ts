/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { exec, spawn } from 'child_process';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.handle('install-crawlee', async () => {
  const scraperPath = path.join(__dirname, '../../scrapers');
  const win = BrowserWindow.getAllWindows()[0]; // send events to renderer

  const packages = ['crawlee', 'cheerio', 'puppeteer'];
  let installed = 0;

  for (const pkg of packages) {
    try {
      await new Promise((resolve, reject) => {
        exec(
          `npm install ${pkg}`,
          { cwd: scraperPath },
          (err, stdout, stderr) => {
            if (err) return reject(stderr || err.message);
            installed++;
            win.webContents.send('install-progress', {
              package: pkg,
              progress: Math.round((installed / packages.length) * 100),
            });
            resolve(true);
          },
        );
      });
    } catch (err) {
      return { success: false, error: err };
    }
  }

  return { success: true };
});

ipcMain.handle('run-scraper', async (_, scraperName: string) => {
  const scraperPath = path.join(
    __dirname,
    `../../scrapers/${scraperName}/index.js`,
  );

  if (!fs.existsSync(scraperPath)) {
    return { success: false, error: 'Scraper not found' };
  }

  return new Promise((resolve) => {
    const child = spawn('node', [scraperPath], {
      cwd: path.dirname(scraperPath),
      shell: true,
    });

    child.stdout.on('data', (data) => console.log(data.toString()));
    child.stderr.on('data', (data) => console.error(data.toString()));
    child.on('close', (code) => resolve({ success: code === 0 }));
  });
});

// Generic dataset reader
ipcMain.handle('read-dataset', async (folder: any) => {
  const datasetPath = path.join(__dirname, '../../storage/datasets/default');
  try {
    const files = fs
      .readdirSync(datasetPath)
      .filter((f) => f.endsWith('.json'));
    const data = files.flatMap((file) => {
      const content = fs.readFileSync(path.join(datasetPath, file), 'utf-8');
      return JSON.parse(content);
    });
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});
