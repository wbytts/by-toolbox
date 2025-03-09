import React, { useState } from 'react';
import { Project, ProjectDetails, ProjectTask, ProjectType } from '../types';
import styles from '../project-manager.module.scss';

interface ProjectDetailProps {
  projectDetails: ProjectDetails;
  onUpdateProject: (project: Project) => void;
  onRunTask: (projectId: string, taskId: string) => void;
  onRefresh: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectDetails,
  onUpdateProject,
  onRunTask,
  onRefresh
}) => {
  const { project, dependencies, gitBranches, gitCommits, stats, tasks } = projectDetails;
  
  const [activeTab, setActiveTab] = useState<string>('info');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  
  // 处理项目信息更新
  const handleProjectUpdate = () => {
    onUpdateProject(editedProject);
    setIsEditing(false);
  };
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理复选框变化
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // 处理标签输入
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setEditedProject(prev => ({
      ...prev,
      tags: tagsArray
    }));
  };
  
  // 获取项目类型的显示名称
  const getProjectTypeName = (type: ProjectType): string => {
    switch (type) {
      case ProjectType.REACT:
        return 'React';
      case ProjectType.VUE:
        return 'Vue';
      case ProjectType.ANGULAR:
        return 'Angular';
      case ProjectType.NODE:
        return 'Node.js';
      case ProjectType.PYTHON:
        return 'Python';
      case ProjectType.JAVA:
        return 'Java';
      default:
        return '其他';
    }
  };
  
  // 渲染项目信息标签页
  const renderInfoTab = () => (
    <>
      {isEditing ? (
        <div className={styles.addProjectForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">项目名称</label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.inputField}
              value={editedProject.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">项目描述</label>
            <textarea
              id="description"
              name="description"
              className={styles.valueTextarea}
              value={editedProject.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="path">项目路径</label>
            <input
              type="text"
              id="path"
              name="path"
              className={styles.inputField}
              value={editedProject.path}
              onChange={handleInputChange}
              disabled
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="type">项目类型</label>
            <select
              id="type"
              name="type"
              className={styles.selectField}
              value={editedProject.type}
              onChange={handleInputChange}
            >
              <option value={ProjectType.REACT}>React</option>
              <option value={ProjectType.VUE}>Vue</option>
              <option value={ProjectType.ANGULAR}>Angular</option>
              <option value={ProjectType.NODE}>Node.js</option>
              <option value={ProjectType.PYTHON}>Python</option>
              <option value={ProjectType.JAVA}>Java</option>
              <option value={ProjectType.OTHER}>其他</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="tags">标签 (用逗号分隔)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              className={styles.inputField}
              value={editedProject.tags.join(', ')}
              onChange={handleTagsChange}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                name="favorite"
                checked={editedProject.favorite}
                onChange={handleCheckboxChange}
              />
              收藏项目
            </label>
          </div>
          
          <div className={styles.formActions}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => setIsEditing(false)}
            >
              取消
            </button>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={handleProjectUpdate}
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className={styles.infoSection}>
            <h3>基本信息</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>项目名称</div>
                <div className={styles.infoValue}>{project.name}</div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>项目类型</div>
                <div className={styles.infoValue}>
                  {getProjectTypeName(project.type)}
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>项目路径</div>
                <div className={styles.infoValue}>{project.path}</div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>创建时间</div>
                <div className={styles.infoValue}>
                  {new Date(project.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>最后更新</div>
                <div className={styles.infoValue}>
                  {new Date(project.updatedAt).toLocaleString()}
                </div>
              </div>
              
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>标签</div>
                <div className={styles.infoValue}>
                  {project.tags.length > 0 ? project.tags.join(', ') : '无'}
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h3>项目描述</h3>
            <p>{project.description || '无描述'}</p>
          </div>
          
          {stats && (
            <div className={styles.infoSection}>
              <h3>项目统计</h3>
              <div className={styles.projectStats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{stats.fileCount}</div>
                  <div className={styles.statLabel}>文件数</div>
                </div>
                
                <div className={styles.statItem}>
                  <div className={styles.statValue}>{stats.directoryCount}</div>
                  <div className={styles.statLabel}>目录数</div>
                </div>
                
                {stats.linesOfCode !== undefined && (
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.linesOfCode}</div>
                    <div className={styles.statLabel}>代码行数</div>
                  </div>
                )}
                
                {stats.commitCount !== undefined && (
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.commitCount}</div>
                    <div className={styles.statLabel}>提交次数</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => setIsEditing(true)}
            >
              编辑项目
            </button>
          </div>
        </div>
      )}
    </>
  );
  
  // 渲染依赖标签页
  const renderDependenciesTab = () => (
    <div className={styles.infoSection}>
      <h3>项目依赖</h3>
      {dependencies && dependencies.length > 0 ? (
        <div className={styles.dependencyList}>
          {dependencies.map((dep, index) => (
            <div key={index} className={styles.dependencyItem}>
              <div className={styles.dependencyName}>
                {dep.name}
                <span style={{ marginLeft: '8px', fontSize: '12px', color: dep.type === 'dev' ? '#f44336' : '#4caf50' }}>
                  {dep.type === 'dev' ? '开发依赖' : '生产依赖'}
                </span>
              </div>
              <div className={styles.dependencyVersion}>{dep.version}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          未找到依赖信息
        </div>
      )}
    </div>
  );
  
  // 渲染Git标签页
  const renderGitTab = () => (
    <>
      {gitBranches && gitBranches.length > 0 ? (
        <div className={styles.infoSection}>
          <h3>Git分支</h3>
          <div className={styles.gitInfo}>
            {gitBranches.map((branch, index) => (
              <div key={index} className={styles.branchInfo}>
                <div className={styles.branchName}>
                  {branch.name}
                  {branch.current && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: '#4caf50' }}>
                      当前分支
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          未找到Git分支信息
        </div>
      )}
      
      {gitCommits && gitCommits.length > 0 ? (
        <div className={styles.infoSection}>
          <h3>最近提交</h3>
          <div className={styles.commitList}>
            {gitCommits.map((commit, index) => (
              <div key={index} className={styles.commitItem}>
                <div className={styles.commitHash}>{commit.hash}</div>
                <div className={styles.commitMessage}>{commit.message}</div>
                <div className={styles.commitAuthor}>
                  {commit.author} - {new Date(commit.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          未找到Git提交信息
        </div>
      )}
    </>
  );
  
  // 渲染任务标签页
  const renderTasksTab = () => (
    <div className={styles.infoSection}>
      <h3>可用任务</h3>
      {tasks && tasks.length > 0 ? (
        <div className={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} className={styles.taskItem}>
              <div>
                <div className={styles.taskName}>{task.name}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {task.description}
                </div>
              </div>
              <div className={styles.taskActions}>
                <button
                  className={`${styles.button} ${styles.successButton}`}
                  onClick={() => onRunTask(project.id, task.id)}
                >
                  运行
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyMessage}>
          未找到可用任务
        </div>
      )}
    </div>
  );
  
  return (
    <div className={styles.projectDetail}>
      <div className={styles.projectDetailHeader}>
        <h2>{project.name}</h2>
        <div className={styles.projectActions}>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onRefresh}
          >
            刷新
          </button>
        </div>
      </div>
      
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'info' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('info')}
        >
          基本信息
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'dependencies' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          依赖
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'git' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('git')}
        >
          Git信息
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'tasks' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          任务
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'dependencies' && renderDependenciesTab()}
        {activeTab === 'git' && renderGitTab()}
        {activeTab === 'tasks' && renderTasksTab()}
      </div>
    </div>
  );
};

export default ProjectDetail; 