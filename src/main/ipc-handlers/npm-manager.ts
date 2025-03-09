import { ipcMain } from 'electron';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * 注册NPM镜像管理相关的IPC处理程序
 */
export function registerNpmManagerHandlers(): void {
  // 获取NPM镜像列表
  ipcMain.handle('npm-get-registry-list', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nrm命令获取NPM镜像列表
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nrm ls');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nrm ls', options);
          }
        } else {
          // Unix/Linux/macOS平台
          try {
            result = await execAsync('nrm ls');
          } catch (error) {
            // 尝试使用npx
            result = await execAsync('npx nrm ls', options);
          }
        }
      } catch (error) {
        console.error('获取NPM镜像列表失败:', error);
        return { error: '无法获取NPM镜像列表，请确保已安装nrm' };
      }
      
      // 解析nrm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      const lines = stdout.split('\n').filter(Boolean);
      const registries: Array<{ name: string; url: string; current: boolean }> = [];
      
      for (const line of lines) {
        const match = line.match(/\*?\s+(\S+)\s+(\S+)/);
        if (match) {
          const [_, name, url] = match;
          const current = line.includes('*');
          registries.push({ name, url, current });
        }
      }
      
      return { registries };
    } catch (error: any) {
      console.error('获取NPM镜像列表失败:', error);
      return { error: error.message };
    }
  });

  // 获取当前NPM镜像
  ipcMain.handle('npm-get-current-registry', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nrm命令获取当前NPM镜像
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nrm current');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nrm current', options);
          }
        } else {
          // Unix/Linux/macOS平台
          try {
            result = await execAsync('nrm current');
          } catch (error) {
            // 尝试使用npx
            result = await execAsync('npx nrm current', options);
          }
        }
      } catch (error) {
        console.error('获取当前NPM镜像失败:', error);
        
        // 尝试使用npm命令获取当前镜像
        try {
          const { stdout } = await execAsync('npm config get registry');
          return { registry: stdout.trim() };
        } catch (npmError) {
          console.error('使用npm获取当前镜像失败:', npmError);
          return { error: '无法获取当前NPM镜像' };
        }
      }
      
      // 解析nrm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      const registry = stdout.trim();
      
      return { registry };
    } catch (error: any) {
      console.error('获取当前NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  // 切换NPM镜像
  ipcMain.handle('npm-use-registry', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm use ${name}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('切换NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  // 添加NPM镜像
  ipcMain.handle('npm-add-registry', async (_, name, url) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm add ${name} ${url}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('添加NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  // 删除NPM镜像
  ipcMain.handle('npm-delete-registry', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm del ${name}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('删除NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  // 测试NPM镜像速度
  ipcMain.handle('npm-test-registry', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm test ${name}`)
      return { success: true, stdout, stderr };
    } catch (error: any) {
      console.error('测试NPM镜像速度失败:', error);
      return { error: error.message };
    }
  });
  
  // 同时注册旧的处理程序名称，以便与前端代码保持兼容
  ipcMain.handle('nrm-list', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nrm命令获取NPM镜像列表
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nrm ls');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nrm ls', options);
          }
        } else {
          // Unix/Linux/macOS平台
          try {
            result = await execAsync('nrm ls');
          } catch (error) {
            // 尝试使用npx
            result = await execAsync('npx nrm ls', options);
          }
        }
      } catch (error) {
        console.error('获取NPM镜像列表失败:', error);
        return { error: '无法获取NPM镜像列表，请确保已安装nrm' };
      }
      
      // 解析nrm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      return { data: stdout };
    } catch (error: any) {
      console.error('获取NPM镜像列表失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nrm-current', async () => {
    try {
      const platform = process.platform;
      let result: { stdout: string; stderr: string } | string = '';
      let options = {};
      
      // 尝试使用nrm命令获取当前NPM镜像
      try {
        if (platform === 'win32') {
          // Windows平台
          try {
            result = await execAsync('nrm current');
          } catch (error) {
            // 尝试使用cmd
            result = await execAsync('cmd /c nrm current', options);
          }
        } else {
          // Unix/Linux/macOS平台
          try {
            result = await execAsync('nrm current');
          } catch (error) {
            // 尝试使用npx
            result = await execAsync('npx nrm current', options);
          }
        }
      } catch (error) {
        console.error('获取当前NPM镜像失败:', error);
        
        // 尝试使用npm命令获取当前镜像
        try {
          const { stdout } = await execAsync('npm config get registry');
          return { data: stdout.trim() };
        } catch (npmError) {
          console.error('使用npm获取当前镜像失败:', npmError);
          return { error: '无法获取当前NPM镜像' };
        }
      }
      
      // 解析nrm输出
      const stdout = typeof result === 'string' ? result : result.stdout;
      return { data: stdout.trim() };
    } catch (error: any) {
      console.error('获取当前NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nrm-use', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm use ${name}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('切换NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nrm-add', async (_, name, url) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm add ${name} ${url}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('添加NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nrm-del', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm del ${name}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('删除NPM镜像失败:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('nrm-test', async (_, name) => {
    try {
      const { stdout, stderr } = await execAsync(`nrm test ${name}`)
      if (stderr) return { error: stderr }
      return { data: stdout }
    } catch (error: any) {
      console.error('测试NPM镜像速度失败:', error);
      return { error: error.message };
    }
  });
} 