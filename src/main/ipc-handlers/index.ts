import { registerProjectManagerHandlers } from './project-manager';
import { registerEnvManagerHandlers } from './env-manager';
import { registerNodeManagerHandlers } from './node-manager';
import { registerNpmManagerHandlers } from './npm-manager';
import { registerWindowManagerHandlers } from './window-manager';

/**
 * 注册所有IPC处理程序
 */
export function registerAllHandlers(): void {
  // 注册项目管理相关的IPC处理程序
  registerProjectManagerHandlers();
  
  // 注册环境变量管理相关的IPC处理程序
  registerEnvManagerHandlers();
  
  // 注册Node.js环境管理相关的IPC处理程序
  registerNodeManagerHandlers();
  
  // 注册NPM镜像管理相关的IPC处理程序
  registerNpmManagerHandlers();
  
  // 注册窗口控制相关的IPC处理程序
  registerWindowManagerHandlers();
} 