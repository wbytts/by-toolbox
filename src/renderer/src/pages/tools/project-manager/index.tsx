import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './project-manager.module.scss';
import { Project, ProjectType, ProjectSource, ProjectStatus, ProjectDetails } from './types';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import AddProjectForm from './components/AddProjectForm';
import { projectTypeHandlers } from './project-handlers';

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 加载项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  // 当选中项目变化时，加载项目详情
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    } else {
      setProjectDetails(null);
    }
  }, [selectedProjectId]);

  // 加载项目列表
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 从本地存储加载项目列表
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (err: any) {
      setError(`加载项目列表失败: ${err.message}`);
      console.error('加载项目列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载项目详情
  const loadProjectDetails = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('项目不存在');
      }
      
      // 检查项目路径是否存在
      const pathCheckResult = await window.api.projectManager.checkPath(project.path);
      if (!pathCheckResult.exists) {
        setError(`项目路径不存在: ${project.path}`);
        setProjectDetails({ project });
        setLoading(false);
        return;
      }
      
      // 根据项目类型获取详细信息
      const handler = projectTypeHandlers.find(h => h.type === project.type);
      if (handler) {
        const details = await handler.getDetails(project);
        setProjectDetails({
          project,
          ...details
        });
      } else {
        setProjectDetails({ project });
      }
    } catch (err: any) {
      setError(`加载项目详情失败: ${err.message}`);
      console.error('加载项目详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 添加新项目
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newProject: Project = {
        ...project,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 检查项目路径是否存在
      if (project.source === ProjectSource.LOCAL) {
        const pathCheckResult = await window.api.projectManager.checkPath(project.path);
        if (!pathCheckResult.exists) {
          throw new Error(`项目路径不存在: ${project.path}`);
        }
      }
      
      // 如果是Git项目，应该克隆仓库
      if (project.source === ProjectSource.GIT && project.sourceUrl) {
        // 这里应该调用Electron API克隆仓库
        // 暂时跳过
        const cloneResult = await window.api.projectManager.cloneRepository(project.sourceUrl, '');
        if (cloneResult.error) {
          throw new Error(`克隆仓库失败: ${cloneResult.error}`);
        }
        
        // 更新项目路径
        newProject.path = cloneResult.path;
      }
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      // 保存到本地存储
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      setSelectedProjectId(newProject.id);
      setShowAddForm(false);
      setStatusMessage(`项目 "${newProject.name}" 已成功添加`);
      
      // 3秒后清除状态消息
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(`添加项目失败: ${err.message}`);
      console.error('添加项目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 更新项目
  const updateProject = async (updatedProject: Project) => {
    setLoading(true);
    setError(null);
    
    try {
      // 检查项目路径是否存在
      const pathCheckResult = await window.api.projectManager.checkPath(updatedProject.path);
      if (!pathCheckResult.exists) {
        throw new Error(`项目路径不存在: ${updatedProject.path}`);
      }
      
      const updatedProjects = projects.map(p => 
        p.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date().toISOString() } : p
      );
      
      setProjects(updatedProjects);
      
      // 保存到本地存储
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // 更新项目详情
      if (projectDetails && projectDetails.project.id === updatedProject.id) {
        setProjectDetails({
          ...projectDetails,
          project: { ...updatedProject, updatedAt: new Date().toISOString() }
        });
      }
      
      setStatusMessage(`项目 "${updatedProject.name}" 已成功更新`);
      
      // 3秒后清除状态消息
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(`更新项目失败: ${err.message}`);
      console.error('更新项目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const deleteProject = async (projectId: string) => {
    if (!confirm('确定要删除此项目吗？这将只从列表中移除项目，不会删除实际文件。')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const projectToDelete = projects.find(p => p.id === projectId);
      if (!projectToDelete) {
        throw new Error('项目不存在');
      }
      
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // 保存到本地存储
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // 如果当前选中的是被删除的项目，清除选中状态
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setProjectDetails(null);
      }
      
      setStatusMessage(`项目 "${projectToDelete.name}" 已成功删除`);
      
      // 3秒后清除状态消息
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(`删除项目失败: ${err.message}`);
      console.error('删除项目失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 运行项目任务
  const runProjectTask = async (projectId: string, taskId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error('项目不存在');
      }
      
      if (!projectDetails || !projectDetails.tasks) {
        throw new Error('项目任务不存在');
      }
      
      const task = projectDetails.tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('任务不存在');
      }
      
      // 检查项目路径是否存在
      const pathCheckResult = await window.api.projectManager.checkPath(project.path);
      if (!pathCheckResult.exists) {
        throw new Error(`项目路径不存在: ${project.path}`);
      }
      
      // 根据项目类型运行任务
      const handler = projectTypeHandlers.find(h => h.type === project.type);
      if (handler) {
        await handler.runTask(project, task);
        setStatusMessage(`任务 "${task.name}" 已开始运行`);
      } else {
        throw new Error('不支持的项目类型');
      }
    } catch (err: any) {
      setError(`运行任务失败: ${err.message}`);
      console.error('运行任务失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 过滤项目列表
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.projectManager}>
      <div className={styles.header}>
        <h1>项目管理</h1>
        <div>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => setShowAddForm(true)}
          >
            添加项目
          </button>
        </div>
      </div>
      
      {statusMessage && (
        <div className={styles.statusMessage}>
          {statusMessage}
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {showAddForm ? (
        <AddProjectForm 
          onSubmit={addProject}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <div className={styles.mainContent}>
          <div className={styles.projectList}>
            <div className={styles.projectListHeader}>
              <h2>项目列表</h2>
            </div>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="搜索项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <ProjectList
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onDeleteProject={deleteProject}
            />
          </div>
          
          <div className={styles.projectDetail}>
            {selectedProjectId && projectDetails ? (
              <ProjectDetail
                projectDetails={projectDetails}
                onUpdateProject={updateProject}
                onRunTask={runProjectTask}
                onRefresh={() => loadProjectDetails(selectedProjectId)}
              />
            ) : (
              <div className={styles.emptyMessage}>
                {projects.length > 0 
                  ? '请选择一个项目查看详情'
                  : '暂无项目，请添加一个新项目'
                }
              </div>
            )}
          </div>
        </div>
      )}
      
      {loading && (
        <div className={styles.loading}>
          加载中...
        </div>
      )}
    </div>
  );
};

export default ProjectManager; 