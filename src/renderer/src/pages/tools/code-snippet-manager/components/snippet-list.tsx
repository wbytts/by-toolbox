import React from 'react';
import { Snippet } from '../index';
import styles from './snippet-list.module.scss';

interface SnippetListProps {
  snippets: Snippet[];
  onView: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({ snippets, onView, onEdit, onDelete }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (snippets.length === 0) {
    return (
      <div className={styles.emptySnippets}>
        <p>暂无代码段</p>
        <p className={styles.emptyHint}>点击"添加代码段"按钮开始收藏代码</p>
      </div>
    );
  }

  return (
    <div className={styles.snippetList}>
      {snippets.map(snippet => (
        <div key={snippet.id} className={styles.snippetCard}>
          <div className={styles.snippetCardHeader}>
            <h3 className={styles.snippetTitle} onClick={() => onView(snippet)}>
              {snippet.title}
            </h3>
            <div className={styles.snippetLanguage}>{snippet.language}</div>
          </div>
          
          {snippet.description && (
            <div className={styles.snippetDescription}>{snippet.description}</div>
          )}
          
          {snippet.tags.length > 0 && (
            <div className={styles.snippetTags}>
              {snippet.tags.map((tag, index) => (
                <span key={index} className={styles.snippetTag}>{tag}</span>
              ))}
            </div>
          )}
          
          <div className={styles.snippetFooter}>
            <div className={styles.snippetDate}>更新于: {formatDate(snippet.updatedAt)}</div>
            <div className={styles.snippetActions}>
              <button 
                className={styles.viewButton}
                onClick={() => onView(snippet)}
              >
                查看
              </button>
              <button 
                className={styles.editButton}
                onClick={() => onEdit(snippet)}
              >
                编辑
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => {
                  if (window.confirm('确定要删除这个代码段吗？')) {
                    onDelete(snippet.id);
                  }
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 