import { ipcMain } from 'electron';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * 从网站获取可用的Node.js版本
 */
async function fetchNodeVersionsFromWebsite(): Promise<string[]> {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('https://nodejs.org/dist/index.json');
    const data = await response.json();
    
    return data
      .map((item: any) => item.version.replace('v', ''))
      .sort((a: string, b: string) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) {
            return bParts[i] - aParts[i];
          }
        }
        
        return 0;
      });
  } catch (error) {
    console.error('获取Node.js版本列表失败:', error);
    return [];
  }
}

/**
 * 注册Node.js环境管理相关的IPC处理程序
 */
export function registerNodeManagerHandlers(): void {
  // 获取已安装的Node.js版本
  ipcMain.handle('node-get-installed-versions', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nvm命令获取已安装的Node.js版本
      try {
        if (platform === 'win32') {
          // Windows平台
          // 尝试找到nvm-windows的安装路径
          const nvmPath = process.env.NVM_HOME || path.join(os.homedir(), 'AppData', 'Roaming', 'nvm', 'nvm.exe');
          
          if (fs.existsSync(nvmPath)) {
            result = await execAsync('nvm list');
          } else {
            // 尝试使用cmd
            result = await execAsync('cmd /c nvm list', options);
          }
        } else {
          // Unix/Linux/macOS平台
          result = await execAsync('nvm list');
        }
      } catch (error) {
        console.error('使用nvm获取Node.js版本失败:', error);
        
        // 尝试使用node命令获取当前版本
        try {
          const { stdout } = await execAsync('node --version');
          return {
            versions: [{ version: stdout.trim().replace('v', ''), current: true }]
          };
        } catch (nodeError) {
          console.error('获取Node.js版本失败:', nodeError);
          return { error: '无法获取已安装的Node.js版本' };
        }
      }
      
      // 解析nvm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      const versions = stdout
        .split('\n')
        .filter(line => line.includes('v'))
        .map(line => {
          const version = line.match(/v(\d+\.\d+\.\d+)/)?.[1] || '';
          const current = line.includes('*') || line.includes('(current)');
          return { version, current };
        })
        .filter(item => item.version);
      
      return { versions };
    } catch (error: any) {
      console.error('获取已安装的Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  // 获取可用的Node.js版本
  ipcMain.handle('node-get-available-versions', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nvm命令获取可用的Node.js版本
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nvm list available');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nvm list available', options);
          }
        } else {
          // Unix/Linux/macOS平台
          result = await execAsync('nvm ls-remote --no-colors');
        }
        
        // 解析nvm输出
        const stdout = typeof result === 'string' ? result : result.stdout;
        const versions = stdout
          .split('\n')
          .filter(line => line.includes('v'))
          .map(line => {
            const match = line.match(/v(\d+\.\d+\.\d+)/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[];
        
        return { versions };
      } catch (error) {
        console.error('使用nvm获取可用Node.js版本失败:', error);
        
        // 从网站获取可用版本
        const versions = await fetchNodeVersionsFromWebsite();
        return { versions };
      }
    } catch (error: any) {
      console.error('获取可用的Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  // 安装Node.js版本
  ipcMain.handle('node-install-version', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm install ${version}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('安装Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  // 使用Node.js版本
  ipcMain.handle('node-use-version', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm use ${version}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('切换Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  // 卸载Node.js版本
  ipcMain.handle('node-uninstall-version', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm uninstall ${version}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('卸载Node.js版本失败:', error);
      return { error: error.message };
    }
  });
  
  // 同时注册旧的处理程序名称，以便与前端代码保持兼容
  ipcMain.handle('nvm-list', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nvm命令获取已安装的Node.js版本
      try {
        if (platform === 'win32') {
          // Windows平台
          // 尝试找到nvm-windows的安装路径
          const nvmPath = process.env.NVM_HOME || path.join(os.homedir(), 'AppData', 'Roaming', 'nvm', 'nvm.exe');
          
          if (fs.existsSync(nvmPath)) {
            result = await execAsync('nvm list');
          } else {
            // 尝试使用cmd
            result = await execAsync('cmd /c nvm list', options);
          }
        } else {
          // Unix/Linux/macOS平台
          result = await execAsync('nvm list');
        }
      } catch (error) {
        console.error('使用nvm获取Node.js版本失败:', error);
        
        // 尝试使用node命令获取当前版本
        try {
          const { stdout } = await execAsync('node --version');
          return { data: stdout };
        } catch (nodeError) {
          console.error('获取Node.js版本失败:', nodeError);
          return { error: '无法获取已安装的Node.js版本' };
        }
      }
      
      // 解析nvm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      return { data: stdout };
    } catch (error: any) {
      console.error('获取已安装的Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nvm-list-available', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nvm命令获取可用的Node.js版本
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nvm list available');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nvm list available', options);
          }
        } else {
          // Unix/Linux/macOS平台
          result = await execAsync('nvm ls-remote --no-colors');
        }
        
        // 解析nvm输出
        const stdout = typeof result === 'string' ? result : result.stdout;
        return { data: stdout };
      } catch (error) {
        console.error('使用nvm获取可用Node.js版本失败:', error);
        
        // 从网站获取可用版本
        const versions = await fetchNodeVersionsFromWebsite();
        return { data: versions.join('\n') };
      }
    } catch (error: any) {
      console.error('获取可用的Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nvm-install', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm install ${version}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('安装Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nvm-use', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm use ${version}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('切换Node.js版本失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nvm-uninstall', async (_, version) => {
    try {
      const { stdout, stderr } = await execAsync(`nvm uninstall ${version}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('卸载Node.js版本失败:', error);
      return { error: error.message };
    }
  });
} 