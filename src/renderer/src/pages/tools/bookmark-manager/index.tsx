import { useState, useEffect } from 'react';
import { BookmarkList } from './components/bookmark-list';
import { BookmarkForm } from './components/bookmark-form';
import styles from './bookmark-manager.module.scss';

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

  // 添加新书签
  const handleAddBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const now = Date.now();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `bookmark_${now}`,
      createdAt: now
    };
    
    setBookmarks([...bookmarks, newBookmark]);
    setIsFormVisible(false);
    setEditingBookmark(null);
  };

  // 更新书签
  const handleUpdateBookmark = (updatedBookmark: Bookmark) => {
    const updatedBookmarks = bookmarks.map(bookmark => 
      bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
    );
    
    setBookmarks(updatedBookmarks);
    setIsFormVisible(false);
    setEditingBookmark(null);
  };

  // 删除书签
  const handleDeleteBookmark = (id: string) => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
    setBookmarks(updatedBookmarks);
  };

  // 编辑书签
  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsFormVisible(true);
  };

  // 过滤书签
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesCategory = selectedCategory === '全部' || bookmark.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.bookmarkManager}>
      <div className={styles.bookmarkHeader}>
        <h1>网址收藏</h1>
        <div className={styles.bookmarkActions}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索书签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={styles.addButton}
            onClick={() => {
              setIsFormVisible(true);
              setEditingBookmark(null);
            }}
          >
            添加书签
          </button>
        </div>
      </div>
      
      {isFormVisible ? (
        <div className={styles.bookmarkFormContainer}>
          <BookmarkForm
            categories={categories.filter(cat => cat !== '全部')}
            onSubmit={editingBookmark ? handleUpdateBookmark : handleAddBookmark}
            onCancel={() => {
              setIsFormVisible(false);
              setEditingBookmark(null);
            }}
            initialData={editingBookmark}
          />
        </div>
      ) : (
        <div className={styles.bookmarkContent}>
          <div className={styles.categorySidebar}>
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
          
          <div className={styles.bookmarkMain}>
            <BookmarkList
              bookmarks={filteredBookmarks}
              onEdit={handleEditBookmark}
              onDelete={handleDeleteBookmark}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkManager; 