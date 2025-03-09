import { ProjectType, ProjectTypeHandler, Project, ProjectDetails, ProjectTask } from './types';

// React项目处理器
const reactHandler: ProjectTypeHandler = {
  type: ProjectType.REACT,
  name: 'React',
  icon: 'react-icon',
  
  // 检测项目类型
  async detectType(path: string): Promise<boolean> {
    try {
      // 通过IPC调用检查package.json是否存在
      const packageJsonResult = await window.api.projectManager.readPackageJson(path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return false;
      }
      
      // 检查是否有React依赖
      const packageJson = packageJsonResult.packageJson;
      return !!(
        (packageJson.dependencies && packageJson.dependencies.react) ||
        (packageJson.devDependencies && packageJson.devDependencies.react)
      );
    } catch (error) {
      console.error('检测React项目类型失败:', error);
      return false;
    }
  },
  
  // 获取项目详情
  async getDetails(project: Project): Promise<Partial<ProjectDetails>> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return {};
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取依赖
      const dependencies: Array<{name: string; version: string; type: 'dev' | 'prod'}> = [];
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({ name, version: version as string, type: 'prod' });
        }
      }
      
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({ name, version: version as string, type: 'dev' });
        }
      }
      
      // 获取可用任务
      const tasks = await this.getAvailableTasks(project);
      
      // 获取项目统计信息
      const statsResult = await window.api.projectManager.getStats(project.path);
      const stats = statsResult.error ? undefined : statsResult;
      
      return {
        dependencies,
        tasks,
        stats
      };
    } catch (error) {
      console.error('获取React项目详情失败:', error);
      return {};
    }
  },
  
  // 获取可用任务
  async getAvailableTasks(project: Project): Promise<ProjectTask[]> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return [];
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取scripts
      const tasks: ProjectTask[] = [];
      if (packageJson.scripts) {
        for (const [name, command] of Object.entries(packageJson.scripts)) {
          tasks.push({
            id: `script-${name}`,
            name: `npm run ${name}`,
            command: `cd "${project.path}" && npm run ${name}`,
            description: `运行 npm script: ${name}`
          });
        }
      }
      
      // 添加一些通用任务
      tasks.push({
        id: 'install',
        name: 'npm install',
        command: `cd "${project.path}" && npm install`,
        description: '安装依赖'
      });
      
      tasks.push({
        id: 'start',
        name: 'npm start',
        command: `cd "${project.path}" && npm start`,
        description: '启动开发服务器'
      });
      
      tasks.push({
        id: 'build',
        name: 'npm run build',
        command: `cd "${project.path}" && npm run build`,
        description: '构建生产版本'
      });
      
      return tasks;
    } catch (error) {
      console.error('获取React项目任务失败:', error);
      return [];
    }
  },
  
  // 运行任务
  async runTask(project: Project, task: ProjectTask): Promise<void> {
    try {
      // 通过IPC调用运行命令
      await window.api.projectManager.runCommand(task.command, project.path);
      return Promise.resolve();
    } catch (error) {
      console.error('运行React项目任务失败:', error);
      throw error;
    }
  }
};

// Vue项目处理器
const vueHandler: ProjectTypeHandler = {
  type: ProjectType.VUE,
  name: 'Vue',
  icon: 'vue-icon',
  
  // 检测项目类型
  async detectType(path: string): Promise<boolean> {
    try {
      // 通过IPC调用检查package.json是否存在
      const packageJsonResult = await window.api.projectManager.readPackageJson(path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return false;
      }
      
      // 检查是否有Vue依赖
      const packageJson = packageJsonResult.packageJson;
      return !!(
        (packageJson.dependencies && packageJson.dependencies.vue) ||
        (packageJson.devDependencies && packageJson.devDependencies.vue)
      );
    } catch (error) {
      console.error('检测Vue项目类型失败:', error);
      return false;
    }
  },
  
  // 获取项目详情
  async getDetails(project: Project): Promise<Partial<ProjectDetails>> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return {};
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取依赖
      const dependencies: Array<{name: string; version: string; type: 'dev' | 'prod'}> = [];
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({ name, version: version as string, type: 'prod' });
        }
      }
      
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({ name, version: version as string, type: 'dev' });
        }
      }
      
      // 获取可用任务
      const tasks = await this.getAvailableTasks(project);
      
      // 获取项目统计信息
      const statsResult = await window.api.projectManager.getStats(project.path);
      const stats = statsResult.error ? undefined : statsResult;
      
      return {
        dependencies,
        tasks,
        stats
      };
    } catch (error) {
      console.error('获取Vue项目详情失败:', error);
      return {};
    }
  },
  
  // 获取可用任务
  async getAvailableTasks(project: Project): Promise<ProjectTask[]> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return [];
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取scripts
      const tasks: ProjectTask[] = [];
      if (packageJson.scripts) {
        for (const [name, command] of Object.entries(packageJson.scripts)) {
          tasks.push({
            id: `script-${name}`,
            name: `npm run ${name}`,
            command: `cd "${project.path}" && npm run ${name}`,
            description: `运行 npm script: ${name}`
          });
        }
      }
      
      // 添加一些通用任务
      tasks.push({
        id: 'install',
        name: 'npm install',
        command: `cd "${project.path}" && npm install`,
        description: '安装依赖'
      });
      
      tasks.push({
        id: 'serve',
        name: 'npm run serve',
        command: `cd "${project.path}" && npm run serve`,
        description: '启动开发服务器'
      });
      
      tasks.push({
        id: 'build',
        name: 'npm run build',
        command: `cd "${project.path}" && npm run build`,
        description: '构建生产版本'
      });
      
      return tasks;
    } catch (error) {
      console.error('获取Vue项目任务失败:', error);
      return [];
    }
  },
  
  // 运行任务
  async runTask(project: Project, task: ProjectTask): Promise<void> {
    try {
      // 通过IPC调用运行命令
      await window.api.projectManager.runCommand(task.command, project.path);
      return Promise.resolve();
    } catch (error) {
      console.error('运行Vue项目任务失败:', error);
      throw error;
    }
  }
};

