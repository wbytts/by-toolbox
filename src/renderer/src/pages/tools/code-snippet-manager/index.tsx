import { useState, useEffect } from 'react';
import { SnippetList } from './components/snippet-list';
import { SnippetForm } from './components/snippet-form';
import { SnippetViewer } from './components/snippet-viewer';
import styles from './code-snippet-manager.module.scss';

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
  description?: string;
  createdAt: number;
  updatedAt: number;
}

const CodeSnippetManager = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

  // 从本地存储加载代码段
  useEffect(() => {
    const savedSnippets = localStorage.getItem('codeSnippets');
    if (savedSnippets) {
      try {
        const parsedSnippets = JSON.parse(savedSnippets) as Snippet[];
        setSnippets(parsedSnippets);
        
        // 提取所有分类
        const uniqueCategories = Array.from(
          new Set(parsedSnippets.map(snippet => snippet.category))
        );
        setCategories(['全部', ...uniqueCategories]);
      } catch (error) {
        console.error('解析代码段数据失败:', error);
        setSnippets([]);
        setCategories(['全部']);
      }
    }
  }, []);

  // 保存代码段到本地存储
  useEffect(() => {
    if (snippets.length > 0) {
      localStorage.setItem('codeSnippets', JSON.stringify(snippets));
      
      // 更新分类列表
      const uniqueCategories = Array.from(
        new Set(snippets.map(snippet => snippet.category))
      );
      setCategories(['全部', ...uniqueCategories]);
    }
  }, [snippets]);

  // 添加新代码段
  const handleAddSnippet = (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newSnippet: Snippet = {
      ...snippet,
      id: `snippet_${now}`,
      createdAt: now,
      updatedAt: now
    };
    
    setSnippets([...snippets, newSnippet]);
    setIsFormVisible(false);
    setEditingSnippet(null);
  };

  // 更新代码段
  const handleUpdateSnippet = (updatedSnippet: Snippet | Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    // 确保updatedSnippet是完整的Snippet类型
    if ('id' in updatedSnippet) {
      const fullUpdatedSnippet = {
        ...updatedSnippet,
        updatedAt: Date.now()
      } as Snippet;
      
      const updatedSnippets = snippets.map(snippet => 
        snippet.id === fullUpdatedSnippet.id 
          ? fullUpdatedSnippet
          : snippet
      );
      
      setSnippets(updatedSnippets);
      setIsFormVisible(false);
      setEditingSnippet(null);
      setSelectedSnippet(fullUpdatedSnippet);
    }
  };

  // 删除代码段
  const handleDeleteSnippet = (id: string) => {
    const updatedSnippets = snippets.filter(snippet => snippet.id !== id);
    setSnippets(updatedSnippets);
    if (selectedSnippet && selectedSnippet.id === id) {
      setSelectedSnippet(null);
    }
  };

  // 编辑代码段
  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsFormVisible(true);
  };

  // 查看代码段
  const handleViewSnippet = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
  };

  // 过滤代码段
  const filteredSnippets = snippets.filter(snippet => {
    const matchesCategory = selectedCategory === '全部' || snippet.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.snippetManager}>
      <div className={styles.snippetHeader}>
        <h1>代码段管理</h1>
        <div className={styles.snippetActions}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索代码段..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={styles.addButton}
            onClick={() => {
              setIsFormVisible(true);
              setEditingSnippet(null);
            }}
          >
            添加代码段
          </button>
        </div>
      </div>
      
      {isFormVisible ? (
        <div className={styles.formContainer}>
          <SnippetForm
            categories={categories}
            onSubmit={editingSnippet ? handleUpdateSnippet : handleAddSnippet}
            onCancel={() => {
              setIsFormVisible(false);
              setEditingSnippet(null);
            }}
            initialData={editingSnippet}
          />
        </div>
      ) : (
        <div className={styles.snippetContent}>
          <div className={styles.categorySidebar}>
            <h3>分类</h3>
            <ul className={styles.categoryList}>
              {categories.map(category => (
                <li
                  key={category}
                  className={`${styles.categoryItem} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.snippetMain}>
            {selectedSnippet ? (
              <SnippetViewer
                snippet={selectedSnippet}
                onEdit={() => handleEditSnippet(selectedSnippet)}
                onDelete={() => {
                  if (window.confirm('确定要删除这个代码段吗？')) {
                    handleDeleteSnippet(selectedSnippet.id);
                  }
                }}
                onBack={() => setSelectedSnippet(null)}
              />
            ) : (
              <SnippetList
                snippets={filteredSnippets}
                onView={handleViewSnippet}
                onEdit={handleEditSnippet}
                onDelete={handleDeleteSnippet}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeSnippetManager; 