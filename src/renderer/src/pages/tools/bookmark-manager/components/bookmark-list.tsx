import React from 'react';

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
      <div className="empty-bookmarks">
        <p>暂无书签</p>
        <p className="empty-hint">点击"添加书签"按钮开始收藏网址</p>
      </div>
    );
  }

  return (
    <div className="bookmark-list">
      {bookmarks.map(bookmark => (
        <div key={bookmark.id} className="bookmark-card">
          <div className="bookmark-card-header">
            <h3 className="bookmark-title" onClick={() => handleOpenUrl(bookmark.url)}>
              {bookmark.title}
            </h3>
            <div className="bookmark-category">{bookmark.category}</div>
          </div>
          
          <div className="bookmark-url" onClick={() => handleOpenUrl(bookmark.url)}>
            {bookmark.url}
          </div>
          
          {bookmark.description && (
            <div className="bookmark-description">{bookmark.description}</div>
          )}
          
          <div className="bookmark-footer">
            <div className="bookmark-date">添加于: {formatDate(bookmark.createdAt)}</div>
            <div className="bookmark-actions">
              <button 
                className="edit-button"
                onClick={() => onEdit(bookmark)}
              >
                编辑
              </button>
              <button 
                className="delete-button"
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