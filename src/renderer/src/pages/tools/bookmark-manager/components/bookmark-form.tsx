import React, { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: number;
}

interface BookmarkFormProps {
  onSubmit: (bookmark: any) => void;
  onCancel: () => void;
  categories: string[];
  editingBookmark: Bookmark | null;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({ 
  onSubmit, 
  onCancel, 
  categories, 
  editingBookmark 
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setTitle(editingBookmark.title);
      setUrl(editingBookmark.url);
      setCategory(editingBookmark.category);
      setDescription(editingBookmark.description || '');
    } else {
      // 默认选择第一个分类（如果有）
      if (categories.length > 0) {
        setCategory(categories[0]);
      }
    }
  }, [editingBookmark, categories]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!url.trim()) {
      newErrors.url = 'URL不能为空';
    } else if (!isValidUrl(url)) {
      newErrors.url = '请输入有效的URL';
    }
    
    if (!category && !newCategory) {
      newErrors.category = '请选择或创建一个分类';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      // 如果没有协议，添加一个临时协议进行验证
      const urlString = string.startsWith('http') ? string : `https://${string}`;
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const finalCategory = isAddingCategory && newCategory ? newCategory : category;
    
    const bookmarkData = {
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
      category: finalCategory,
      description: description.trim() || undefined
    };
    
    if (editingBookmark) {
      onSubmit({
        ...bookmarkData,
        id: editingBookmark.id,
        createdAt: editingBookmark.createdAt
      });
    } else {
      onSubmit(bookmarkData);
    }
  };

  return (
    <div className="bookmark-form-container">
      <h2>{editingBookmark ? '编辑书签' : '添加新书签'}</h2>
      
      <form className="bookmark-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">标题 *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <div className="error-message">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="url">URL *</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="例如: https://example.com 或 example.com"
            className={errors.url ? 'error' : ''}
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="category">分类 *</label>
          {isAddingCategory ? (
            <div className="new-category-input">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="输入新分类名称"
                className={errors.category ? 'error' : ''}
              />
              <button 
                type="button" 
                className="cancel-category-button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategory('');
                }}
              >
                取消
              </button>
            </div>
          ) : (
            <div className="category-selection">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={errors.category ? 'error' : ''}
              >
                {categories.length === 0 && <option value="">-- 无分类 --</option>}
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button 
                type="button" 
                className="add-category-button"
                onClick={() => setIsAddingCategory(true)}
              >
                新建分类
              </button>
            </div>
          )}
          {errors.category && <div className="error-message">{errors.category}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">描述 (可选)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            取消
          </button>
          <button type="submit" className="submit-button">
            {editingBookmark ? '更新' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}; 