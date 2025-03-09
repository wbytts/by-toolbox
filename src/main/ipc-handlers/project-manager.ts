import { ipcMain } from 'electron';
import * as fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * 注册项目管理相关的IPC处理程序
 */
export function registerProjectManagerHandlers(): void {
  // 检查路径是否存在
  ipcMain.handle('project-check-path', async (_, path) => {
    try {
      const exists = fs.existsSync(path);
      return { exists };
    } catch (error: any) {
      console.error('检查路径失败:', error);
      return { error: error.message };
    }
  });

  // 列出目录内容
  ipcMain.handle('project-list-directory', async (_, path) => {
    try {
      const items = fs.readdirSync(path, { withFileTypes: true });
      const result = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: join(path, item.name)
      }));
      return { items: result };
    } catch (error: any) {
      console.error('列出目录内容失败:', error);
      return { error: error.message };
    }
  });

  // 读取package.json
  ipcMain.handle('project-read-package-json', async (_, path) => {
    try {
      const packageJsonPath = join(path, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return { exists: false };
      }
      
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      return { exists: true, packageJson };
    } catch (error: any) {
      console.error('读取package.json失败:', error);
      return { error: error.message };
    }
  });

  // 克隆Git仓库
  ipcMain.handle('project-clone-repository', async (_, url, path) => {
    try {
      // 这里应该使用git命令克隆仓库
      // 暂时使用模拟实现
      return { success: true, path };
    } catch (error: any) {
      console.error('克隆仓库失败:', error);
      return { error: error.message };
    }
  });

  // 获取Git信息
  ipcMain.handle('project-get-git-info', async (_, path) => {
    try {
      console.log('获取Git信息，路径:', path);
      
      // 检查路径是否存在
      if (!fs.existsSync(path)) {
        console.log('路径不存在:', path);
        return { error: '路径不存在' };
      }
      
      // 检查.git目录是否存在
      const gitDir = join(path, '.git');
      if (!fs.existsSync(gitDir)) {
        console.log('.git目录不存在:', gitDir);
        return { error: '不是Git仓库，.git目录不存在' };
      }
      
      console.log('开始执行git命令...');
      
      // 检查git命令是否可用
      try {
        const gitVersionCmd = process.platform === 'win32' 
          ? 'cmd /c git --version' 
          : 'git --version';
        
        const { stdout: gitVersion } = await execAsync(gitVersionCmd);
        console.log('Git版本:', gitVersion);
      } catch (versionError: any) {
        console.error('Git命令不可用:', versionError);
        return { error: 'Git命令不可用，请确保已安装Git并添加到PATH中' };
      }
      
      try {
        // 检查是否是Git仓库
        const gitCheckCmd = process.platform === 'win32' 
          ? 'cmd /c git rev-parse --is-inside-work-tree' 
          : 'git rev-parse --is-inside-work-tree';
        
        const { stdout: gitCheck } = await execAsync(gitCheckCmd, { cwd: path });
        console.log('git rev-parse结果:', gitCheck);
        
        if (!gitCheck.trim()) {
          throw new Error('不是有效的Git仓库');
        }
      } catch (checkError: any) {
        console.error('检查Git仓库失败:', checkError);
        return { error: `检查Git仓库失败: ${checkError.message}` };
      }
      
      let branches: { name: string; current: boolean; }[] = [];
      try {
        // 获取分支信息
        const gitBranchCmd = process.platform === 'win32' 
          ? 'cmd /c git branch' 
          : 'git branch';
        
        const { stdout: branchesOutput } = await execAsync(gitBranchCmd, { cwd: path });
        console.log('git branch结果:', branchesOutput);
        
        branches = branchesOutput
          .split('\n')
          .filter(Boolean)
          .map(branch => ({
            name: branch.replace('*', '').trim(),
            current: branch.startsWith('*')
          }));
      } catch (branchError: any) {
        console.error('获取分支信息失败:', branchError);
        // 继续执行，不返回错误
      }
      
      let commits: { hash: string; message: string; author: string; date: string; }[] = [];
      try {
        // 获取最近的提交记录
        let gitLogCmd;
        if (process.platform === 'win32') {
          gitLogCmd = 'cmd /c git log -10 --pretty=format:"%H|%s|%an|%aI"';
        } else {
          gitLogCmd = 'git log -10 --pretty=format:"%H|%s|%an|%aI"';
        }
        
        const { stdout: commitsOutput } = await execAsync(gitLogCmd, { cwd: path });
        console.log('git log结果:', commitsOutput);
        
        commits = commitsOutput
          .split('\n')
          .filter(Boolean)
          .map(commit => {
            const [hash, message, author, date] = commit.split('|');
            return {
              hash: hash.substring(0, 7),
              message,
              author,
              date
            };
          });
      } catch (commitError: any) {
        console.error('获取提交记录失败:', commitError);
        // 继续执行，不返回错误
      }
      
      console.log('Git信息获取完成');
      return {
        branches,
        commits
      };
    } catch (error: any) {
      console.error('获取Git信息失败:', error);
      return { error: error.message };
    }
  });

  // 运行命令
  ipcMain.handle('project-run-command', async (_, command, cwd) => {
    try {
      // 这里应该使用child_process执行命令
      // 暂时使用模拟实现
      console.log(`在 ${cwd} 中执行命令: ${command}`);
      return { success: true };
    } catch (error: any) {
      console.error('执行命令失败:', error);
      return { error: error.message };
    }
  });

  // 获取项目统计信息
  ipcMain.handle('project-get-stats', async (_, path) => {
    try {
      // 获取项目统计信息
      let fileCount = 0;
      let directoryCount = 0;
      
      function countItems(dirPath: string) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const itemPath = join(dirPath, item.name);
          
          if (item.isDirectory()) {
            directoryCount++;
            // 忽略node_modules和.git目录
            if (item.name !== 'node_modules' && item.name !== '.git') {
              countItems(itemPath);
            }
          } else {
            fileCount++;
          }
        }
      }
      
      countItems(path);
      
      return {
        fileCount,
        directoryCount
      };
    } catch (error: any) {
      console.error('获取项目统计信息失败:', error);
      return { error: error.message };
    }
  });

  // 添加目录选择对话框处理器
  ipcMain.handle('project-select-directory', async () => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      
      if (result.canceled) {
        return { canceled: true };
      }
      
      return { 
        canceled: false, 
        path: result.filePaths[0] 
      };
    } catch (error: any) {
      console.error('打开目录选择对话框失败:', error);
      return { error: error.message };
    }
  });
} 