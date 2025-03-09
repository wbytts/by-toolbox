import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerAllHandlers } from './ipc-handlers'

// 移除不再需要的导入
// import * as fs from 'fs'
// import { promisify } from 'util'
// import { exec } from 'child_process'
// import * as os from 'os'

// 移除不再需要的变量
// const execAsync = promisify(exec)

// 保留fetchNodeVersionsFromWebsite函数，因为它在其他地方可能被使用
async function fetchNodeVersionsFromWebsite(): Promise<string[]> {
  try {
    const { default: fetch } = await import('node-fetch')
    const response = await fetch('https://nodejs.org/dist/index.json')
    const data = await response.json()
    
    return data
      .map((item: any) => item.version.replace('v', ''))
      .sort((a: string, b: string) => {
        const aParts = a.split('.').map(Number)
        const bParts = b.split('.').map(Number)
        
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) {
            return bParts[i] - aParts[i]
          }
        }
        
        return 0
      })
  } catch (error) {
    console.error('获取Node.js版本列表失败:', error)
    return []
  }
}

function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli
  // Load the remote URL for development or the local html file for production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 注册所有IPC处理程序
app.whenReady().then(() => {
  // 为Windows设置应用用户模型ID
  electronApp.setAppUserModelId('com.electron')

  // 默认情况下，在开发模式下启用DevTools
  if (is.dev) app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册所有IPC处理程序
  registerAllHandlers()

  createWindow()

  app.on('activate', function () {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，
    // 通常会在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用，除了在macOS上。在macOS上，
// 应用及其菜单栏通常会保持活动状态，直到用户使用Cmd + Q明确退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在此文件中，你可以包含应用程序特定的主进程代码
// 你也可以将它们放在单独的文件中，并在这里引入
