import React, { useState, useEffect } from 'react';
import styles from '../node-manager.module.scss';

interface CacheInfo {
  type: string;
  location: string;
  size: string;
}

export const CacheManager: React.FC = () => {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 获取缓存信息
  const fetchCacheInfo = async () => {
    setLoading(true);
    setError('');
    setStatusMessage('获取缓存信息...');

    try {
      // 模拟从主进程获取缓存信息
      // 实际实现中应该调用window.api.nodeManager.getCacheInfo()
      
      // 临时模拟数据
      const mockCaches = [
        { type: 'npm', location: 'C:\\Users\\User\\AppData\\Local\\npm-cache', size: '256 MB' },
        { type: 'yarn', location: 'C:\\Users\\User\\AppData\\Local\\Yarn\\Cache', size: '128 MB' },
        { type: 'pnpm', location: 'C:\\Users\\User\\AppData\\Local\\pnpm\\store', size: '512 MB' },
        { type: 'node_modules', location: 'C:\\Users\\User\\AppData\\Roaming\\npm\\node_modules', size: '1.2 GB' }
      ];
      
      setCaches(mockCaches);
      setStatusMessage('缓存信息获取成功');
    } catch (err: any) {
      setError(`获取缓存信息出错: ${err.message}`);
      console.error("获取缓存信息异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 清理缓存
  const clearCache = async (cacheType: string) => {
    if (!confirm(`确定要清理 ${cacheType} 缓存吗?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage(`正在清理 ${cacheType} 缓存...`);

    try {
      // 模拟清理缓存
      // 实际实现中应该调用window.api.nodeManager.clearCache(cacheType)
      
      // 更新缓存大小
      setCaches(prev => prev.map(cache => 
        cache.type === cacheType ? { ...cache, size: '0 B' } : cache
      ));
      
      setStatusMessage(`成功清理 ${cacheType} 缓存`);
    } catch (err: any) {
      setError(`清理缓存出错: ${err.message}`);
      console.error("清理缓存异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 打开缓存目录
  const openCacheLocation = async (location: string) => {
    try {
      // 模拟打开目录
      // 实际实现中应该调用window.api.nodeManager.openDirectory(location)
      
      setStatusMessage(`已打开目录: ${location}`);
    } catch (err: any) {
      setError(`打开目录出错: ${err.message}`);
      console.error("打开目录异常：", err);
    }
  };

  // 清理所有缓存
  const clearAllCaches = async () => {
    if (!confirm('确定要清理所有缓存吗?')) {
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('正在清理所有缓存...');

    try {
      // 模拟清理所有缓存
      // 实际实现中应该调用window.api.nodeManager.clearAllCaches()
      
      // 更新所有缓存大小
      setCaches(prev => prev.map(cache => ({ ...cache, size: '0 B' })));
      
      setStatusMessage('成功清理所有缓存');
    } catch (err: any) {
      setError(`清理所有缓存出错: ${err.message}`);
      console.error("清理所有缓存异常：", err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchCacheInfo();
  }, []);

  return (
    <div className={styles.cacheManager}>
      <div className={styles.sectionHeader}>
        <h2>缓存管理</h2>
        <div className={styles.actionButtons}>
          <button 
            className={styles.refreshButton} 
            onClick={fetchCacheInfo} 
            disabled={loading}
          >
            刷新
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={clearAllCaches} 
            disabled={loading}
          >
            清理所有缓存
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>}

      <div className={styles.cacheList}>
        <h3>缓存位置</h3>
        {loading && caches.length === 0 ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <>
            {caches.length === 0 ? (
              <div className={styles.emptyMessage}>没有找到缓存信息</div>
            ) : (
              <div className={styles.cacheItems}>
                {caches.map((cache) => (
                  <div key={cache.type} className={styles.cacheItem}>
                    <div className={styles.cacheInfo}>
                      <div className={styles.cacheType}>{cache.type}</div>
                      <div className={styles.cacheLocation}>{cache.location}</div>
                      <div className={styles.cacheSize}>{cache.size}</div>
                    </div>
                    <div className={styles.cacheActions}>
                      <button 
                        onClick={() => openCacheLocation(cache.location)}
                        disabled={loading}
                        className={styles.useButton}
                      >
                        打开目录
                      </button>
                      <button 
                        onClick={() => clearCache(cache.type)}
                        disabled={loading}
                        className={styles.deleteButton}
                      >
                        清理缓存
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.cacheDescription}>
        <h3>关于缓存</h3>
        <p>
          Node.js相关工具会在本地存储大量缓存文件，包括下载的包、构建产物等。
          定期清理这些缓存可以释放磁盘空间，但可能会导致下次安装包时需要重新下载。
        </p>
        <ul>
          <li><strong>npm缓存</strong>: 存储下载的包和元数据</li>
          <li><strong>yarn缓存</strong>: 存储下载的包和元数据</li>
          <li><strong>pnpm缓存</strong>: 存储内容寻址存储中的包</li>
          <li><strong>node_modules</strong>: 全局安装的包</li>
        </ul>
      </div>
    </div>
  );
}; 