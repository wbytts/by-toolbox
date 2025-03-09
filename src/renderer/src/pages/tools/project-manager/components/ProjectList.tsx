import React from 'react';
import { Project, ProjectType } from '../types';
import styles from '../project-manager.module.scss';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onDeleteProject
}) => {
  // 获取项目类型对应的徽章样式
  const getProjectTypeBadgeClass = (type: ProjectType): string => {
    switch (type) {
      case ProjectType.REACT:
        return styles.badgeReact;
      case ProjectType.VUE:
        return styles.badgeVue;
      case ProjectType.ANGULAR:
        return styles.badgeAngular;
      case ProjectType.NODE:
        return styles.badgeNode;
      case ProjectType.PYTHON:
        return styles.badgePython;
      case ProjectType.JAVA:
        return styles.badgeJava;
      default:
        return styles.badgeOther;
    }
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

  return (
    <div className={styles.projectItems}>
      {projects.length === 0 ? (
        <div className={styles.emptyMessage}>
          暂无项目，请添加一个新项目
        </div>
      ) : (
        projects.map(project => (
          <div
            key={project.id}
            className={`${styles.projectItem} ${selectedProjectId === project.id ? styles.projectItemActive : ''}`}
            onClick={() => onSelectProject(project.id)}
          >
            <div className={styles.projectName}>
              {project.name}
              <span className={`${styles.badge} ${getProjectTypeBadgeClass(project.type)}`}>
                {getProjectTypeName(project.type)}
              </span>
              {project.favorite && (
                <span role="img" aria-label="favorite" style={{ marginLeft: 'auto' }}>
                  ⭐
                </span>
              )}
            </div>
            <div className={styles.projectPath}>
              {project.path}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className={`${styles.button} ${styles.dangerButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                删除
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectList; 