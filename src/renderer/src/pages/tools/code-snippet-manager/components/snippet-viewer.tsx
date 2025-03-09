import React, { useState } from 'react';
import { Snippet } from '../index';
import styles from './snippet-viewer.module.scss';

interface SnippetViewerProps {
  snippet: Snippet;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export const SnippetViewer: React.FC<SnippetViewerProps> = ({ snippet, onEdit, onDelete, onBack }) => {
  const [copyIndicator, setCopyIndicator] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet.code)
      .then(() => {
        setCopyIndicator(true);
        setTimeout(() => setCopyIndicator(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
  };

  return (
    <div className={styles.snippetViewer}>
      <div className={styles.snippetViewerHeader}>
        <div>
          <h2 className={styles.snippetViewerTitle}>{snippet.title}</h2>
          <div className={styles.snippetViewerInfo}>
            <span className={styles.snippetViewerLanguage}>{snippet.language}</span>
            <span className={styles.snippetViewerCategory}>{snippet.category}</span>
          </div>
        </div>
        <button className={styles.backButton} onClick={onBack}>返回列表</button>
      </div>
      
      {snippet.description && (
        <div className={styles.snippetViewerDescription}>{snippet.description}</div>
      )}
      
      {snippet.tags.length > 0 && (
        <div className={styles.snippetViewerTags}>
          {snippet.tags.map((tag, index) => (
            <span key={index} className={styles.snippetTag}>{tag}</span>
          ))}
        </div>
      )}
      
      <div className={styles.snippetViewerCode} onClick={handleCopyCode}>
        {snippet.code}
        <div className={`${styles.copyIndicator} ${copyIndicator ? styles.copyIndicatorVisible : ''}`}>
          已复制到剪贴板
        </div>
      </div>
      
      <div className={styles.snippetViewerActions}>
        <div className={styles.snippetViewerDate}>
          创建于: {formatDate(snippet.createdAt)}
          {snippet.updatedAt > snippet.createdAt && ` | 更新于: ${formatDate(snippet.updatedAt)}`}
        </div>
        <div className={styles.snippetActions}>
          <button className={styles.editButton} onClick={onEdit}>编辑</button>
          <button className={styles.deleteButton} onClick={onDelete}>删除</button>
        </div>
      </div>
    </div>
  );
}; 