import { ipcMain } from 'electron';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * 注册环境变量管理相关的IPC处理程序
 */
export function registerEnvManagerHandlers(): void {
  // 获取环境变量
  ipcMain.handle('get-env-variables', async () => {
    try {
      const platform = process.platform;
      let userEnv: Record<string, string> = {};
      let systemEnv: Record<string, string> = {};
      
      if (platform === 'win32') {
        // Windows平台
        try {
          const userResult = await execAsync(
            'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'User\') | ConvertTo-Json"'
          );
          userEnv = JSON.parse(userResult.stdout);
        } catch (error: any) {
          console.error('获取用户环境变量失败:', error);
        }
        
        try {
          const systemResult = await execAsync(
            'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'Machine\') | ConvertTo-Json"'
          );
          systemEnv = JSON.parse(systemResult.stdout);
        } catch (error: any) {
          console.error('获取系统环境变量失败:', error);
        }
      } else {
        // Unix/Linux/macOS平台
        try {
          const result = await execAsync('printenv');
          const envLines = result.stdout.split('\n');
          
          for (const line of envLines) {
            if (line.trim()) {
              const [key, ...valueParts] = line.split('=');
              const value = valueParts.join('=');
              
              // 简单区分用户和系统环境变量
              // 这只是一个近似值，因为在Unix系统中，区分并不那么明确
              if (key.startsWith('USER') || key.startsWith('HOME') || key.startsWith('PATH')) {
                systemEnv[key] = value;
              } else {
                userEnv[key] = value;
              }
            }
          }
        } catch (error: any) {
          console.error('获取环境变量失败:', error);
        }
      }
      
      // 转换为数组格式，与原来的格式保持一致
      const userVarArray = Object.entries(userEnv).map(([name, value]) => ({
        name,
        value: String(value),
        type: 'user'
      }));
      
      const systemVarArray = Object.entries(systemEnv).map(([name, value]) => ({
        name,
        value: String(value),
        type: 'system'
      }));
      
      return { data: [...userVarArray, ...systemVarArray] };
    } catch (error: any) {
      console.error('获取环境变量失败:', error);
      return { error: error.message };
    }
  });

  // 设置环境变量
  ipcMain.handle('set-env-variable', async (_, name, value, type) => {
    try {
      const platform = process.platform;
      
      if (platform === 'win32') {
        // Windows平台
        const scope = type === 'user' ? 'User' : 'Machine';
        const command = `powershell.exe -Command "[Environment]::SetEnvironmentVariable('${name}', '${value}', '${scope}')"`;
        
        await execAsync(command, { windowsHide: true });
      } else {
        // Unix/Linux/macOS平台
        // 在Unix系统中，通常需要修改配置文件来持久化环境变量
        // 这里只是一个简化的实现
        console.log(`设置环境变量: ${name}=${value} (${type})`);
        process.env[name] = value;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('设置环境变量失败:', error);
      return { error: error.message };
    }
  });

  // 删除环境变量
  ipcMain.handle('delete-env-variable', async (_, name, type) => {
    try {
      const platform = process.platform;
      
      if (platform === 'win32') {
        // Windows平台
        const scope = type === 'user' ? 'User' : 'Machine';
        const command = `powershell.exe -Command "[Environment]::SetEnvironmentVariable('${name}', $null, '${scope}')"`;
        
        await execAsync(command, { windowsHide: true });
      } else {
        // Unix/Linux/macOS平台
        console.log(`删除环境变量: ${name} (${type})`);
        delete process.env[name];
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('删除环境变量失败:', error);
      return { error: error.message };
    }
  });
  
  // 同时注册新的处理程序名称，以便将来迁移
  ipcMain.handle('env-get-variables', async () => {
    try {
      const platform = process.platform;
      let userEnv: Record<string, string> = {};
      let systemEnv: Record<string, string> = {};
      
      if (platform === 'win32') {
        // Windows平台
        try {
          const userResult = await execAsync(
            'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'User\') | ConvertTo-Json"'
          );
          userEnv = JSON.parse(userResult.stdout);
        } catch (error: any) {
          console.error('获取用户环境变量失败:', error);
        }
        
        try {
          const systemResult = await execAsync(
            'powershell.exe -Command "[Environment]::GetEnvironmentVariables(\'Machine\') | ConvertTo-Json"'
          );
          systemEnv = JSON.parse(systemResult.stdout);
        } catch (error: any) {
          console.error('获取系统环境变量失败:', error);
        }
      } else {
        // Unix/Linux/macOS平台
        try {
          const result = await execAsync('printenv');
          const envLines = result.stdout.split('\n');
          
          for (const line of envLines) {
            if (line.trim()) {
              const [key, ...valueParts] = line.split('=');
              const value = valueParts.join('=');
              
              // 简单区分用户和系统环境变量
              if (key.startsWith('USER') || key.startsWith('HOME') || key.startsWith('PATH')) {
                systemEnv[key] = value;
              } else {
                userEnv[key] = value;
              }
            }
          }
        } catch (error: any) {
          console.error('获取环境变量失败:', error);
        }
      }
      
      return {
        user: Object.entries(userEnv).map(([name, value]) => ({ name, value, type: 'user' })),
        system: Object.entries(systemEnv).map(([name, value]) => ({ name, value, type: 'system' }))
      };
    } catch (error: any) {
      console.error('获取环境变量失败:', error);
      return { error: error.message };
    }
  });
} 