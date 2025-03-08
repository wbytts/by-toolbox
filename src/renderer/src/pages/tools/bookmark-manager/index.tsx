import { useState, useEffect } from 'react';
import { BookmarkList } from './components/bookmark-list';
import { BookmarkForm } from './components/bookmark-form';
import './bookmark-manager.css';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  createdAt: number;
}

const BookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 从本地存储加载书签
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(savedBookmarks) as Bookmark[];
        setBookmarks(parsedBookmarks);
        
        // 提取所有分类
        const uniqueCategories = Array.from(
          new Set(parsedBookmarks.map(bookmark => bookmark.category))
        );
        setCategories(['全部', ...uniqueCategories]);
      } catch (error) {
        console.error('解析书签数据失败:', error);
        // 如果解析失败，设置为空数组
        setBookmarks([]);
        setCategories(['全部']);
      }
    }
  }, []);

  // 保存书签到本地存储
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      
      // 更新分类列表
      const uniqueCategories = Array.from(
        new Set(bookmarks.map(bookmark => bookmark.category))
      );
      setCategories(['全部', ...uniqueCategories]);
    }
  }, [bookmarks]);

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    
    setBookmarks([...bookmarks, newBookmark]);
    setIsFormVisible(false);
  };

  const updateBookmark = (updatedBookmark: Bookmark) => {
    setBookmarks(
      bookmarks.map(bookmark => 
        bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
      )
    );
    setEditingBookmark(null);
    setIsFormVisible(false);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormVisible(true);
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesCategory = selectedCategory === '全部' || bookmark.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bookmark-manager">
      <div className="bookmark-header">
        <h1>网址收藏</h1>
        <div className="bookmark-actions">
          <input
            type="text"
            placeholder="搜索书签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            className="add-button"
            onClick={() => {
              setEditingBookmark(null);
              setIsFormVisible(true);
            }}
          >
            添加书签
          </button>
        </div>
      </div>

      <div className="bookmark-content">
        <div className="category-sidebar">
          <h3>分类</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category} 
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className="bookmark-main">
          {isFormVisible ? (
            <BookmarkForm 
              onSubmit={editingBookmark ? updateBookmark : addBookmark}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingBookmark(null);
              }}
              categories={categories.filter(cat => cat !== '全部')}
              editingBookmark={editingBookmark}
            />
          ) : (
            <BookmarkList 
              bookmarks={filteredBookmarks} 
              onEdit={handleEdit} 
              onDelete={deleteBookmark} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkManager; 