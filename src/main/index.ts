import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/rollup.jpg?asset'
import { exec, ExecOptions } from 'child_process'
import { promisify } from 'util'
import https from 'https'

const execAsync = promisify(exec)

// 从Node.js官方网站获取可用版本
async function fetchNodeVersionsFromWebsite(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    https.get('https://nodejs.org/en/about/previous-releases/', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // 解析HTML内容，提取版本信息
          const versions: string[] = [];
          const versionRegex = /v(\d+\.\d+\.\d+)/g;
          let match;
          
          while ((match = versionRegex.exec(data)) !== null) {
            versions.push(match[0]);
          }
          
          // 去重并排序
          const uniqueVersions = [...new Set(versions)].sort((a, b) => {
            const aVer = a.substring(1).split('.').map(Number);
            const bVer = b.substring(1).split('.').map(Number);
            
            // 主版本号比较
            if (aVer[0] !== bVer[0]) return bVer[0] - aVer[0];
            // 次版本号比较
            if (aVer[1] !== bVer[1]) return bVer[1] - aVer[1];
            // 补丁版本号比较
            return bVer[2] - aVer[2];
          });
          
          resolve(uniqueVersions);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

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
    // 只有外部链接才使用外部浏览器打开
    if (details.url.startsWith('http:') || details.url.startsWith('https:')) {
      shell.openExternal(details.url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
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

  // Node.js 版本管理
  ipcMain.handle('nvm-list', async () => {
    console.log('执行nvm list命令...');
    try {
      // 尝试多种方式执行命令
      let result;
      
      // 方式1: 直接执行
      try {
        console.log('尝试直接执行nvm list');
        result = await execAsync('nvm list');
      } catch (e) {
        console.log('直接执行失败，尝试cmd /c方式');
        
        // 方式2: 使用cmd /c
        try {
          console.log('尝试使用cmd /c执行nvm list');
          const options: ExecOptions = { windowsHide: true };
          result = await execAsync('cmd /c nvm list', options);
        } catch (e2) {
          console.log('cmd /c执行失败，尝试PowerShell');
          
          // 方式3: 使用PowerShell
          try {
            console.log('尝试使用PowerShell执行nvm list');
            const options: ExecOptions = { windowsHide: true };
            result = await execAsync('powershell.exe -Command "nvm list"', options);
          } catch (e3) {
            console.log('PowerShell执行失败');
            throw e3; // 所有方法都失败，抛出最后一个错误
          }
        }
      }
      
      const { stdout, stderr } = result;
      console.log('nvm list命令输出:', stdout);
      
      if (stderr && stderr.trim() !== '') {
        console.error('nvm list命令错误:', stderr);
        return { error: stderr };
      }
      
      return { data: stdout };
    } catch (error: any) {
      console.error('执行nvm list命令失败:', error);
      return { 
        error: `执行nvm命令失败: ${error.message || '未知错误'}。请确认nvm已正确安装并添加到PATH环境变量。` 
      };
    }
  });

  ipcMain.handle('nvm-list-available', async () => {
    console.log('获取可用Node.js版本...');
    try {
      // 尝试从官方网站获取版本信息
      try {
        console.log('从Node.js官方网站获取版本信息');
        const versions = await fetchNodeVersionsFromWebsite();
        console.log(`从官方网站获取到 ${versions.length} 个版本`);
        return { data: versions.join('\n') };
      } catch (e) {
        console.log('从官方网站获取失败，尝试使用nvm命令');
        
        // 如果从网站获取失败，回退到使用nvm命令
        let result;
        
        // 方式1: 直接执行
        try {
          console.log('尝试直接执行nvm list available');
          result = await execAsync('nvm list available');
        } catch (e) {
          console.log('直接执行失败，尝试cmd /c方式');
          
          // 方式2: 使用cmd /c
          try {
            console.log('尝试使用cmd /c执行nvm list available');
            const options: ExecOptions = { windowsHide: true };
            result = await execAsync('cmd /c nvm list available', options);
          } catch (e2) {
            console.log('cmd /c执行失败，尝试PowerShell');
            
            // 方式3: 使用PowerShell
            try {
              console.log('尝试使用PowerShell执行nvm list available');
              const options: ExecOptions = { windowsHide: true };
              result = await execAsync('powershell.exe -Command "nvm list available"', options);
            } catch (e3) {
              console.log('PowerShell执行失败');
              throw e3; // 所有方法都失败，抛出最后一个错误
            }
          }
        }
        
        const { stdout, stderr } = result;
        console.log('nvm list available命令输出长度:', stdout.length);
        
        if (stderr && stderr.trim() !== '') {
          console.error('nvm list available命令错误:', stderr);
          return { error: stderr };
        }
        
        return { data: stdout };
      }
    } catch (error: any) {
      console.error('获取可用Node.js版本失败:', error);
      return { error: error.message || '执行命令失败' };
    }
  });

  ipcMain.handle('nvm-install', async (_, version) => {
    const { stdout, stderr } = await execAsync(`nvm install ${version}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  ipcMain.handle('nvm-use', async (_, version) => {
    const { stdout, stderr } = await execAsync(`nvm use ${version}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  ipcMain.handle('nvm-uninstall', async (_, version) => {
    const { stdout, stderr } = await execAsync(`nvm uninstall ${version}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  // NPM 镜像管理
  ipcMain.handle('nrm-list', async () => {
    console.log('执行nrm ls命令...');
    try {
      // 尝试多种方式执行命令
      let result;
      
      // 方式1: 直接执行
      try {
        console.log('尝试直接执行nrm ls');
        result = await execAsync('nrm ls');
      } catch (e) {
        console.log('直接执行失败，尝试cmd /c方式');
        
        // 方式2: 使用cmd /c
        try {
          console.log('尝试使用cmd /c执行nrm ls');
          const options: ExecOptions = { windowsHide: true };
          result = await execAsync('cmd /c nrm ls', options);
        } catch (e2) {
          console.log('cmd /c执行失败，尝试npx方式');
          
          // 方式3: 使用npx
          try {
            console.log('尝试使用npx执行nrm ls');
            const options: ExecOptions = { windowsHide: true };
            result = await execAsync('npx nrm ls', options);
          } catch (e3) {
            console.log('npx执行失败，尝试PowerShell');
            
            // 方式4: 使用PowerShell
            try {
              console.log('尝试使用PowerShell执行nrm ls');
              const options: ExecOptions = { windowsHide: true };
              result = await execAsync('powershell.exe -Command "nrm ls"', options);
            } catch (e4) {
              console.log('PowerShell执行失败');
              throw e4; // 所有方法都失败，抛出最后一个错误
            }
          }
        }
      }
      
      const { stdout, stderr } = result;
      console.log('nrm ls命令输出:', stdout);
      
      if (stderr && stderr.trim() !== '') {
        console.error('nrm ls命令错误:', stderr);
        return { error: stderr };
      }
      
      return { data: stdout };
    } catch (error: any) {
      console.error('执行nrm ls命令失败:', error);
      return { error: `执行nrm命令失败: ${error.message || '未知错误'}。请确认nrm已正确安装。` };
    }
  });

  ipcMain.handle('nrm-current', async () => {
    console.log('执行nrm current命令...');
    try {
      // 尝试多种方式执行命令
      let result;
      
      // 方式1: 直接执行
      try {
        console.log('尝试直接执行nrm current');
        result = await execAsync('nrm current');
      } catch (e) {
        console.log('直接执行失败，尝试cmd /c方式');
        
        // 方式2: 使用cmd /c
        try {
          console.log('尝试使用cmd /c执行nrm current');
          const options: ExecOptions = { windowsHide: true };
          result = await execAsync('cmd /c nrm current', options);
        } catch (e2) {
          console.log('cmd /c执行失败，尝试npx方式');
          
          // 方式3: 使用npx
          try {
            console.log('尝试使用npx执行nrm current');
            const options: ExecOptions = { windowsHide: true };
            result = await execAsync('npx nrm current', options);
          } catch (e3) {
            console.log('npx执行失败，尝试PowerShell');
            
            // 方式4: 使用PowerShell
            try {
              console.log('尝试使用PowerShell执行nrm current');
              const options: ExecOptions = { windowsHide: true };
              result = await execAsync('powershell.exe -Command "nrm current"', options);
            } catch (e4) {
              console.log('PowerShell执行失败');
              throw e4; // 所有方法都失败，抛出最后一个错误
            }
          }
        }
      }
      
      const { stdout, stderr } = result;
      console.log('nrm current命令输出:', stdout);
      
      if (stderr && stderr.trim() !== '') {
        console.error('nrm current命令错误:', stderr);
        return { error: stderr };
      }
      
      return { data: stdout };
    } catch (error: any) {
      console.error('执行nrm current命令失败:', error);
      return { error: error.message || '执行命令失败' };
    }
  });

  ipcMain.handle('nrm-use', async (_, name) => {
    const { stdout, stderr } = await execAsync(`nrm use ${name}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  ipcMain.handle('nrm-add', async (_, name, url) => {
    const { stdout, stderr } = await execAsync(`nrm add ${name} ${url}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  ipcMain.handle('nrm-del', async (_, name) => {
    const { stdout, stderr } = await execAsync(`nrm del ${name}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

  ipcMain.handle('nrm-test', async (_, name) => {
    const { stdout, stderr } = await execAsync(`nrm test ${name}`)
    if (stderr) return { error: stderr }
    return { data: stdout }
  })

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

  // 系统环境变量管理
  ipcMain.handle('get-env-variables', async () => {
    console.log('获取系统环境变量...');
    try {
      // Windows系统使用PowerShell获取环境变量
      if (process.platform === 'win32') {
        // 获取用户环境变量
        const userResult = await execAsync(
          'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'User\') | ConvertTo-Json"',
          { windowsHide: true }
        );
        
        // 获取系统环境变量
        const systemResult = await execAsync(
          'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'Machine\') | ConvertTo-Json"',
          { windowsHide: true }
        );
        
        let userVars = {};
        let systemVars = {};
        
        try {
          userVars = JSON.parse(userResult.stdout);
        } catch (e) {
          console.error('解析用户环境变量失败:', e);
        }
        
        try {
          systemVars = JSON.parse(systemResult.stdout);
        } catch (e) {
          console.error('解析系统环境变量失败:', e);
        }
        
        // 转换为数组格式
        const userVarArray = Object.entries(userVars).map(([name, value]) => ({
          name,
          value: String(value),
          type: 'user'
        }));
        
        const systemVarArray = Object.entries(systemVars).map(([name, value]) => ({
          name,
          value: String(value),
          type: 'system'
        }));
        
        return { data: [...userVarArray, ...systemVarArray] };
      } 
      // Linux/macOS系统
      else {
        // 获取所有环境变量
        const result = await execAsync('printenv');
        
        // 解析环境变量
        const envVars = result.stdout.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [name, ...valueParts] = line.split('=');
            const value = valueParts.join('=');
            return {
              name,
              value,
              // 在Linux/macOS中无法轻易区分用户和系统变量，默认为用户变量
              type: 'user'
            };
          });
        
        return { data: envVars };
      }
    } catch (error: any) {
      console.error('获取环境变量失败:', error);
      return { error: error.message || '获取环境变量失败' };
    }
  });

  ipcMain.handle('set-env-variable', async (_, name, value, type) => {
    console.log(`设置环境变量: ${name}=${value} (${type})`);
    try {
      // Windows系统
      if (process.platform === 'win32') {
        const scope = type === 'user' ? 'User' : 'Machine';
        
        // 使用PowerShell设置环境变量
        const command = `powershell.exe -Command "[Environment]::SetEnvironmentVariable('${name}', '${value}', '${scope}')"`;
        
        // 需要管理员权限才能设置系统环境变量
        if (type === 'system') {
          // 这里可能需要提示用户以管理员身份运行
          console.warn('设置系统环境变量需要管理员权限');
        }
        
        await execAsync(command, { windowsHide: true });
        return { success: true };
      } 
      // Linux/macOS系统
      else {
        // 在Linux/macOS中，通常通过修改配置文件来永久设置环境变量
        // 这里只是临时设置，实际应用中应该修改~/.bashrc或/etc/environment等文件
        process.env[name] = value;
        return { success: true, warning: '在Linux/macOS中，这只是临时设置环境变量' };
      }
    } catch (error: any) {
      console.error('设置环境变量失败:', error);
      return { error: error.message || '设置环境变量失败' };
    }
  });

  ipcMain.handle('delete-env-variable', async (_, name, type) => {
    console.log(`删除环境变量: ${name} (${type})`);
    try {
      // Windows系统
      if (process.platform === 'win32') {
        const scope = type === 'user' ? 'User' : 'Machine';
        
        // 使用PowerShell删除环境变量
        const command = `powershell.exe -Command "[Environment]::SetEnvironmentVariable('${name}', $null, '${scope}')"`;
        
        // 需要管理员权限才能删除系统环境变量
        if (type === 'system') {
          // 这里可能需要提示用户以管理员身份运行
          console.warn('删除系统环境变量需要管理员权限');
        }
        
        await execAsync(command, { windowsHide: true });
        return { success: true };
      } 
      // Linux/macOS系统
      else {
        // 在Linux/macOS中，通常通过修改配置文件来永久删除环境变量
        // 这里只是临时删除，实际应用中应该修改~/.bashrc或/etc/environment等文件
        delete process.env[name];
        return { success: true, warning: '在Linux/macOS中，这只是临时删除环境变量' };
      }
    } catch (error: any) {
      console.error('删除环境变量失败:', error);
      return { error: error.message || '删除环境变量失败' };
    }
  });

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