// Node.js项目处理器
const nodeHandler: ProjectTypeHandler = {
  type: ProjectType.NODE,
  name: 'Node.js',
  icon: 'node-icon',
  
  // 检测项目类型
  async detectType(path: string): Promise<boolean> {
    try {
      // 通过IPC调用检查package.json是否存在
      const packageJsonResult = await window.api.projectManager.readPackageJson(path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return false;
      }
      
      // 检查是否有main字段或bin字段
      const packageJson = packageJsonResult.packageJson;
      return !!(packageJson.main || packageJson.bin);
    } catch (error) {
      console.error('检测Node.js项目类型失败:', error);
      return false;
    }
  },
  
  // 获取项目详情
  async getDetails(project: Project): Promise<Partial<ProjectDetails>> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return {};
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取依赖
      const dependencies: Array<{name: string; version: string; type: 'dev' | 'prod'}> = [];
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({ name, version: version as string, type: 'prod' });
        }
      }
      
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({ name, version: version as string, type: 'dev' });
        }
      }
      
      // 获取可用任务
      const tasks = await this.getAvailableTasks(project);
      
      // 获取项目统计信息
      const statsResult = await window.api.projectManager.getStats(project.path);
      const stats = statsResult.error ? undefined : statsResult;
      
      return {
        dependencies,
        tasks,
        stats
      };
    } catch (error) {
      console.error('获取Node.js项目详情失败:', error);
      return {};
    }
  },
  
  // 获取可用任务
  async getAvailableTasks(project: Project): Promise<ProjectTask[]> {
    try {
      // 通过IPC调用读取package.json
      const packageJsonResult = await window.api.projectManager.readPackageJson(project.path);
      
      if (!packageJsonResult.exists || packageJsonResult.error) {
        return [];
      }
      
      const packageJson = packageJsonResult.packageJson;
      
      // 提取scripts
      const tasks: ProjectTask[] = [];
      if (packageJson.scripts) {
        for (const [name, command] of Object.entries(packageJson.scripts)) {
          tasks.push({
            id: `script-${name}`,
            name: `npm run ${name}`,
            command: `cd "${project.path}" && npm run ${name}`,
            description: `运行 npm script: ${name}`
          });
        }
      }
      
      // 添加一些通用任务
      tasks.push({
        id: 'install',
        name: 'npm install',
        command: `cd "${project.path}" && npm install`,
        description: '安装依赖'
      });
      
      // 如果有main字段，添加启动任务
      if (packageJson.main) {
        tasks.push({
          id: 'start',
          name: 'node start',
          command: `cd "${project.path}" && node ${packageJson.main}`,
          description: '启动Node.js应用'
        });
      }
      
      // 如果有test脚本，添加测试任务
      if (packageJson.scripts && packageJson.scripts.test) {
        tasks.push({
          id: 'test',
          name: 'npm test',
          command: `cd "${project.path}" && npm test`,
          description: '运行测试'
        });
      }
      
      return tasks;
    } catch (error) {
      console.error('获取Node.js项目任务失败:', error);
      return [];
    }
  },
  
  // 运行任务
  async runTask(project: Project, task: ProjectTask): Promise<void> {
    try {
      // 通过IPC调用运行命令
      await window.api.projectManager.runCommand(task.command, project.path);
      return Promise.resolve();
    } catch (error) {
      console.error('运行Node.js项目任务失败:', error);
      throw error;
    }
  }
};

