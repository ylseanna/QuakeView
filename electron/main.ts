import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { is } from "@electron-toolkit/utils";
// import { getPort } from "get-port-please";
// import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";
import { execFile, exec } from "child_process";

import log from "electron-log/main";
import next from "next";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

log.initialize();

log.info("Log from the main process");

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

  // const loadURL = async () => {
  //   if (is.dev) {
  //     // is opened externally if in dev mode
  //     mainWindow.loadURL("http://localhost:8090");
  //   } else {
  //     try {
  //       const port = await startNextJSServer();
  //       console.log("Next.js server started on port:", port);
  //       mainWindow.loadURL(`http://localhost:${port}`);
  //     } catch (error) {
  //       console.error("Error starting Next.js server:", error);
  //     }
  //   }
  // };

  if (!is.dev) {
    // is opened externally if in dev mode
    startFlaskServer();
    startNextJSServer().then(() => {
      mainWindow.loadURL("http://localhost:8090/");
    });
  } else {
    mainWindow.loadURL("http://localhost:8090/");
  }

  // loadURL();
  return mainWindow;
};

const startFlaskServer = () => {
  let backend = join(app.getAppPath(), "app", "flask", "app")

  if (process.platform == "win32") {
    backend = join(app.getAppPath(), "app", "flask", "app.exe")
  }

  const execfile = execFile;
  execfile(
    backend,
    {
      windowsHide: true,
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

const closeFlaskServer = () => {
  if (process.platform == "win32") {
    exec("taskkill /f /t /im app.exe", (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  } else if (process.platform == "linux") {
    exec("kill -9 `lsof -i:8100 -t`", (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }
};

const startNextJSServer = async () => {
  log.info("Starting Next server");
  // Use server-side rendering for both dev and production builds

  log.info(`Searching for Next server in ${join(app.getAppPath(), "app")}`);

  log.info("Starting Next server");
  const nextApp = next({
    dev: is.dev,
    dir: join(app.getAppPath(), "app"),
    port: 8090,
  });
  const requestHandler = nextApp.getRequestHandler();

  // Build the renderer code and watch the files
  await nextApp.prepare();

  // Create a new native HTTP server (which supports hot code reloading)
  createServer((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    const parsedUrl = parse(req.url!, true);
    requestHandler(req, res, parsedUrl);
  }).listen(8090, () => {
    console.log("> Ready on http://localhost:8090");
  });

  // window.loadURL("http://localhost:8090/");
};

// const startNextJSServer = async () => {
//   try {
//     // const nextJSPort = await getPort({ portRange: [30_011, 50_000] });

//     const nextJSPort = 8090;
//     const webDir = join(app.getAppPath(), "app");

//     await startServer({
//       dir: webDir,
//       isDev: false,
//       hostname: "localhost",
//       port: nextJSPort,
//       customServer: true,
//       allowRetry: false,
//       keepAliveTimeout: 5000,
//       minimalMode: true,
//     });

//     return nextJSPort;
//   } catch (error) {
//     console.error("Error starting Next.js server:", error);
//     throw error;
//   }
// };

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
  closeFlaskServer();

  if (process.platform !== "darwin") app.quit();
});
