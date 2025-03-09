import { ipcMain, BrowserWindow } from 'electron';

/**
 * 注册窗口控制相关的IPC处理程序
 */
export function registerWindowManagerHandlers(): void {
  // 最小化窗口
  ipcMain.on('window-minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  // 最大化/还原窗口
  ipcMain.on('window-maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  // 关闭窗口
  ipcMain.on('window-close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });

  // 切换窗口置顶状态
  ipcMain.on('window-toggle-always-on-top', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const isAlwaysOnTop = win.isAlwaysOnTop();
      win.setAlwaysOnTop(!isAlwaysOnTop);
      return !isAlwaysOnTop;
    }
    return false;
  });

  // 获取窗口置顶状态
  ipcMain.handle('window-get-always-on-top', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      return win.isAlwaysOnTop();
    }
    return false;
  });
} 