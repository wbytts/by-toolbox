import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Snippet } from '../index';
import styles from './snippet-form.module.scss';

interface SnippetFormProps {
  categories: string[];
  onSubmit: (snippet: Snippet | Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Snippet | null;
}

export const SnippetForm: React.FC<SnippetFormProps> = ({ categories, onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 编程语言选项
  const languageOptions = [
    'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Python', 'Java', 'C#', 'C++', 'C',
    'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Rust', 'Shell', 'SQL', 'JSON', 'XML',
    'YAML', 'Markdown', '其他'
  ];

  // 如果是编辑模式，加载初始数据
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCode(initialData.code);
      setLanguage(initialData.language);
      setCategory(initialData.category);
      setDescription(initialData.description || '');
      setTags(initialData.tags);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!code.trim()) {
      newErrors.code = '代码不能为空';
    }
    
    if (!language) {
      newErrors.language = '请选择编程语言';
    }
    
    if (!category) {
      newErrors.category = '请选择或创建分类';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const snippetData = {
      title: title.trim(),
      code,
      language,
      category,
      description: description.trim(),
      tags,
      ...(initialData ? { id: initialData.id, createdAt: initialData.createdAt, updatedAt: Date.now() } : {})
    };
    
    onSubmit(snippetData as any); // 使用类型断言解决类型不兼容问题
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  return (
    <form className={styles.snippetForm} onSubmit={handleSubmit}>
      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <div className={styles.formGroup}>
            <label htmlFor="title">标题</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? styles.error : ''}
              placeholder="输入代码段标题"
            />
            {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
          </div>
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formCol}>
          <div className={styles.formGroup}>
            <label htmlFor="language">编程语言</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={errors.language ? styles.error : ''}
            >
              <option value="">选择编程语言</option>
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            {errors.language && <div className={styles.errorMessage}>{errors.language}</div>}
          </div>
        </div>
        
        <div className={styles.formCol}>
          <div className={styles.formGroup}>
            <label htmlFor="category">分类</label>
            {isAddingCategory ? (
              <div className={styles.categorySelection}>
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
                  {categories.filter(cat => cat !== '全部').map(cat => (
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
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="code">代码</label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={errors.code ? styles.error : ''}
          placeholder="在此粘贴或输入代码"
        />
        {errors.code && <div className={styles.errorMessage}>{errors.code}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">描述 (可选)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="添加对代码段的描述"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>标签 (可选，按回车或逗号添加)</label>
        <div className={styles.tagsInput}>
          {tags.map((tag, index) => (
            <div key={index} className={styles.tagItem}>
              {tag}
              <span className={styles.tagRemove} onClick={() => handleRemoveTag(tag)}>×</span>
            </div>
          ))}
          <input
            type="text"
            className={styles.tagInput}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            placeholder="添加标签..."
          />
        </div>
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