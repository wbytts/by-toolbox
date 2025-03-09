// 项目类型枚举
export enum ProjectType {
  REACT = 'react',
  VUE = 'vue',
  ANGULAR = 'angular',
  NODE = 'node',
  PYTHON = 'python',
  JAVA = 'java',
  OTHER = 'other'
}

// 项目来源枚举
export enum ProjectSource {
  LOCAL = 'local',
  GIT = 'git'
}

// 项目状态枚举
export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// 项目接口
export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  type: ProjectType;
  source: ProjectSource;
  sourceUrl?: string;
  status: ProjectStatus;
  lastOpened?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
  customFields?: Record<string, any>;
}

// 项目依赖接口
export interface Dependency {
  name: string;
  version: string;
  type: 'dev' | 'prod';
}

// Git提交信息接口
export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

// Git分支信息接口
export interface GitBranch {
  name: string;
  current: boolean;
}

// 项目统计信息接口
export interface ProjectStats {
  fileCount: number;
  directoryCount: number;
  linesOfCode?: number;
  lastCommitDate?: string;
  commitCount?: number;
}

// 项目任务接口
export interface ProjectTask {
  id: string;
  name: string;
  command: string;
  description?: string;
}

// 项目详细信息接口
export interface ProjectDetails {
  project: Project;
  dependencies?: Dependency[];
  gitBranches?: GitBranch[];
  gitCommits?: GitCommit[];
  stats?: ProjectStats;
  tasks?: ProjectTask[];
}

// 项目管理器状态接口
export interface ProjectManagerState {
  projects: Project[];
  selectedProjectId: string | null;
  projectDetails: ProjectDetails | null;
  loading: boolean;
  error: string | null;
  filter: {
    search: string;
    type: ProjectType | null;
    status: ProjectStatus | null;
    favorite: boolean | null;
  };
}

// 项目类型处理器接口 - 用于扩展不同项目类型的特定功能
export interface ProjectTypeHandler {
  type: ProjectType;
  name: string;
  icon: string;
  detectType: (path: string) => Promise<boolean>;
  getDetails: (project: Project) => Promise<Partial<ProjectDetails>>;
  getAvailableTasks: (project: Project) => Promise<ProjectTask[]>;
  runTask: (project: Project, task: ProjectTask) => Promise<void>;
  getAdditionalTabs?: () => { id: string; label: string }[];
  renderAdditionalTab?: (tabId: string, project: Project) => React.ReactNode;
} 