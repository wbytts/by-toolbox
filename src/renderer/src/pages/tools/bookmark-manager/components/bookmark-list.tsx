import React from 'react';
import styles from '../bookmark-manager.module.scss';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: number;
}

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onEdit, onDelete }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleOpenUrl = (url: string) => {
    // 确保 URL 有协议前缀
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  if (bookmarks.length === 0) {
    return (
      <div className={styles.emptyBookmarks}>
        <p>暂无书签</p>
        <p className={styles.emptyHint}>点击"添加书签"按钮开始收藏网址</p>
      </div>
    );
  }

  return (
    <div className={styles.bookmarkList}>
      {bookmarks.map(bookmark => (
        <div key={bookmark.id} className={styles.bookmarkCard}>
          <div className={styles.bookmarkCardHeader}>
            <h3 className={styles.bookmarkTitle} onClick={() => handleOpenUrl(bookmark.url)}>
              {bookmark.title}
            </h3>
            <div className={styles.bookmarkCategory}>{bookmark.category}</div>
          </div>
          
          <div className={styles.bookmarkUrl} onClick={() => handleOpenUrl(bookmark.url)}>
            {bookmark.url}
          </div>
          
          {bookmark.description && (
            <div className={styles.bookmarkDescription}>{bookmark.description}</div>
          )}
          
          <div className={styles.bookmarkFooter}>
            <div className={styles.bookmarkDate}>添加于: {formatDate(bookmark.createdAt)}</div>
            <div className={styles.bookmarkActions}>
              <button 
                className={styles.editButton}
                onClick={() => onEdit(bookmark)}
              >
                编辑
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => {
                  if (window.confirm('确定要删除这个书签吗？')) {
                    onDelete(bookmark.id);
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