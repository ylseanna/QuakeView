/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer, shell } from "electron";

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
  },
});

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => {
    shell.openExternal(url);
  },
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  platform: process.platform,
});
