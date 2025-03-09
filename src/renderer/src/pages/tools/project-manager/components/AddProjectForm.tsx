import React, { useState, useEffect } from 'react';
import { Project, ProjectType, ProjectSource, ProjectStatus } from '../types';
import styles from '../project-manager.module.scss';
import { detectProjectType } from '../project-handlers';

interface AddProjectFormProps {
  onSubmit: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [path, setPath] = useState<string>('');
  const [type, setType] = useState<ProjectType>(ProjectType.OTHER);
  const [source, setSource] = useState<ProjectSource>(ProjectSource.LOCAL);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [favorite, setFavorite] = useState<boolean>(false);
  const [isDetectingType, setIsDetectingType] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 当路径变化时，尝试自动检测项目类型
  useEffect(() => {
    if (path && source === ProjectSource.LOCAL) {
      detectProjectTypeFromPath();
    }
  }, [path]);

  // 自动检测项目类型
  const detectProjectTypeFromPath = async () => {
    if (!path) return;
    
    setIsDetectingType(true);
    setError(null);
    
    try {
      // 首先检查路径是否存在
      const pathCheckResult = await window.api.projectManager.checkPath(path);
      if (!pathCheckResult.exists) {
        setError('路径不存在');
        setIsDetectingType(false);
        return;
      }
      
      const detectedType = await detectProjectType(path);
      setType(detectedType);
    } catch (err: any) {
      console.error('检测项目类型失败:', err);
      // 不设置错误，只是默认为其他类型
    } finally {
      setIsDetectingType(false);
    }
  };

  // 选择本地目录
  const handleSelectDirectory = async () => {
    try {
      // 使用Electron的对话框API选择目录
      const result = await window.api.projectManager.selectDirectory();
      
      if (result.error) {
        setError(`选择目录失败: ${result.error}`);
        return;
      }
      
      if (result.canceled) {
        return; // 用户取消了选择
      }
      
      const selectedPath = result.path;
      
      // 检查路径是否存在
      const pathCheckResult = await window.api.projectManager.checkPath(selectedPath);
      if (!pathCheckResult.exists) {
        setError('路径不存在');
        return;
      }
      
      setPath(selectedPath);
      
      // 如果没有设置名称，使用目录名作为项目名称
      if (!name) {
        const dirName = selectedPath.split(/[/\\]/).pop();
        if (dirName) {
          setName(dirName);
        }
      }
    } catch (err: any) {
      setError(`选择目录失败: ${err.message}`);
      console.error('选择目录失败:', err);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('请输入项目名称');
      return;
    }
    
    if (!path && source === ProjectSource.LOCAL) {
      setError('请选择项目路径');
      return;
    }
    
    if (!sourceUrl && source === ProjectSource.GIT) {
      setError('请输入Git仓库地址');
      return;
    }
    
    try {
      // 检查路径是否存在
      if (source === ProjectSource.LOCAL) {
        const pathCheckResult = await window.api.projectManager.checkPath(path);
        if (!pathCheckResult.exists) {
          setError('路径不存在');
          return;
        }
      }
      
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        description,
        path: source === ProjectSource.LOCAL ? path : '', // Git项目的路径会在克隆后设置
        type,
        source,
        sourceUrl: source === ProjectSource.GIT ? sourceUrl : undefined,
        status: ProjectStatus.ACTIVE,
        tags: tagsArray,
        favorite,
        customFields: {}
      };
      
      onSubmit(newProject);
    } catch (err: any) {
      setError(`添加项目失败: ${err.message}`);
      console.error('添加项目失败:', err);
    }
  };

  return (
    <div className={styles.addProjectForm}>
      <h3>添加新项目</h3>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">项目名称 *</label>
          <input
            type="text"
            id="name"
            className={styles.inputField}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description">项目描述</label>
          <textarea
            id="description"
            className={styles.valueTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>项目来源 *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                name="source"
                value={ProjectSource.LOCAL}
                checked={source === ProjectSource.LOCAL}
                onChange={() => setSource(ProjectSource.LOCAL)}
              />
              本地目录
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                className={styles.radioInput}
                name="source"
                value={ProjectSource.GIT}
                checked={source === ProjectSource.GIT}
                onChange={() => setSource(ProjectSource.GIT)}
              />
              Git仓库
            </label>
          </div>
        </div>
        
        {source === ProjectSource.LOCAL ? (
          <div className={styles.formGroup}>
            <label htmlFor="path">项目路径 *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="path"
                className={styles.inputField}
                value={path}
                onChange={(e) => setPath(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={handleSelectDirectory}
              >
                浏览...
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label htmlFor="sourceUrl">Git仓库地址 *</label>
            <input
              type="text"
              id="sourceUrl"
              className={styles.inputField}
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://github.com/username/repo.git"
              required
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="type">项目类型</label>
          <select
            id="type"
            className={styles.selectField}
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
          >
            <option value={ProjectType.REACT}>React</option>
            <option value={ProjectType.VUE}>Vue</option>
            <option value={ProjectType.ANGULAR}>Angular</option>
            <option value={ProjectType.NODE}>Node.js</option>
            <option value={ProjectType.PYTHON}>Python</option>
            <option value={ProjectType.JAVA}>Java</option>
            <option value={ProjectType.OTHER}>其他</option>
          </select>
          {isDetectingType && <span style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>检测中...</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="tags">标签 (用逗号分隔)</label>
          <input
            type="text"
            id="tags"
            className={styles.inputField}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="web, frontend, react"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            收藏项目
          </label>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
          >
            添加项目
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectForm; 