import React, { useState, useEffect } from 'react';
import styles from '../bookmark-manager.module.scss';

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
  initialData: Bookmark | null;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({ 
  onSubmit, 
  onCancel, 
  categories, 
  initialData 
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 如果是编辑模式，加载初始数据
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setCategory(initialData.category);
      setDescription(initialData.description || '');
    }
  }, [initialData]);

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
    
    if (!category) {
      newErrors.category = '请选择或创建分类';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      // 如果没有协议，添加一个临时协议以便URL构造函数能够解析
      const urlString = string.startsWith('http') ? string : `https://${string}`;
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const bookmarkData = {
      title: title.trim(),
      url: url.trim(),
      category,
      description: description.trim(),
      ...(initialData ? { id: initialData.id, createdAt: initialData.createdAt } : {})
    };
    
    onSubmit(bookmarkData);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  return (
    <form className={styles.bookmarkForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="title">标题</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? styles.error : ''}
          placeholder="输入网站标题"
        />
        {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={errors.url ? styles.error : ''}
          placeholder="输入网址，例如: https://example.com"
        />
        {errors.url && <div className={styles.errorMessage}>{errors.url}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="category">分类</label>
        {isAddingCategory ? (
          <div className={styles.newCategoryInput}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="输入新分类名称"
            />
            <button
              type="button"
              className={styles.addCategoryButton}
              onClick={handleAddCategory}
            >
              添加
            </button>
            <button
              type="button"
              className={styles.cancelCategoryButton}
              onClick={() => setIsAddingCategory(false)}
            >
              取消
            </button>
          </div>
        ) : (
          <div className={styles.categorySelection}>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={errors.category ? styles.error : ''}
            >
              <option value="">选择分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              className={styles.addCategoryButton}
              onClick={() => setIsAddingCategory(true)}
            >
              新建分类
            </button>
          </div>
        )}
        {errors.category && <div className={styles.errorMessage}>{errors.category}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">描述 (可选)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="添加对网站的描述"
        />
      </div>
      
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          取消
        </button>
        <button type="submit" className={styles.submitButton}>
          {initialData ? '更新' : '保存'}
        </button>
      </div>
    </form>
  );
}; 