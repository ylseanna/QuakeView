import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { spawn, ChildProcess } from "child_process";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    // Init
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    show: false,

    // Topbar
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin" ? { titleBarOverlay: true } : {}),
    titleBarOverlay: {
      color: "#FFFFFF00",
      // symbolColor: "#000",
      height: 29,
    },
  });

  mainWindow.maximize();
  // mainWindow.setFocusable(false);

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  const loadURL = async () => {
    if (is.dev) {
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

  const python: ChildProcess = spawn("flask", [
    "--app",
    "./flask/app.py",
    "--debug",
    "run",
  ]);
  python.stdout!.on("data", function (data) {
    console.log("data: ", data.toString("utf8"));
  });
  python.stderr!.on("data", (data) => {
    console.log(`stderr: ${data}`); // when error
  });

  loadURL();
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) {
    return filePaths[0];
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  ipcMain.handle("dialog:openFile", handleFileOpen);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
