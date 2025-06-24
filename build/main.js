'use strict';

var electron = require('electron');
var utils = require('@electron-toolkit/utils');
var getPortPlease = require('get-port-please');
var startServer = require('next/dist/server/lib/start-server');
var path = require('path');
var child_process = require('child_process');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var path__default = /*#__PURE__*/_interopDefault(path);

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var createWindow = () => {
  const mainWindow = new electron.BrowserWindow(__spreadProps(__spreadValues({
    // Init
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    show: false,
    // Topbar
    titleBarStyle: "hidden"
  }, process.platform !== "darwin" ? { titleBarOverlay: true } : {}), {
    titleBarOverlay: {
      color: "#FFFFFF00",
      // symbolColor: "#000",
      height: 29
    }
  }));
  mainWindow.maximize();
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  const loadURL = async () => {
    if (utils.is.dev) {
      mainWindow.loadURL("http://localhost:8090");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };
  startFlaskServer();
  loadURL();
  return mainWindow;
};
var startFlaskServer = () => {
  let backend = path__default.default.join(process.cwd(), "flask/dist/app -p 8100");
  if (process.platform == "win32") {
    backend = path__default.default.join(process.cwd(), "flask/dist/app.exe -p 8100");
  }
  const execfile = child_process.execFile;
  execfile(
    backend,
    {
      windowsHide: true
    },
    (err, stdout, stderr) => {
      if (err) {
        console.log(err);
      }
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
      }
    }
  );
};
var closeFlaskServer = () => {
  if (process.platform == "win32") {
    child_process.exec("taskkill /f /t /im app.exe", (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  } else if (process.platform == "linux") {
    child_process.exec("kill -9 `lsof -i:8100 -t`", (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
};
var startNextJSServer = async () => {
  try {
    const nextJSPort = await getPortPlease.getPort({ portRange: [30011, 5e4] });
    const webDir = path.join(electron.app.getAppPath(), "app");
    await startServer.startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5e3,
      minimalMode: true
    });
    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};
async function handleFileOpen() {
  const { canceled, filePaths } = await electron.dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.ipcMain.on("ping", () => console.log("pong"));
  electron.ipcMain.handle("dialog:openFile", handleFileOpen);
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  closeFlaskServer();
  if (process.platform !== "darwin") electron.app.quit();
});
