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
  },
  // Node.js版本管理
  nodeManager: {
    // nvm相关操作
    getInstalledVersions: async (): Promise<any> => {
      return await ipcRenderer.invoke('nvm-list')
    },
    getAvailableVersions: async (): Promise<any> => {
      return await ipcRenderer.invoke('nvm-list-available')
    },
    installVersion: async (version: string): Promise<any> => {
      return await ipcRenderer.invoke('nvm-install', version)
    },
    useVersion: async (version: string): Promise<any> => {
      return await ipcRenderer.invoke('nvm-use', version)
    },
    uninstallVersion: async (version: string): Promise<any> => {
      return await ipcRenderer.invoke('nvm-uninstall', version)
    },
    // npm镜像管理
    getNpmMirrors: async (): Promise<any> => {
      return await ipcRenderer.invoke('nrm-list')
    },
    getCurrentMirror: async (): Promise<any> => {
      return await ipcRenderer.invoke('nrm-current')
    },
    useMirror: async (name: string): Promise<any> => {
      return await ipcRenderer.invoke('nrm-use', name)
    },
    addMirror: async (name: string, url: string): Promise<any> => {
      return await ipcRenderer.invoke('nrm-add', name, url)
    },
    deleteMirror: async (name: string): Promise<any> => {
      return await ipcRenderer.invoke('nrm-del', name)
    },
    testMirror: async (name: string): Promise<any> => {
      return await ipcRenderer.invoke('nrm-test', name)
    }
  },
  // 系统环境变量管理
  envManager: {
    getEnvVariables: async (): Promise<any> => {
      return await ipcRenderer.invoke('get-env-variables')
    },
    setEnvVariable: async (name: string, value: string, type: 'user' | 'system'): Promise<any> => {
      return await ipcRenderer.invoke('set-env-variable', name, value, type)
    },
    deleteEnvVariable: async (name: string, type: 'user' | 'system'): Promise<any> => {
      return await ipcRenderer.invoke('delete-env-variable', name, type)
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