// Python项目处理器
const pythonHandler: ProjectTypeHandler = {
  type: ProjectType.PYTHON,
  name: 'Python',
  icon: 'python-icon',
  
  // 检测项目类型
  async detectType(path: string): Promise<boolean> {
    try {
      // 通过IPC调用检查文件是否存在
      const requirementsTxtResult = await window.api.projectManager.checkPath(`${path}/requirements.txt`);
      const setupPyResult = await window.api.projectManager.checkPath(`${path}/setup.py`);
      const pipfileResult = await window.api.projectManager.checkPath(`${path}/Pipfile`);
      
      return !!(
        (requirementsTxtResult.exists) ||
        (setupPyResult.exists) ||
        (pipfileResult.exists)
      );
    } catch (error) {
      console.error('检测Python项目类型失败:', error);
      return false;
    }
  },
  
  // 获取项目详情
  async getDetails(project: Project): Promise<Partial<ProjectDetails>> {
    try {
      // 获取可用任务
      const tasks = await this.getAvailableTasks(project);
      
      // 获取项目统计信息
      const statsResult = await window.api.projectManager.getStats(project.path);
      const stats = statsResult.error ? undefined : statsResult;
      
      return {
        tasks,
        stats
      };
    } catch (error) {
      console.error('获取Python项目详情失败:', error);
      return {};
    }
  },
  
  // 获取可用任务
  async getAvailableTasks(project: Project): Promise<ProjectTask[]> {
    const tasks: ProjectTask[] = [];
    
    // 检查是否有requirements.txt
    const requirementsTxtResult = await window.api.projectManager.checkPath(`${project.path}/requirements.txt`);
    if (requirementsTxtResult.exists) {
      tasks.push({
        id: 'install-requirements',
        name: 'pip install -r requirements.txt',
        command: `cd "${project.path}" && pip install -r requirements.txt`,
        description: '安装依赖'
      });
    }
    
    // 检查是否有setup.py
    const setupPyResult = await window.api.projectManager.checkPath(`${project.path}/setup.py`);
    if (setupPyResult.exists) {
      tasks.push({
        id: 'install-dev',
        name: 'pip install -e .',
        command: `cd "${project.path}" && pip install -e .`,
        description: '以开发模式安装包'
      });
    }
    
    // 检查是否有Pipfile
    const pipfileResult = await window.api.projectManager.checkPath(`${project.path}/Pipfile`);
    if (pipfileResult.exists) {
      tasks.push({
        id: 'pipenv-install',
        name: 'pipenv install',
        command: `cd "${project.path}" && pipenv install`,
        description: '使用Pipenv安装依赖'
      });
      
      tasks.push({
        id: 'pipenv-shell',
        name: 'pipenv shell',
        command: `cd "${project.path}" && pipenv shell`,
        description: '激活Pipenv虚拟环境'
      });
    }
    
    // 添加一些通用任务
    tasks.push({
      id: 'python-run',
      name: 'Run Python Script',
      command: `cd "${project.path}" && python`,
      description: '运行Python脚本'
    });
    
    return tasks;
  },
  
  // 运行任务
  async runTask(project: Project, task: ProjectTask): Promise<void> {
    try {
      // 通过IPC调用运行命令
      await window.api.projectManager.runCommand(task.command, project.path);
      return Promise.resolve();
    } catch (error) {
      console.error('运行Python项目任务失败:', error);
      throw error;
    }
  }
};

// 其他类型项目处理器
const otherHandler: ProjectTypeHandler = {
  type: ProjectType.OTHER,
  name: '其他',
  icon: 'other-icon',
  
  // 检测项目类型
  async detectType(path: string): Promise<boolean> {
    // 默认处理器，总是返回true
    return true;
  },
  
  // 获取项目详情
  async getDetails(project: Project): Promise<Partial<ProjectDetails>> {
    try {
      // 获取可用任务
      const tasks = await this.getAvailableTasks(project);
      
      // 获取项目统计信息
      const statsResult = await window.api.projectManager.getStats(project.path);
      const stats = statsResult.error ? undefined : statsResult;
      
      return {
        tasks,
        stats
      };
    } catch (error) {
      console.error('获取其他项目详情失败:', error);
      return {};
    }
  },
  
  // 获取可用任务
  async getAvailableTasks(project: Project): Promise<ProjectTask[]> {
    // 对于其他类型的项目，提供一些基本任务
    return [
      {
        id: 'open-folder',
        name: '打开文件夹',
        command: `explorer "${project.path}"`,
        description: '在文件资源管理器中打开项目文件夹'
      }
    ];
  },
  
  // 运行任务
  async runTask(project: Project, task: ProjectTask): Promise<void> {
    try {
      // 通过IPC调用运行命令
      await window.api.projectManager.runCommand(task.command, project.path);
      return Promise.resolve();
    } catch (error) {
      console.error('运行其他项目任务失败:', error);
      throw error;
    }
  }
};

// 导出所有项目类型处理器
export const projectTypeHandlers: ProjectTypeHandler[] = [
  reactHandler,
  vueHandler,
  nodeHandler,
  pythonHandler,
  otherHandler
];

// 根据路径自动检测项目类型
export async function detectProjectType(path: string): Promise<ProjectType> {
  for (const handler of projectTypeHandlers) {
    if (handler.type !== ProjectType.OTHER && await handler.detectType(path)) {
      return handler.type;
    }
  }
  
  return ProjectType.OTHER;
} 