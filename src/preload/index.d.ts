import { ElectronAPI } from '@electron-toolkit/preload'
import { join } from 'path'
import { execAsync } from '../utils/execAsync'
import { homedir } from 'os'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
        toggleAlwaysOnTop: () => Promise<boolean>
        isAlwaysOnTop: () => Promise<boolean>
      }
      nodeManager: {
        // nvm相关操作
        getInstalledVersions: () => Promise<any>
        getAvailableVersions: () => Promise<any>
        installVersion: (version: string) => Promise<any>
        useVersion: (version: string) => Promise<any>
        uninstallVersion: (version: string) => Promise<any>
        // npm镜像管理
        getNpmMirrors: () => Promise<any>
        getCurrentMirror: () => Promise<any>
        useMirror: (name: string) => Promise<any>
        addMirror: (name: string, url: string) => Promise<any>
        deleteMirror: (name: string) => Promise<any>
        testMirror: (name: string) => Promise<any>
      }
      envManager: {
        getEnvVariables: () => Promise<any>
        setEnvVariable: (name: string, value: string, type: 'user' | 'system') => Promise<any>
        deleteEnvVariable: (name: string, type: 'user' | 'system') => Promise<any>
      }
      projectManager: {
        checkPath: (path: string) => Promise<any>
        listDirectory: (path: string) => Promise<any>
        readPackageJson: (path: string) => Promise<any>
        cloneRepository: (url: string, path: string) => Promise<any>
        getGitInfo: (path: string) => Promise<any>
        runCommand: (command: string, cwd: string) => Promise<any>
        getStats: (path: string) => Promise<any>
        selectDirectory: () => Promise<any>
      }
    }
  }
}

const scriptPath = join(__dirname, '../../scripts')
const userHome = homedir()

ipcMain.handle('nvm-list', async () => {
  try {
    // 尝试多种方式执行命令
    let result
    
    // 方式1: 使用完整路径
    try {
      const nvmPath = `${userHome}\\AppData\\Roaming\\nvm\\nvm.exe`
      console.log('尝试使用完整路径执行nvm:', nvmPath)
      result = await execAsync(`"${nvmPath}" list`, { shell: true })
    } catch (e) {
      console.log('完整路径执行失败，尝试其他方式')
      
      // 方式2: 使用cmd /c
      try {
        console.log('尝试使用cmd /c执行nvm')
        result = await execAsync('cmd /c nvm list', { shell: true })
      } catch (e2) {
        console.log('cmd /c执行失败，尝试PowerShell')
        
        // 方式3: 使用PowerShell
        result = await execAsync('powershell.exe -Command "nvm list"', { shell: true })
      }
    }
    
    const { stdout, stderr } = result
    console.log('NVM list输出:', stdout)
    
    if (stderr && stderr.trim() !== '') {
      console.error('NVM list错误:', stderr)
      return { error: stderr }
    }
    
    return { data: stdout }
  } catch (error) {
    console.error('执行nvm list最终失败:', error)
    return { 
      error: `无法执行nvm命令: ${error.message || '未知错误'}。请确认nvm已正确安装并添加到PATH环境变量。` 
    }
  }
})
