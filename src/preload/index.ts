import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 窗口控制
  window: {
    minimize: (): void => {
      ipcRenderer.send('window-minimize')
    },
    maximize: (): void => {
      ipcRenderer.send('window-maximize')
    },
    close: (): void => {
      ipcRenderer.send('window-close')
    },
    toggleAlwaysOnTop: async (): Promise<boolean> => {
      ipcRenderer.send('window-toggle-always-on-top')
      return await ipcRenderer.invoke('window-get-always-on-top')
    },
    isAlwaysOnTop: async (): Promise<boolean> => {
      return await ipcRenderer.invoke('window-get-always-on-top')
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
