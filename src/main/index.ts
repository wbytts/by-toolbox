import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/rollup.jpg?asset'

function createWindow(): void {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    alwaysOnTop: false, // 默认不置顶
    autoHideMenuBar: true, // 隐藏菜单栏
    frame: false, // 隐藏窗口边框
    titleBarStyle: 'hidden', // 隐藏标题栏
    title: '冰冰工具箱', // 设置窗口标题
    icon: join(__dirname, '../../resources/rollup.jpg'), // 设置窗口图标

    ...(process.platform === 'linux' ? { icon } : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // 预加载脚本
      sandbox: false // 启用沙盒
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 基于electron-vite cli的渲染器热更新
  // 开发环境加载远程URL，生产环境加载本地HTML文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
// 某些API只能在此事件发生后使用
app.whenReady().then(() => {
  // 为Windows设置应用用户模型ID
  electronApp.setAppUserModelId('com.electron')

  // 在开发环境中默认通过F12打开或关闭开发者工具
  // 在生产环境中忽略Command或Control + R
  // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC测试
  ipcMain.on('ping', () => console.log('pong'))

  // 窗口控制
  ipcMain.on('window-minimize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.minimize()
  })

  ipcMain.on('window-maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.close()
  })

  // 控制窗口置顶
  ipcMain.on('window-toggle-always-on-top', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      const isAlwaysOnTop = win.isAlwaysOnTop()
      win.setAlwaysOnTop(!isAlwaysOnTop)
      return !isAlwaysOnTop
    }
    return false
  })

  // 获取窗口置顶状态
  ipcMain.handle('window-get-always-on-top', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      return win.isAlwaysOnTop()
    }
    return false
  })

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
