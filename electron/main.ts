import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { is } from "@electron-toolkit/utils";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import path, { join } from "path";
import { execFile, exec } from "child_process";
// import { spawn, ChildProcess } from "child_process";


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

  startFlaskServer();

  // const python: ChildProcess = spawn("flask", [
  //   "--app",
  //   "./flask/app.py",
  //   "--debug",
  //   "run",
  // ]);
  // python.stdout!.on("data", function (data) {
  //   console.log("data: ", data.toString("utf8"));
  // });
  // python.stderr!.on("data", (data) => {
  //   console.log(`stderr: ${data}`); // when error
  // });

  loadURL();
  return mainWindow;
};

const startFlaskServer = () => {
  let backend = path.join(process.cwd(), "flask/dist/app -p 8100");

  if (process.platform == "win32") {
    backend = path.join(process.cwd(), "flask/dist/app.exe -p 8100");
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
  closeFlaskServer();

  if (process.platform !== "darwin") app.quit();
});
